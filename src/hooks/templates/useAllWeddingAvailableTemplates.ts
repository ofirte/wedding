import { useGlobalTemplates } from "../globalTemplates";
import { useWeddingTemplates } from "./useWeddingTemplates";

export const useAllWeddingAvailableTemplates = () => {
  const { data: globalTemplates, isLoading: isLoadingGlobal } =
    useGlobalTemplates();
  const { data: weddingTemplates, isLoading: isLoadingWedding } =
    useWeddingTemplates();
  const combinedTemplates = [
    ...(globalTemplates?.templates || []),
    ...(weddingTemplates?.templates || []),
  ];
  return {
    data: combinedTemplates,
    isLoading: isLoadingGlobal || isLoadingWedding,
  };
};
