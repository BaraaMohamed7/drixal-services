import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import type { H3Event } from "h3";
import { deleteCookie, getCookie, getHeader, getMethod, getRequestURL, setCookie } from "h3";
import { AuthSession } from "../models/auth-session.schema";
import { Company, type CompanyDocument } from "../models/company.schema";
import { CompanyMembership, type CompanyMembershipDocument } from "../models/company-membership.schema";
import { Role } from "../models/role.schema";
import { User } from "../models/user.schema";
import { allCompanyPermissions, getPermissionsForPlatformRole, type Permission } from "./permissions";
import type { TenantContext } from "./tenant";
import type { Types } from "mongoose";

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

export const createAuthSession = async (event: H3Event, userId: string | Types.ObjectId) => {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDuration * 1000);
  await AuthSession.create({ tokenHash: hashToken(token), userId, expiresAt, lastSeenAt: new Date() });

  const tenant = event.context.tenant;
  const isCustomDomain = tenant?.kind === "COMPANY" && tenant?.domain && !tenant.domain.endsWith(".drixal.com");
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions: Record<string, unknown> = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: sessionDuration,
  };

  if (!isProduction && isCustomDomain) {
    cookieOptions.domain = tenant!.domain;
  }

  setCookie(event, cookieName, token, cookieOptions);
};

export const revokeAuthSession = async (event: H3Event) => {
  const token = getCookie(event, cookieName);
  if (token) await AuthSession.deleteOne({ tokenHash: hashToken(token) });

  const tenant = event.context.tenant;
  const isCustomDomain = tenant?.kind === "COMPANY" && tenant?.domain && !tenant.domain.endsWith(".drixal.com");
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions: Record<string, unknown> = { path: "/", secure: isProduction };
  if (!isProduction && isCustomDomain) {
    cookieOptions.domain = tenant!.domain;
  }

  deleteCookie(event, cookieName, cookieOptions);
};

export type AuthContext = {
  authSession: InstanceType<typeof AuthSession>;
  user: InstanceType<typeof User>;
  tenant: TenantContext;
  membership: (CompanyMembershipDocument & { companyId: CompanyDocument }) | null;
  role: InstanceType<typeof Role> | null;
  company: CompanyDocument | null;
  isOwner: boolean;
  isSuperAdmin: boolean;
  permissions: Permission[];
};

export const getAuthContext = async (event: H3Event): Promise<AuthContext | null> => {
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

  const tenant = event.context.tenant;
  if (!tenant) {
    throw createError({ statusCode: 500, statusMessage: "Tenant context not resolved" });
  }
  const isSuperAdmin = user.platformRole === "SUPER_ADMIN";

  let membership: (CompanyMembershipDocument & { companyId: CompanyDocument }) | null = null;
  let company: CompanyDocument | null = null;
  let isOwner = false;
  let role: InstanceType<typeof Role> | null = null;
  let companyPermissions: Permission[] = [];

  if (tenant.kind === "COMPANY" && tenant.company) {
    company = tenant.company;
    const membershipDoc = await CompanyMembership.findOne({ userId: user._id, companyId: company._id, status: "ACTIVE" })
      .populate<{ companyId: CompanyDocument }>({ path: "companyId", model: Company });
    membership = membershipDoc as (CompanyMembershipDocument & { companyId: CompanyDocument }) | null;

    isOwner = !!(company.ownerUserId && String(company.ownerUserId) === String(user._id));

    if (membership?.roleId) {
      role = await Role.findOne({ _id: membership.roleId, companyId: company._id });
      if (role) {
        companyPermissions = role.permissions as Permission[];
      }
    }

    if (isOwner) {
      companyPermissions = allCompanyPermissions;
    }
  }

  const platformPermissions = tenant.kind === "PLATFORM"
    ? getPermissionsForPlatformRole(user.platformRole)
    : [];

  const permissions = [...new Set([...companyPermissions, ...platformPermissions])];

  const allMemberships = await CompanyMembership.find({ userId: user._id, status: "ACTIVE" })
    .populate<{ companyId: CompanyDocument }>({ path: "companyId", model: Company })
    .lean();

  if (Date.now() - new Date(authSession.lastSeenAt).getTime() > 60 * 60 * 1000) {
    await AuthSession.updateOne({ _id: authSession._id }, { lastSeenAt: new Date() });
  }

  return { authSession, user, tenant, membership, role, company, isOwner, isSuperAdmin, permissions, allMemberships };
};

export const requireUser = async (event: H3Event) => {
  assertSameOrigin(event);
  const context = await getAuthContext(event);
  if (!context) throw createError({ statusCode: 401, statusMessage: "Authentication required" });
  return context;
};

export const toSessionDto = (context: AuthContext | null) => {
  if (!context) return { authenticated: false, user: null, tenant: null, company: null, membership: null, isOwner: false, memberships: [], permissions: [] };

  return {
    authenticated: true,
    user: {
      id: String(context.user._id),
      name: context.user.name,
      email: context.user.email,
      type: context.user.type,
      platformRole: context.user.platformRole,
    },
    tenant: {
      kind: context.tenant.kind,
      domain: context.tenant.domain,
    },
    company: context.company
      ? {
          id: String(context.company._id),
          name: context.company.name,
          slug: context.company.slug,
          status: context.company.status,
        }
      : null,
    membership: context.membership
      ? { id: String(context.membership._id), roleId: context.membership.roleId ? String(context.membership.roleId) : null, status: context.membership.status }
      : null,
    isOwner: context.isOwner,
    memberships: (context.allMemberships || [])
      .filter((m) => m.companyId)
      .map((m) => ({
        id: String(m._id),
        roleId: m.roleId ? String(m.roleId) : null,
        status: m.status,
        role: m.role,
        company: {
          id: String((m.companyId as CompanyDocument)._id || m.companyId),
          name: (m.companyId as CompanyDocument).name || "",
          slug: (m.companyId as CompanyDocument).slug || "",
          status: (m.companyId as CompanyDocument).status || "ACTIVE",
        },
      })),
    permissions: context.permissions,
  };
};
