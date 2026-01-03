import { useQuery } from "@tanstack/react-query";
import { getGlobalTemplates } from "../../api/globalTemplates";

/**
 * Hook to fetch global templates from both Twilio and Firebase
 * Returns only templates that exist in both sources (intersection)
 * @returns Query result object for combined global templates
 */
export const useGlobalTemplates = () => {

  const query = useQuery({
    queryKey: ["globalTemplates"],
    queryFn: () => getGlobalTemplates(),
  });

  // TODO: Implement background sync approval statuses if needed in the future
  // useEffect(() => {
  //   if (
  //     syncApprovalStatus &&
  //     query.isSuccess &&
  //     query.data?.templates &&
  //     query.data.templates.length > 0
  //   ) {
  //     // Run sync in background for global templates
  //   }
  // }, [syncApprovalStatus, query.isSuccess, query.data?.templates]);

  return query;
};
