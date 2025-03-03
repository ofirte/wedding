import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Stack,
  SelectChangeEvent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditableRow from "./EditableRow";
import { db } from "../../api/firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import TableSortLabel from "@mui/material/TableSortLabel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SummaryInfo from "./SummaryInfo";
import TableFilters from "./TableFilters";
import { columns } from "./InviteListColumns";
import AddGuestsDialog from "./AddGuestsDialog";

export interface Invitee {
  id: string;
  name: string;
  rsvp: string;
  percentage: number;
  side: string;
  relation: string;
  amount: number;
  amountConfirm: number;
  cellphone: string;
}

const WeddingInviteTable = () => {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [editingInviteeId, setEditingInviteeId] = useState<string | null>(null);
  const [newInvitee, setNewInvitee] = useState<Invitee | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Invitee>("name");
  const [relationFilter, setRelationFilter] = useState<string[]>([]);
  const [sideFilter, setSideFilter] = useState<string>("");
  const [attendanceFilter, setAttendanceFilter] = useState<number | "">("");
  const [isAddGuestsDialogOpen, setIsAddGuestsDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "invitee"),
      (snapshot) => {
        setInvitees(
          snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              rsvp: data.rsvp,
              percentage: data.percentage,
              side: data.side,
              relation: data.relation,
              amount: data.amount,
              amountConfirm: data.amountConfirm,
              cellphone: data.cellphone,
            };
          })
        );
      },
      (error) => {
        if (error.code === "permission-denied") {
          console.error("Error fetching invitees: ", error.message);
        } else {
          console.error("Error fetching invitees: ", error);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const handleEditInvitee = async (updatedInvitee: Invitee) => {
    try {
      const inviteeRef = doc(db, "invitee", updatedInvitee.id);
      await updateDoc(inviteeRef, {
        name: updatedInvitee.name,
        rsvp: updatedInvitee.rsvp ?? "",
        percentage: updatedInvitee.percentage,
        side: updatedInvitee.side,
        relation: updatedInvitee.relation,
        amount: updatedInvitee.amount,
        amountConfirm: updatedInvitee.amountConfirm,
        cellphone: updatedInvitee.cellphone ?? "",
      });
      setEditingInviteeId(null);
    } catch (error) {
      console.error("Error updating invitee: ", error);
    }
  };

  const handleDeleteInvitee = async (id: string) => {
    try {
      await deleteDoc(doc(db, "invitee", id));
    } catch (error) {
      console.error("Error deleting invitee: ", error);
    }
  };

  const handleAddInvitee = () => {
    const newId = invitees.length
      ? (parseInt(invitees[invitees.length - 1].id) + 1).toString()
      : "1";
    setNewInvitee({
      id: newId,
      name: "",
      rsvp: "Pending",
      percentage: 0,
      side: "חתן",
      relation: "",
      amount: 0,
      amountConfirm: 0,
      cellphone: "",
    });
    setEditingInviteeId(newId);
  };

  const handleSaveNewInvitee = async (invitee: Invitee) => {
    try {
      await addDoc(collection(db, "invitee"), {
        name: invitee.name,
        rsvp: invitee.rsvp,
        percentage: invitee.percentage,
        side: invitee.side,
        relation: invitee.relation,
        amount: invitee.amount,
        amountConfirm: invitee.amountConfirm,
        cellphone: invitee.cellphone,
      });
      setNewInvitee(null);
      setEditingInviteeId(null);
    } catch (error) {
      console.error("Error adding invitee: ", error);
    }
  };

  const handleRequestSort = (property: keyof Invitee) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleRelationFilterChange = (
    event: SelectChangeEvent<typeof relationFilter>
  ) => {
    const {
      target: { value },
    } = event;
    setRelationFilter(typeof value === "string" ? value.split(",") : value);
  };

  const filteredInvitees = invitees.filter((invitee) => {
    return (
      (relationFilter.length
        ? relationFilter.includes(invitee.relation)
        : true) &&
      (sideFilter ? invitee.side === sideFilter : true) &&
      (attendanceFilter !== "" ? invitee.percentage <= attendanceFilter : true)
    );
  });

  const sortedInvitees = filteredInvitees.sort((a, b) => {
    if (
      orderBy === "percentage" ||
      orderBy === "amount" ||
      orderBy === "amountConfirm"
    ) {
      return order === "asc"
        ? a[orderBy] - b[orderBy]
        : b[orderBy] - a[orderBy];
    } else {
      return order === "asc"
        ? a[orderBy] > b[orderBy]
          ? 1
          : -1
        : a[orderBy] < b[orderBy]
        ? 1
        : -1;
    }
  });

  const existingRelations = Array.from(
    new Set(invitees.map((invitee) => invitee.relation))
  );

  const handleClearFilters = () => {
    setRelationFilter([]);
    setSideFilter("");
    setAttendanceFilter("");
  };

  const handleAddGuestsDialogOpen = () => {
    setIsAddGuestsDialogOpen(true);
  };

  const handleAddGuestsDialogClose = () => {
    setIsAddGuestsDialogOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fafafa",
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Paper elevation={0} sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Stack spacing={4}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", color: "#1a237e" }}
            >
              Wedding Guest Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleAddGuestsDialogOpen}
              sx={{
                bgcolor: "#9c27b0",
                "&:hover": { bgcolor: "#7b1fa2" },
                borderRadius: 2,
              }}
            >
              Add New Guests
            </Button>
          </Box>

          {/* Stats Cards */}
          <SummaryInfo invitees={filteredInvitees} />
          <TableFilters
            relationFilter={relationFilter}
            sideFilter={sideFilter}
            attendanceFilter={attendanceFilter}
            existingRelations={existingRelations}
            onRelationFilterChange={handleRelationFilterChange}
            onSideFilterChange={(e) => setSideFilter(e.target.value)}
            onAttendanceFilterChange={(e) =>
              setAttendanceFilter(e.target.value ? Number(e.target.value) : "")
            }
            onClearFilters={handleClearFilters}
          />
          {/* Table Section */}
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
              borderRadius: 2,
              "& .MuiTableCell-head": {
                bgcolor: "#f5f5f5",
                fontWeight: "bold",
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.id} align="center">
                      {column.sortable ? (
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? order : "asc"}
                          onClick={() =>
                            handleRequestSort(column.id as keyof Invitee)
                          }
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedInvitees.map((invitee) =>
                  editingInviteeId === invitee.id ? (
                    <EditableRow
                      key={invitee.id}
                      invitee={invitee}
                      onSave={handleEditInvitee}
                      onCancel={() => setEditingInviteeId(null)}
                      existingRelations={existingRelations}
                    />
                  ) : (
                    <TableRow
                      key={invitee.id}
                      sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.id} align="center">
                          {column.render
                            ? column.render(
                                invitee,
                                handleDeleteInvitee,
                                setEditingInviteeId
                              )
                            : invitee[column.id as keyof Invitee]}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )}
                {newInvitee && (
                  <EditableRow
                    key={newInvitee.id}
                    invitee={newInvitee}
                    onSave={handleSaveNewInvitee}
                    onCancel={() => {
                      setNewInvitee(null);
                      setEditingInviteeId(null);
                    }}
                    existingRelations={existingRelations}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>
      <AddGuestsDialog
        open={isAddGuestsDialogOpen}
        onClose={handleAddGuestsDialogClose}
        onSave={handleSaveNewInvitee}
        relationOptions={existingRelations}
      />
    </Box>
  );
};

export default WeddingInviteTable;
