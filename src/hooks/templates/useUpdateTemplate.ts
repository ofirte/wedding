import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templatesAPI } from "src/api/rsvp/templateApi";
import { globalTemplatesAPI } from "src/api/globalTemplates";
import { TemplateDocument } from "@wedding-plan/types";

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      updates,
      weddingId,
    }: {
      templateId: string;
      updates: Partial<TemplateDocument>;
      weddingId?: string;
    }) => {
      if (!weddingId) {
        // Update global template
        return globalTemplatesAPI.update(templateId, updates);
      }
      // Update wedding-specific template
      return templatesAPI.update(templateId, updates, weddingId);
    },
    onSuccess: () => {
      // Invalidate templates queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["weddingTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["globalTemplates"] });
    },
    onError: (error) => {
      console.error("Error updating template:", error);
    },
  });
};
