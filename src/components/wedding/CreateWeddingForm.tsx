import * as React from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Stack,
  Grid,
  Box,
} from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { useTranslation } from "src/localization/LocalizationContext";
import { useForm, Controller } from "react-hook-form";
import { Wedding } from "@wedding-plan/types";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useCurrentUser } from "src/hooks/auth";
import { LoadingState } from "../common";
export type WeddingFormValues = Omit<
  Wedding,
  "id" | "createdAt" | "updatedAt" | "weddingMembers" | "date" | "startTime"
> & { date: Date | null; startTime: Date | null };
export interface CreateWeddingFormProps {
  defaultValues?: Partial<WeddingFormValues>;
  onSubmit: (
    weddingData: Omit<Wedding, "id" | "createdAt" | "userIds" | "members">,
    userId: string
  ) => void | Promise<void>;
  loading?: boolean;
}

export const CreateWeddingForm: React.FC<CreateWeddingFormProps> = ({
  defaultValues,
  onSubmit,
  loading,
}) => {
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<WeddingFormValues>({
    defaultValues: {
      ...defaultValues,
      date: null,
    },
  });
  const { t, language } = useTranslation();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  if (isLoadingUser) {
    return <LoadingState />;
  }
  if (!currentUser) {
    return <div>{t("errors.userNotFound")}</div>;
  }
  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={3}>
          <TextField
            required
            fullWidth
            id="weddingName"
            label={t("common.weddingName")}
            placeholder={t("placeholders.exampleWeddingName")}
            {...register("name", { required: true })}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="brideName"
                label={t("common.brideName")}
                {...register("brideName", { required: true })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="groomName"
                label={t("common.groomName")}
                {...register("groomName", { required: true })}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="vendorName"
                label={t("weddingSettings.venueName")}
                {...register("venueName", { required: true })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="startTime"
                control={control}
                rules={{ required: "Start time is required" }}
                render={({ field }) => (
                  <TimePicker
                    label={t("weddingSettings.startTime")}
                    value={field.value ?? null}
                    onChange={field.onChange}
                    ampm={language === "en"}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.startTime,
                        helperText: errors.startTime?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="date"
            control={control}
            defaultValue={null}
            rules={{ required: "Wedding date is required" }}
            render={({ field }) => (
              <DatePicker
                {...field}
                value={field.value ?? null} // ensure never undefined
                label={t("common.weddingDate")}
                slotProps={{
                  textField: {
                    error: !!errors.date,
                    helperText: errors.date?.message,
                  },
                }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={handleSubmit((data) => {
              if (!data.date) return;
              onSubmit(
                {
                  ...data,
                  startTime: data.startTime
                    ? data.startTime.toISOString().substring(11, 16)
                    : undefined,
                  date: new Date(
                    Date.UTC(
                      data.date.getFullYear(),
                      data.date.getMonth(),
                      data.date.getDate()
                    )
                  ),
                },
                currentUser.uid
              );
            })}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              t("common.createWedding")
            )}
          </Button>
        </Stack>
      </LocalizationProvider>
    </Box>
  );
};
