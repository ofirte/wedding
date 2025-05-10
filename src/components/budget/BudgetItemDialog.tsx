// BudgetItemDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { BudgetItem } from "./BudgetPlanner";
import { UploadFile } from "../common/UploadFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { on } from "events";

type BudgetItemDialogProps = {
  open: boolean;
  onClose: () => void;
  editingItem: BudgetItem | null;
  newItem: {
    name: string;
    group: string;
    expectedPrice: number;
    actualPrice: number;
    downPayment: number;
    contractsUrls?: string[];
  };
  budgetGroups: string[];
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onFileAdded: (url: string) => void;
  onFileDeleted: (url: string) => void;
  onSave: () => void;
};

const BudgetItemDialog: React.FC<BudgetItemDialogProps> = ({
  open,
  onClose,
  editingItem,
  newItem,
  budgetGroups,
  onInputChange,
  onSave,
  onFileAdded,
  onFileDeleted,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontFamily: '"Playfair Display", serif' }}>
        {editingItem ? "Edit Budget Item" : "Add New Budget Item"}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid component="div">
              <TextField
                name="name"
                label="Expense Name"
                fullWidth
                variant="outlined"
                value={newItem.name}
                onChange={onInputChange}
                required
              />
            </Grid>
            <Grid component="div">
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  name="group"
                  value={newItem.group}
                  onChange={(e) => onInputChange(e as any)}
                  label="Category"
                >
                  {budgetGroups.map((group) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid component="div">
              <TextField
                name="expectedPrice"
                label="Expected Price"
                type="number"
                fullWidth
                variant="outlined"
                value={newItem.expectedPrice}
                onChange={onInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid component="div">
              <TextField
                name="actualPrice"
                label="Actual Price"
                type="number"
                fullWidth
                variant="outlined"
                value={newItem.actualPrice}
                onChange={onInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid component="div">
              <TextField
                name="downPayment"
                label="Down Payment"
                type="number"
                fullWidth
                variant="outlined"
                value={newItem.downPayment}
                onChange={onInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid component="div">
              <Box sx={{ mt: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Contract Document
                </Typography>
                <Box>
                  {newItem.contractsUrls?.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                        p: 1,
                        bgcolor: "rgba(0, 0, 0, 0.04)",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PictureAsPdfIcon />
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: "180px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {url.split("/").pop()?.split("_").slice(1).join("_")}
                        </Typography>
                      </Box>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => {
                          onFileDeleted(url);
                        }}
                        sx={{ minWidth: "auto", p: "4px" }}
                      >
                        Delete
                      </Button>
                    </Box>
                  ))}
                </Box>
                <UploadFile
                  onUploadComplete={onFileAdded}
                  uploadPath="contracts"
                  buttonText="Upload Contract"
                  fileTypes=".pdf,.doc,.docx,.jpg,.png"
                  buttonColor="#9c88ff"
                  buttonHoverColor="#8c78ef"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#9e9e9e" }}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          sx={{
            bgcolor: "#9c88ff",
            "&:hover": {
              bgcolor: "#8c78ef",
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetItemDialog;
