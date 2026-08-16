import type { UserDocument } from "../../models/user.schema";
import { User } from "../../models/user.schema";
import { requirePermission } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, "orders.manage");
  const company = session.company;
  if (!company) throw createError({ statusCode: 403, statusMessage: "Active company membership required" });

  const members = await CompanyMembership.find({ companyId: company._id, status: "ACTIVE" })
    .sort({ createdAt: 1 })
    .populate<{ userId: UserDocument }>({ path: "userId", model: User })
    .select("role userId");

  return {
    items: members.map((member) => ({
      id: String(member._id),
      userId: String(member.userId._id),
      name: member.userId.name,
      role: member.role,
    })),
  };
});