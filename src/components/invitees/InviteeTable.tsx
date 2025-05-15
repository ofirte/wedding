import React from "react";
import { Invitee } from "./InviteList";
import DSTable from "../common/DSTable";
import { Column } from "../common/DSTable";
import InviteeListActionCell from "./InviteeListActionCell";

interface InviteeTableProps {
  columns: Column<Invitee>[];
  invitees: Invitee[];
  onEditInvitee?: (invitee: Invitee) => void;
  onDeleteInvitee?: (invitee: Invitee) => void;
  onDisplayDataChange?: (invitees: Invitee[]) => void;
  showExport: boolean;
}

const InviteeTable: React.FC<InviteeTableProps> = ({
  columns,
  invitees,
  onEditInvitee,
  onDeleteInvitee,
  onDisplayDataChange,
  showExport,
}) => {
  return (

      <DSTable
        columns={columns.map((col) =>
          col.id === "actions"
            ? {
                ...col,
                render: (invitee: Invitee) => (
                  <InviteeListActionCell
                    invitee={invitee}
                    onEditInvitee={onEditInvitee}
                    onDeleteInvitee={onDeleteInvitee}
                  />
                ),
              }
            : col
        )}
        data={invitees}
        onDisplayedDataChange={onDisplayDataChange}
        showExport={showExport}
      />

  );
};

export default InviteeTable;
