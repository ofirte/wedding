import { Column } from "../common/DSTable";
import { UserAvatar } from "./UserAvatar";
import { UserRoleChip } from "./UserRoleChip";
import { UserActions } from "./UserActions";
import { UserInfo } from "../../hooks/auth/useUsersInfo";

type TFunction = (
  key: string,
  variables?: Record<string, string | number>
) => string;

// Extend UserInfo to include id field required by DSTable
export type UserTableData = UserInfo & { id: string };

interface UserTableColumnsOptions {
  t: TFunction;
  onEditUser: (user: UserInfo) => void;
  isUpdating?: boolean;
}

/**
 * Creates column configuration for the user management table
 */
export const createUserTableColumns = ({
  t,
  onEditUser,
  isUpdating = false,
}: UserTableColumnsOptions): Column<UserTableData>[] => [
  {
    id: "user",
    label: t("userManagement.user"),
    render: (user) => (
      <UserAvatar
        user={{
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
        }}
        showDetails
      />
    ),
    sortable: true,
    sortFn: (a, b) => {
      const nameA = a.displayName || a.email || "";
      const nameB = b.displayName || b.email || "";
      return nameA.localeCompare(nameB);
    },
    filterConfig: {
      id: "displayName",
      type: "single",
      label: t("userManagement.filterByName"),
      options: (data) => {
        const names = data
          .map((user: UserTableData) => user.displayName || user.email || "")
          .filter((name: string) => name)
          .sort();
        const uniqueNames = Array.from(new Set(names));
        return uniqueNames.map((name: string) => ({
          value: name,
          label: name,
        }));
      },
    },
  },
  {
    id: "email",
    label: t("common.emailAddress"),
    render: (user) => user.email || t("common.notAvailable"),
    sortable: true,
    sortFn: (a, b) => (a.email || "").localeCompare(b.email || ""),
    filterConfig: {
      id: "email",
      type: "single",
      label: t("common.emailAddress"),
      options: (data) => {
        const emails = data
          .map((user: UserTableData) => user.email || "")
          .filter((email: string) => email)
          .sort();
        const uniqueEmails = Array.from(new Set(emails));
        return uniqueEmails.map((email: string) => ({
          value: email,
          label: email,
        }));
      },
    },
  },
  {
    id: "role",
    label: t("userManagement.role"),
    render: (user) => <UserRoleChip user={user} />,
    sortable: true,
    sortFn: (a, b) => a.role.localeCompare(b.role),
    filterConfig: {
      id: "role",
      type: "multiple",
      label: t("userManagement.filterByRole"),
      options: [
        { value: "user", label: t("userManagement.roles.user") },
        { value: "producer", label: t("userManagement.roles.producer") },
        { value: "admin", label: t("userManagement.roles.admin") },
      ],
    },
  },
  {
    id: "createdAt",
    label: t("userManagement.joinedAt"),
    render: (user) =>
      user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : t("common.notAvailable"),
    sortable: true,
    sortFn: (a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    },
  },
  {
    id: "actions",
    label: t("common.actions"),
    render: (user) => (
      <UserActions
        user={user}
        onEditUser={onEditUser}
        isUpdating={isUpdating}
      />
    ),
    hideOnMobile: false,
    showOnMobileCard: true,
  },
];
