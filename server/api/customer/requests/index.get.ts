import { Service } from "../../../models/service.schema";
import { requireUser } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  const items = await ServiceRequest.find({ requesterUserId: session.user._id })
    .populate({ path: "serviceId", model: Service })
    .populate("companyId")
    .sort({ createdAt: -1 })
    .limit(100);
  return { items };
});
