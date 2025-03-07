// BudgetTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { BudgetItem } from "./BudgetPlanner";
import { formatCurrency } from "../../utils/NumberUtils";

type BudgetTableProps = {
  items: BudgetItem[];
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: number) => void;
};

const BudgetTable: React.FC<BudgetTableProps> = ({
  items,
  onEdit,
  onDelete,
}) => {
  // Get color for category chip
  const getCategoryColor = (group: string) => {
    const colors: Record<string, string> = {
      Venue: "#e1bee7",
      Catering: "#bbdefb",
      Attire: "#c8e6c9",
      Photography: "#ffccbc",
      Music: "#d1c4e9",
      Decor: "#b2ebf2",
      Flowers: "#f8bbd0",
      Transportation: "#ffe0b2",
      Stationery: "#c5cae9",
      Gifts: "#b3e5fc",
      Beauty: "#f0f4c3",
    };

    return colors[group] || "#e0e0e0";
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440, marginTop: 2 }}>
      <Table stickyHeader aria-label="wedding budget table">
        <TableHead>
          <TableRow>
            <TableCell>Expense Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Expected Price</TableCell>
            <TableCell align="right">Actual Price</TableCell>
            <TableCell align="right">Down Payment</TableCell>
            <TableCell align="right">Balance</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell component="th" scope="row">
                {item.name}
              </TableCell>
              <TableCell>
                <Chip
                  label={item.group}
                  size="small"
                  sx={{
                    backgroundColor: getCategoryColor(item.group),
                  }}
                />
              </TableCell>
              <TableCell align="right">
                {formatCurrency({
                  value: item.expectedPrice,
                  sign: "₪",
                })}
              </TableCell>
              <TableCell align="right">
                {formatCurrency({
                  value: item.actualPrice,
                  sign: "₪",
                })}
              </TableCell>
              <TableCell align="right">
                {formatCurrency({
                  value: item.downPayment,
                  sign: "₪",
                })}
              </TableCell>
              <TableCell align="right">
                {formatCurrency({
                  value: item.actualPrice - item.downPayment,
                  sign: "₪",
                })}
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onEdit(item)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BudgetTable;
