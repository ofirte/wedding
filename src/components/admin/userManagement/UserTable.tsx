import React from "react";
import { useTranslation } from "src/localization/LocalizationContext";
import { UserInfo } from "src/hooks/auth/useUsersInfo";
import DSTable from "src/components/common/DSTable";
import { createUserTableColumns, UserTableData } from "./UserTableColumns";
import { UserTableEmptyState } from "./UserTableEmptyState";

interface UserTableProps {
  users: UserInfo[];
  onEditUser: (user: UserInfo) => void;
  onDeleteUser: (user: UserInfo) => void;
  isUpdating?: boolean;
}

/**
 * Table component displaying all users with their information and actions using DSTable
 */
export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onDeleteUser,
  isUpdating = false,
}) => {
  const { t } = useTranslation();

  // Transform users to include id field for DSTable
  const tableData: UserTableData[] = users.map((user) => ({
    ...user,
    id: user.uid, // Use uid as id for DSTable
  }));

  // Get columns configuration from separate file
  const columns = createUserTableColumns({
    t,
    onEditUser,
    onDeleteUser,
    isUpdating,
  });

  // Simple mobile card title function
  const mobileCardTitle = (user: UserTableData) =>
    user.displayName || user.email || t("userManagement.noDisplayName");

  if (users.length === 0) {
    return <UserTableEmptyState message={t("userManagement.noUsers")} />;
  }

  return (
    <DSTable
      columns={columns}
      data={tableData}
      showExport={true}
      exportFilename="users-export"
      mobileCardTitle={mobileCardTitle}
    />
  );
};
