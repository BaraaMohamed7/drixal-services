import { normalizeCustomerInput } from "../../utils/customers";
import { getProviderCompany } from "../../utils/services";

export default defineEventHandler(async (event) => {
  const company = await getProviderCompany(event, "customers.create");
  const body = await readBody(event);
  const input = normalizeCustomerInput(body || {});
  const customer = await Customer.findOneAndUpdate(
    { companyId: company._id, phone: input.phone },
    { companyId: company._id, ...input },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
  );

  setResponseStatus(event, 201);
  return customer;
});
