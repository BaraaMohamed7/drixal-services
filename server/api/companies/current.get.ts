import { getProviderCompany } from "../../utils/services";

export default defineEventHandler(async () => {
  return getProviderCompany("company.read");
});
