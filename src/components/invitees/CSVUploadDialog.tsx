import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import { useTranslation } from "../../localization/LocalizationContext";
import { useBulkUpdateInvitees } from "../../hooks/invitees/useBulkUpdateInvitees";
import { useCreateInvitee } from "../../hooks/invitees/useCreateInvitee";

interface CSVRow {
  name: string;
  cellphone: string;
  [key: string]: string | number | undefined;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParsedData {
  validRows: CSVRow[];
  errors: ValidationError[];
  preview: CSVRow[];
}

interface CSVUploadDialogProps {
  open: boolean;
  onClose: () => void;
  existingInvitees: any[];
}

const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({
  open,
  onClose,
  existingInvitees,
}) => {
  // const { t } = useTranslation(); // Uncomment when adding translations
  const [csvData, setCsvData] = useState<ParsedData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { mutateAsync: bulkUpdateInvitees } = useBulkUpdateInvitees();
  const { mutateAsync: createInvitee } = useCreateInvitee();

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone validation - adjust regex as needed
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone.trim());
  };

  const parseCSV = useCallback((text: string): ParsedData => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) {
      return { validRows: [], errors: [], preview: [] };
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    // Validate required headers
    const requiredHeaders = ["name", "cellphone"];
    const missingHeaders = requiredHeaders.filter(
      (h) => !headers.some((header) => header.toLowerCase() === h.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      return {
        validRows: [],
        errors: [
          {
            row: 0,
            field: "headers",
            message: `Missing required columns: ${missingHeaders.join(", ")}`,
          },
        ],
        preview: [],
      };
    }

    const validRows: CSVRow[] = [];
    const errors: ValidationError[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      const row: any = {};

      // Map headers to values
      headers.forEach((header, index) => {
        row[header.toLowerCase()] = values[index] || "";
      });

      // Validate required fields
      if (!row.name || row.name.trim() === "") {
        errors.push({
          row: i + 1,
          field: "name",
          message: "Name is required",
        });
        continue;
      }

      if (!row.cellphone || row.cellphone.trim() === "") {
        errors.push({
          row: i + 1,
          field: "cellphone",
          message: "Cellphone is required",
        });
        continue;
      }

      if (!validatePhoneNumber(row.cellphone)) {
        errors.push({
          row: i + 1,
          field: "cellphone",
          message: "Invalid phone number format",
        });
        continue;
      }

      validRows.push(row as CSVRow);
    }

    return {
      validRows,
      errors,
      preview: validRows.slice(0, 5), // Show first 5 rows as preview
    };
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        alert("Please select a CSV file");
        return;
      }

      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        setCsvData(parsed);
      };
      reader.readAsText(selectedFile);
    },
    [parseCSV]
  );

  const handleUpload = async () => {
    if (!csvData || csvData.validRows.length === 0) return;

    setUploading(true);
    try {
      const updates: Array<{ id: string; data: any }> = [];
      const newInvitees: Array<any> = [];

      for (const row of csvData.validRows) {
        // Check if invitee exists (match by name or phone)

        const inviteeData = {
          name: row.name,
          cellphone: row.cellphone,
          rsvp: String(row.rsvp || "Pending"),
          percentage: row.percentage ? Number(row.percentage) : 100,
          side: String(row.side || ""),
          relation: String(row.relation || ""),
          amount: row.amount ? Number(row.amount) : 1,
          amountConfirm: row.amountconfirm ? Number(row.amountconfirm) : 0,
        };

        // Create new invitee
        newInvitees.push(inviteeData);
      }

      // Process updates and creates
      if (updates.length > 0) {
        await bulkUpdateInvitees(updates);
      }

      for (const newInvitee of newInvitees) {
        await createInvitee(newInvitee);
      }

      setUploadComplete(true);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert("Error uploading CSV data. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setCsvData(null);
    setFile(null);
    setUploading(false);
    setUploadComplete(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload Invitees CSV</DialogTitle>

      <DialogContent>
        {!csvData && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Upload a CSV file with invitee data. Required columns:{" "}
              <strong>name, cellphone</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              Optional columns: rsvp, percentage, side, relation, amount,
              amountConfirm
            </Typography>

            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Select CSV File
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileSelect}
              />
            </Button>

            {file && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Selected file: {file.name}
              </Alert>
            )}
          </Box>
        )}

        {csvData && (
          <Box>
            {csvData.errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Found {csvData.errors.length} errors:
                </Typography>
                {csvData.errors.slice(0, 5).map((error, index) => (
                  <Typography key={index} variant="body2">
                    Row {error.row}, {error.field}: {error.message}
                  </Typography>
                ))}
                {csvData.errors.length > 5 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ... and {csvData.errors.length - 5} more errors
                  </Typography>
                )}
              </Alert>
            )}

            {csvData.validRows.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <CheckCircleIcon color="success" />
                  <Typography variant="subtitle1">
                    {csvData.validRows.length} valid records found
                  </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Preview (first 5 records):
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Cellphone</TableCell>
                        <TableCell>RSVP</TableCell>
                        <TableCell>Side</TableCell>
                        <TableCell>Relation</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {csvData.preview.map((row, index) => {
                        const existingInvitee = existingInvitees.find(
                          (inv) =>
                            inv.name.toLowerCase() === row.name.toLowerCase() ||
                            inv.cellphone === row.cellphone
                        );

                        return (
                          <TableRow key={index}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.cellphone}</TableCell>
                            <TableCell>{row.rsvp || "Pending"}</TableCell>
                            <TableCell>{row.side || "-"}</TableCell>
                            <TableCell>{row.relation || "-"}</TableCell>
                            <TableCell>
                              <Chip
                                label={existingInvitee ? "Update" : "New"}
                                color={existingInvitee ? "warning" : "success"}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading invitees...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {uploadComplete && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  Successfully uploaded {csvData.validRows.length} invitees!
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {uploadComplete ? "Close" : "Cancel"}
        </Button>
        {csvData && csvData.validRows.length > 0 && !uploadComplete && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? <LinearProgress /> : <CloudUploadIcon />}
          >
            {uploading
              ? "Uploading..."
              : `Upload ${csvData.validRows.length} Records`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CSVUploadDialog;
