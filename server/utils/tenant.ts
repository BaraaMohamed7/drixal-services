import type { H3Event } from "h3";
import { getRequestURL } from "h3";
import { Company, type CompanyDocument } from "../models/company.schema";
import { CompanyDomain } from "../models/company-domain.schema";

export type TenantContext = {
  kind: "PLATFORM" | "COMPANY";
  company: CompanyDocument | null;
  domain: string;
};

const platformHostnames = new Set(["drixal.com", "www.drixal.com", "api.drixal.com"]);

const isSubdomainOf = (hostname: string, parent: string) =>
  hostname.endsWith(`.${parent}`) && hostname.length > parent.length + 1;

export const resolveTenant = async (event: H3Event): Promise<TenantContext> => {
  const requestUrl = getRequestURL(event);
  const forwardedHost = event.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostname = (forwardedHost || requestUrl.hostname).toLowerCase();

  if (platformHostnames.has(hostname)) {
    return { kind: "PLATFORM", company: null, domain: hostname };
  }

  if (isSubdomainOf(hostname, "drixal.com")) {
    const slug = hostname.split(".")[0];
    const company = await Company.findOne({ slug, status: "ACTIVE" });
    if (company) {
      return { kind: "COMPANY", company, domain: hostname };
    }
  }

  const domain = await CompanyDomain.findOne({ normalizedHostname: hostname, status: "VERIFIED" });
  if (domain) {
    const company = await Company.findOne({ _id: domain.companyId, status: "ACTIVE" });
    if (company) {
      return { kind: "COMPANY", company, domain: hostname };
    }
  }

  return { kind: "PLATFORM", company: null, domain: hostname };
};

export const isPlatformHost = (hostname: string): boolean =>
  platformHostnames.has(hostname.toLowerCase()) || isSubdomainOf(hostname.toLowerCase(), "drixal.com");
