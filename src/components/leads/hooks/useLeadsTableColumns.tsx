import { useMemo, useCallback, RefObject } from "react";
import { Lead, LeadStatus, LeadSource, LeadPaymentStatus } from "@wedding-plan/types";
import { Column } from "../../common/DSTable";
import { DSEditableTextCell, DSAutocompleteCell, DSSelectCell, DSSelectOption } from "../../common/cells";
import { LeadStatusColors, LeadPaymentStatusColors, LeadSourceColors } from "../leadsUtils";
import { IconButton, Tooltip } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";

const ALL_STATUSES: LeadStatus[] = [
  "new",
  "initial_contact",
  "contract_suggested",
  "contract_signed",
  "done",
  "lost",
];

const ALL_PAYMENT_STATUSES: LeadPaymentStatus[] = [
  "awaiting_payment",
  "advance_paid",
  "paid_in_full",
];

const ALL_SOURCES: LeadSource[] = [
  "website",
  "referral",
  "instagram",
  "facebook",
  "google",
  "wedding_fair",
  "direct",
  "other",
];

interface UseLeadsTableColumnsProps {
  t: (key: string) => string;
  editValue: string;
  inputRef: RefObject<HTMLInputElement>;
  isEditing: (rowId: string | number, field: keyof Lead) => boolean;
  handleCellClick: (row: Lead, field: keyof Lead) => void;
  handleCellBlur: (row: Lead, field: keyof Lead) => void;
  handleKeyDown: (e: React.KeyboardEvent, row: Lead, field: keyof Lead) => void;
  setEditValue: (value: string) => void;
  serviceOptions: string[];
  onStatusChange: (lead: Lead, newStatus: LeadStatus) => void;
  onPaymentStatusChange: (lead: Lead, newStatus: LeadPaymentStatus) => void;
  onSourceChange: (lead: Lead, newSource: LeadSource) => void;
  onOpenActivity: (lead: Lead) => void;
}

