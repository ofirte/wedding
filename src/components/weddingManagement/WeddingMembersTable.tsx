import React from "react";
import { Chip, Box, Typography, Avatar, Stack } from "@mui/material";
import { DSTable } from "../common";
import { useUsersByIds } from "../../hooks/auth/useUsersByIds";

import { WeddingMembers, WeddingPlans } from "../../api/wedding/types";
import { useTranslation } from "../../localization/LocalizationContext";
import {
  getWeddingMembersTableColumns,
  MemberTableRow,
} from "./WeddingMembersTableColumns";
import { WeddingMembersDeleteDialog } from "./WeddingMembersDeleteDialog";

interface WeddingMembersTableProps {
  weddingId: string;
  members: WeddingMembers;
}

export const WeddingMembersTable: React.FC<WeddingMembersTableProps> = ({
  weddingId,
  members,
}) => {
  const { t } = useTranslation();

  // Extract user IDs from members
  const userIds = Object.keys(members);
  const { data: users = [], isLoading } = useUsersByIds(userIds);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null
  );
  const onDeleteWeddingMember = (userId: string) => {
    // Implement the logic to delete a wedding member
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const columns = React.useMemo(
    () => getWeddingMembersTableColumns(onDeleteWeddingMember, t),
    [t]
  );
  // Transform members data for table
  const tableData: MemberTableRow[] = React.useMemo(() => {
    return userIds.map((userId) => ({
      id: userId,
      userId,
      user: users.find((user) => user.uid === userId),
      memberInfo: members[userId],
    }));
  }, [userIds, users, members]);

  const renderMobileCard = (row: MemberTableRow) => (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Avatar
          src={row.user?.photoURL}
          alt={row.user?.displayName || row.user?.email}
          sx={{ width: 40, height: 40 }}
        >
          {row.user?.displayName?.[0] || row.user?.email?.[0] || "?"}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" fontWeight="medium">
            {row.user?.displayName || t("userManagement.noDisplayName")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.user?.email}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Chip
          label={row.user?.role || "user"}
          size="small"
          variant="outlined"
          color={row.user?.role === "admin" ? "primary" : "default"}
        />
        <Chip
          label={t(`weddingManagement.plans.${row.memberInfo.plan}`)}
          size="small"
          variant="filled"
          color={
            row.memberInfo.plan === WeddingPlans.PAID ? "success" : "default"
          }
        />
      </Stack>
    </Box>
  );

  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("common.loading")}
      </Typography>
    );
  }

  if (tableData.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("weddingManagement.noWeddings")}
      </Typography>
    );
  }
  console.log(selectedUserId, isDeleteDialogOpen);
  return (
    <>
      <WeddingMembersDeleteDialog
        open={isDeleteDialogOpen && !!selectedUserId}
        memberId={selectedUserId ?? ""}
        weddingId={weddingId}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUserId(null);
        }}
      />
      <DSTable
        columns={columns}
        data={tableData}
        renderMobileCard={renderMobileCard}
        mobileCardTitle={(row) =>
          row.user?.displayName || row.user?.email || row.userId
        }
      />
    </>
  );
};
