import type { AppPermission } from "~/composables/useAuth";

export type ProviderPermission = AppPermission;

export const useProviderSession = () => {
  const auth = useAuth();
  return {
    data: auth.session,
    hasPermission: auth.hasPermission,
    providerHome: auth.workspaceHome,
  };
};
