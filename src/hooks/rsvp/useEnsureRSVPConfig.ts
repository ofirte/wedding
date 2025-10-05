import { useRSVPConfig } from "./useRSVPConfig";
import { useCreateDefaultRSVPConfig } from "./useCreateDefaultRSVPConfig";

/**
 * Hook to ensure RSVP config exists (creates default if not)
 */
export const useEnsureRSVPConfig = (weddingId?: string) => {
  const { data: config, isLoading } = useRSVPConfig(weddingId);
  const createDefault = useCreateDefaultRSVPConfig();

  const ensureConfig = async () => {
    if (!config && !isLoading) {
      await createDefault.mutateAsync();
    }
  };

  return {
    config,
    ensureConfig,
    hasConfig: !!config,
    isLoading,
    isCreating: createDefault.isPending,
  };
};
