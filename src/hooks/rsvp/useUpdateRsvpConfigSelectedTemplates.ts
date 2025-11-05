import { TemplatesCategories } from "@wedding-plan/types";
import { updateSelectedTemplates } from "../../api/rsvp/rsvpQuestionsApi";
import { useWeddingMutation } from "../common/useWeddingMutation";
import { useQueryClient } from "@tanstack/react-query";

interface UpdateSelectedTemplatesVariables {
  category: TemplatesCategories;
  templateFireBaseId: string;
  templateSid: string;
  isGlobal: boolean;
}

export const useUpdateRsvpConfigSelectedTemplates = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, UpdateSelectedTemplatesVariables>({
    mutationFn: (
      { category, templateFireBaseId, templateSid, isGlobal },
      weddingId
    ) =>
      updateSelectedTemplates(
        category,
        { templateFireBaseId, templateSid, isGlobal },
        weddingId
      ),
    options: {
      onSuccess: () => {
        // Invalidate RSVP config queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: ["rsvpConfig"],
        });
      },
    },
  });
};
