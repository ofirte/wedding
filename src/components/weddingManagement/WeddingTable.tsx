import React from "react";
import { useTranslation } from "../../localization/LocalizationContext";

import DSTable from "../common/DSTable";
import {
  createWeddingTableColumns,
  WeddingTableData,
} from "./WeddingTableColumns";
import { WeddingTableEmptyState } from "./WeddingTableEmptyState";
import { Wedding } from "@wedding-plan/types";

interface WeddingTableProps {
  weddings: Wedding[];
  onAddUserToWedding: (wedding: Wedding) => void;
  isUpdating?: boolean;
}

/**
 * Table component displaying all weddings with their information and actions using DSTable
 */
export const WeddingTable: React.FC<WeddingTableProps> = ({
  weddings,
  onAddUserToWedding,
  isUpdating = false,
}) => {
  const { t } = useTranslation();

  // Transform weddings to include id field for DSTable (id already exists in Wedding type)
  const tableData: WeddingTableData[] = weddings.map((wedding) => wedding);

  // Get columns configuration from separate file
  const columns = createWeddingTableColumns({
    t,
    onAddUserToWedding,
    isUpdating,
  });

  // Simple mobile card title function
  const mobileCardTitle = (wedding: WeddingTableData) =>
    wedding.name || t("weddingManagement.noWeddingName");

  if (weddings.length === 0) {
    return (
      <WeddingTableEmptyState message={t("weddingManagement.noWeddings")} />
    );
  }

  return (
    <DSTable
      columns={columns}
      data={tableData}
      showExport={true}
      exportFilename="weddings-export"
      mobileCardTitle={mobileCardTitle}
    />
  );
};