export const useLeadsTableColumns = ({
  t,
  editValue,
  inputRef,
  isEditing,
  handleCellClick,
  handleCellBlur,
  handleKeyDown,
  setEditValue,
  serviceOptions,
  onStatusChange,
  onPaymentStatusChange,
  onSourceChange,
  onOpenActivity,
}: UseLeadsTableColumnsProps): Column<Lead>[] => {
  const isOverdue = useCallback((followUpDate?: string) => {
    if (!followUpDate) return false;
    return new Date(followUpDate) < new Date();
  }, []);

  const formatDate = useCallback((value: string | number | null | undefined) => {
    if (!value) return "";
    return new Date(value as string).toLocaleDateString();
  }, []);

  const formatCurrency = useCallback((value: string | number | null | undefined) => {
    if (!value) return "";
    return `₪${(value as number).toLocaleString()}`;
  }, []);

  const statusOptions: DSSelectOption<LeadStatus>[] = useMemo(
    () => ALL_STATUSES.map((status) => ({ value: status, label: t(`leads.statuses.${status}`) })),
    [t]
  );

  const paymentStatusOptions: DSSelectOption<LeadPaymentStatus>[] = useMemo(
    () => ALL_PAYMENT_STATUSES.map((status) => ({ value: status, label: t(`leads.paymentStatuses.${status}`) })),
    [t]
  );

  const sourceOptions: DSSelectOption<LeadSource>[] = useMemo(
    () => ALL_SOURCES.map((source) => ({ value: source, label: t(`leads.sources.${source}`) })),
    [t]
  );

  return useMemo(
    () => [
      {
        id: "name",
        label: t("leads.columns.name"),
        sortable: true,
        sticky: true,
        minWidth: 200,
        render: (lead) => (
          <DSEditableTextCell
            value={lead.name}
            isEditing={isEditing(lead.id, "name")}
            editValue={editValue}
            inputRef={inputRef}
            fontWeight={600}
            onStartEdit={() => handleCellClick(lead, "name")}
            onEditValueChange={setEditValue}
            onBlur={() => handleCellBlur(lead, "name")}
            onKeyDown={(e) => handleKeyDown(e, lead, "name")}
          />
        ),
      },
      {
        id: "email",
        label: t("leads.columns.email"),
        sortable: true,
        minWidth: 200,
        render: (lead) => (
          <DSEditableTextCell
            value={lead.email}
            isEditing={isEditing(lead.id, "email")}
            editValue={editValue}
            inputRef={inputRef}
            onStartEdit={() => handleCellClick(lead, "email")}
            onEditValueChange={setEditValue}
            onBlur={() => handleCellBlur(lead, "email")}
            onKeyDown={(e) => handleKeyDown(e, lead, "email")}
          />
        ),
      },
      {
        id: "phone",
        label: t("leads.columns.phone"),
        sortable: true,
        minWidth: 150,
        render: (lead) => (
          <DSEditableTextCell
            value={lead.phone}
            isEditing={isEditing(lead.id, "phone")}
            editValue={editValue}
            inputRef={inputRef}
            onStartEdit={() => handleCellClick(lead, "phone")}
            onEditValueChange={setEditValue}
            onBlur={() => handleCellBlur(lead, "phone")}
            onKeyDown={(e) => handleKeyDown(e, lead, "phone")}
          />
        ),
      },
      {
        id: "weddingDate",
        label: t("leads.columns.weddingDate"),
        sortable: true,
        minWidth: 150,
        render: (lead) => (
          <DSEditableTextCell
            value={lead.weddingDate}
            isEditing={isEditing(lead.id, "weddingDate")}
            editValue={editValue}
            inputRef={inputRef}
            type="date"
            formatDisplay={formatDate}
            onStartEdit={() => handleCellClick(lead, "weddingDate")}
            onEditValueChange={setEditValue}
            onBlur={() => handleCellBlur(lead, "weddingDate")}
            onKeyDown={(e) => handleKeyDown(e, lead, "weddingDate")}
          />
        ),
      },
      {
        id: "status",
        label: t("leads.columns.status"),
        sortable: true,
        minWidth: 160,
        render: (lead) => (
          <DSSelectCell
            value={lead.status}
            options={statusOptions}
            colorMap={LeadStatusColors}
            onChange={(newStatus) => onStatusChange(lead, newStatus)}
          />
        ),
        filterConfig: {
          id: "status",
          type: "multiple",
          label: t("leads.columns.status"),
          options: statusOptions,
        },
      },
      {
        id: "paymentStatus",
        label: t("leads.columns.paymentStatus"),
        sortable: true,
        minWidth: 150,
        render: (lead) => (
          <DSSelectCell
            value={lead.paymentStatus || "awaiting_payment"}
            options={paymentStatusOptions}
            colorMap={LeadPaymentStatusColors}
            onChange={(newStatus) => onPaymentStatusChange(lead, newStatus)}
          />
        ),
        filterConfig: {
          id: "paymentStatus",
          type: "multiple",
          label: t("leads.columns.paymentStatus"),
          options: paymentStatusOptions,
        },
      },
      {
        id: "source",
        label: t("leads.columns.source"),
        sortable: true,
        minWidth: 150,
        render: (lead) => (
          <DSSelectCell
            value={lead.source || "website"}
            options={sourceOptions}
            colorMap={LeadSourceColors}
            onChange={(newSource) => onSourceChange(lead, newSource)}
          />
        ),
        filterConfig: {
          id: "source",
          type: "multiple",
          label: t("leads.columns.source"),
          options: sourceOptions,
        },
      },
      {
        id: "budget",
        label: t("leads.columns.budget"),
        sortable: true,
        minWidth: 130,
        render: (lead) => (
          <DSEditableTextCell
            value={lead.budget}
            isEditing={isEditing(lead.id, "budget")}
            editValue={editValue}
            inputRef={inputRef}
            type="number"
            formatDisplay={formatCurrency}
            onStartEdit={() => handleCellClick(lead, "budget")}
            onEditValueChange={setEditValue}
            onBlur={() => handleCellBlur(lead, "budget")}
            onKeyDown={(e) => handleKeyDown(e, lead, "budget")}
          />
        ),
      },
      {
        id: "quotation",
        label: t("leads.columns.quotation"),
        sortable: true,
        minWidth: 130,
        render: (lead) => (
          <DSEditableTextCell
            value={lead.quotation}
            isEditing={isEditing(lead.id, "quotation")}
            editValue={editValue}
            inputRef={inputRef}
            type="number"
            formatDisplay={formatCurrency}
            onStartEdit={() => handleCellClick(lead, "quotation")}
            onEditValueChange={setEditValue}
            onBlur={() => handleCellBlur(lead, "quotation")}
            onKeyDown={(e) => handleKeyDown(e, lead, "quotation")}
          />
        ),
      },
      {
        id: "advanceAmount",
        label: t("leads.columns.advanceAmount"),
        sortable: true,
        minWidth: 130,
        render: (lead) => (
          <DSEditableTextCell
            value={lead.advanceAmount}
            isEditing={isEditing(lead.id, "advanceAmount")}
            editValue={editValue}
            inputRef={inputRef}
            type="number"
            formatDisplay={formatCurrency}
            onStartEdit={() => handleCellClick(lead, "advanceAmount")}
            onEditValueChange={setEditValue}
            onBlur={() => handleCellBlur(lead, "advanceAmount")}
            onKeyDown={(e) => handleKeyDown(e, lead, "advanceAmount")}
          />
        ),
      },
      {
        id: "service",
        label: t("leads.columns.service"),
        sortable: true,
        minWidth: 180,
        render: (lead) => (
          <DSAutocompleteCell
            value={lead.service}
            options={serviceOptions}
            isEditing={isEditing(lead.id, "service")}
            editValue={editValue}
            inputRef={inputRef}
            onStartEdit={() => handleCellClick(lead, "service")}
            onEditValueChange={setEditValue}
            onBlur={() => handleCellBlur(lead, "service")}
            onKeyDown={(e) => handleKeyDown(e, lead, "service")}
          />
        ),
        filterConfig: {
          id: "service",
          type: "multiple",
          label: t("leads.columns.service"),
          options: (data: Lead[]) => {
            const uniqueServices = Array.from(new Set(data.map((lead) => lead.service).filter(Boolean))) as string[];
            return uniqueServices.map((service) => ({ value: service, label: service }));
          },
        },
      },
      {
        id: "followUpDate",
        label: t("leads.columns.followUp"),
        sortable: true,
        minWidth: 150,
        render: (lead) => (
          <DSEditableTextCell
            value={lead.followUpDate}
            isEditing={isEditing(lead.id, "followUpDate")}
            editValue={editValue}
            inputRef={inputRef}
            type="date"
            formatDisplay={formatDate}
            showWarning={isOverdue(lead.followUpDate)}
            warningTooltip={t("leads.messages.followUpOverdue")}
            onStartEdit={() => handleCellClick(lead, "followUpDate")}
            onEditValueChange={setEditValue}
            onBlur={() => handleCellBlur(lead, "followUpDate")}
            onKeyDown={(e) => handleKeyDown(e, lead, "followUpDate")}
          />
        ),
      },
      {
        id: "actions",
        label: "",
        sortable: false,
        minWidth: 50,
        render: (lead) => (
          <Tooltip title={t("leads.actions.viewActivity")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenActivity(lead);
              }}
              sx={{ color: "text.secondary" }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [
      t,
      editValue,
      inputRef,
      isEditing,
      handleCellClick,
      handleCellBlur,
      handleKeyDown,
      setEditValue,
      statusOptions,
      paymentStatusOptions,
      sourceOptions,
      serviceOptions,
      onStatusChange,
      onPaymentStatusChange,
      onSourceChange,
      onOpenActivity,
      formatDate,
      formatCurrency,
      isOverdue,
    ]
  );
};
