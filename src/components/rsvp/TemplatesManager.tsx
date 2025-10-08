import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useParams } from "react-router";
import { useTranslation } from "../../localization/LocalizationContext";
import { useCreateTemplate, useTemplates } from "../../hooks/rsvp";
import CreateTemplateForm from "./CreateTemplateForm";
import { CreateTemplateRequest } from "../../api/rsvp/templateApi";
import DSTable from "../common/DSTable";
import {
  createTemplateColumns,
  transformTemplateData,
  TemplateTableRow,
} from "./TemplateColumns";

const TemplatesManager: React.FC = () => {
  const { t } = useTranslation();
  const { weddingId } = useParams<{ weddingId: string }>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const createTemplateMutation = useCreateTemplate();
  const { data: templatesData, isLoading, error } = useTemplates();

  const handleCreateTemplate = (templateData: CreateTemplateRequest) => {
    createTemplateMutation.mutate(
      { templateData, userId: "current-user" }, // TODO: Replace with actual user ID
      {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      }
    );
  };

  const columns = useMemo(() => createTemplateColumns(t), [t]);
  const tableData: TemplateTableRow[] = useMemo(() => {
    const templates = templatesData?.templates || [];
    return transformTemplateData(templates);
  }, [templatesData?.templates]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t("templates.loadError")}:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">{t("templates.title")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
        >
          {t("templates.createNew")}
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("templates.description")}
      </Typography>

      {tableData.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t("templates.noTemplates")}
        </Alert>
      ) : (
        <DSTable data={tableData} columns={columns} />
      )}

      <CreateTemplateForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTemplate}
        isSubmitting={createTemplateMutation.isPending}
        weddingId={weddingId}
      />

      {createTemplateMutation.isSuccess && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ✅ {t("templates.createSuccess")} SID:{" "}
          {createTemplateMutation.data?.sid}
        </Alert>
      )}

      {createTemplateMutation.isError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          ❌ {t("templates.createError")}{" "}
          {createTemplateMutation.error instanceof Error
            ? createTemplateMutation.error.message
            : "Unknown error"}
        </Alert>
      )}
    </Box>
  );
};

export default TemplatesManager;
