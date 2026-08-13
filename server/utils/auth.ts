import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import type { H3Event } from "h3";
import { deleteCookie, getCookie, getHeader, getMethod, getRequestURL, setCookie } from "h3";
import { AuthSession } from "../models/auth-session.schema";
import { Company } from "../models/company.schema";
import { CompanyMembership } from "../models/company-membership.schema";
import { User } from "../models/user.schema";
import { getPermissionsForPlatformRole, getPermissionsForRole } from "./permissions";

const sessionDuration = 60 * 60 * 24 * 14;
const cookieName = process.env.NODE_ENV === "production" ? "__Host-drixal.sid" : "drixal.sid";

export const hashPassword = async (password: string) => {
  if (password.length < 8 || password.length > 128) {
    throw createError({ statusCode: 400, statusMessage: "Password must be between 8 and 128 characters" });
  }

  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    hashLength: 32,
  });
};

export const verifyPassword = async (password: string, encoded: string) => argon2.verify(encoded, password);

const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url");

export const assertSameOrigin = (event: H3Event) => {
  if (["GET", "HEAD", "OPTIONS"].includes(getMethod(event))) return;

  const origin = getHeader(event, "origin");
  if (!origin) throw createError({ statusCode: 403, statusMessage: "Origin header required" });

  const forwardedHost = getHeader(event, "x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = getHeader(event, "x-forwarded-proto")?.split(",")[0]?.trim();
  const requestUrl = getRequestURL(event);
  const expectedOrigin = process.env.APP_ORIGIN || (forwardedHost ? `${forwardedProto || requestUrl.protocol.replace(":", "") }://${forwardedHost}` : requestUrl.origin);
  if (origin !== expectedOrigin) {
    throw createError({ statusCode: 403, statusMessage: "Cross-origin request rejected" });
  }
};

export const createAuthSession = async (event: H3Event, userId: unknown) => {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDuration * 1000);
  await AuthSession.create({ tokenHash: hashToken(token), userId, expiresAt, lastSeenAt: new Date() });
  setCookie(event, cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDuration,
  });
};

export const revokeAuthSession = async (event: H3Event) => {
  const token = getCookie(event, cookieName);
  if (token) await AuthSession.deleteOne({ tokenHash: hashToken(token) });
  deleteCookie(event, cookieName, { path: "/", secure: process.env.NODE_ENV === "production" });
};

export const getAuthContext = async (event: H3Event) => {
  const token = getCookie(event, cookieName);
  if (!token) return null;

  const authSession = await AuthSession.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).select("+tokenHash");
  if (!authSession) {
    deleteCookie(event, cookieName, { path: "/", secure: process.env.NODE_ENV === "production" });
    return null;
  }

  const user = await User.findOne({ _id: authSession.userId, status: "ACTIVE" });
  if (!user) {
    await authSession.deleteOne();
    deleteCookie(event, cookieName, { path: "/", secure: process.env.NODE_ENV === "production" });
    return null;
  }

  const memberships = await CompanyMembership.find({ userId: user._id, status: "ACTIVE" })
    .sort({ createdAt: 1 })
    .populate({ path: "companyId", model: Company });
  const membership = authSession.activeWorkspaceType === "COMPANY" && authSession.activeCompanyId
    ? memberships.find((item) => String(item.companyId?._id || item.companyId) === String(authSession.activeCompanyId)) || null
    : null;
  const company = membership?.companyId && typeof membership.companyId === "object" && "_id" in membership.companyId ? membership.companyId : null;
  const platformPermissions = authSession.activeWorkspaceType === "PLATFORM" ? getPermissionsForPlatformRole(user.platformRole) : [];
  const permissions = [...new Set([...getPermissionsForRole(membership?.role), ...platformPermissions])];

  if ((authSession.activeWorkspaceType === "COMPANY" || authSession.activeCompanyId) && !membership) {
    authSession.activeWorkspaceType = "PERSONAL";
    authSession.activeCompanyId = undefined;
    await authSession.save();
  }

  if (Date.now() - new Date(authSession.lastSeenAt).getTime() > 60 * 60 * 1000) {
    await AuthSession.updateOne({ _id: authSession._id }, { lastSeenAt: new Date() });
  }

  return { authSession, user, memberships, membership, company, permissions };
};

export const requireUser = async (event: H3Event) => {
  assertSameOrigin(event);
  const context = await getAuthContext(event);
  if (!context) throw createError({ statusCode: 401, statusMessage: "Authentication required" });
  return context;
};

export const toSessionDto = (context: Awaited<ReturnType<typeof getAuthContext>>) => {
  if (!context) return { authenticated: false, user: null, activeWorkspace: null, company: null, membership: null, memberships: [], permissions: [] };

  return {
    authenticated: true,
    user: {
      id: String(context.user._id),
      name: context.user.name,
      email: context.user.email,
      platformRole: context.user.platformRole,
    },
    activeWorkspace: context.company
      ? { type: "COMPANY" as const, companyId: String(context.company._id) }
      : { type: context.authSession.activeWorkspaceType === "PLATFORM" ? "PLATFORM" as const : "PERSONAL" as const },
    company: context.company
      ? {
          id: String(context.company._id),
          name: context.company.name,
          slug: context.company.slug,
          status: context.company.status,
        }
      : null,
    membership: context.membership
      ? { id: String(context.membership._id), role: context.membership.role, status: context.membership.status }
      : null,
    memberships: context.memberships.map((item) => {
      const company = item.companyId && typeof item.companyId === "object" && "_id" in item.companyId ? item.companyId : null;
      return {
        id: String(item._id),
        role: item.role,
        company: company ? { id: String(company._id), name: company.name, slug: company.slug, status: company.status } : null,
      };
    }),
    permissions: context.permissions,
  };
};
