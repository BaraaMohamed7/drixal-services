import { getProviderCompany } from "../../utils/services";

export default defineEventHandler(async (event) => {
  return getProviderCompany(event, "company_settings.read");
});
