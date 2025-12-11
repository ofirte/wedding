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
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import { useTranslation } from "../../localization/LocalizationContext";
import { useBulkUpdateInvitees } from "../../hooks/invitees/useBulkUpdateInvitees";
import { useCreateInvitee } from "../../hooks/invitees/useCreateInvitee";

// Column mapping for bilingual support
const COLUMN_MAPPINGS: Record<
  string,
  { en: string; he: string; required: boolean }
> = {
  name: { en: "name", he: "שם", required: true },
  cellphone: { en: "cellphone", he: "נייד", required: true },
  rsvp: { en: "rsvp", he: "סטטוס", required: false },
  side: { en: "side", he: "צד", required: false },
  relation: { en: "relation", he: "קרבה", required: false },
  amount: { en: "amount", he: "כמות", required: false },
};

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
  const { t, language } = useTranslation();
  const [csvData, setCsvData] = useState<ParsedData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { mutateAsync: bulkUpdateInvitees } = useBulkUpdateInvitees();
  const { mutateAsync: createInvitee } = useCreateInvitee();

  const validatePhoneNumber = (phone: string): boolean => {
    // Clean the phone number - remove all non-digit characters except +
    const cleaned = phone.trim().replace(/[^\d+]/g, "");
    // Israeli numbers: at least 9 digits (e.g., 0501234567 or +972501234567)
    // Allow numbers with 9-15 digits
    const phoneRegex = /^[+]?\d{9,15}$/;
    return phoneRegex.test(cleaned);
  };

  // Fix phone number - add leading 0 if it was stripped (Israeli numbers)
  const normalizePhoneNumber = (phone: string): string => {
    const cleaned = phone.trim().replace(/[^\d+]/g, "");
    // If it's 9 digits and doesn't start with 0 or +, add leading 0
    // (Israeli mobile numbers are 10 digits starting with 05)
    if (/^\d{9}$/.test(cleaned) && !cleaned.startsWith("0")) {
      return "0" + cleaned;
    }
    return cleaned;
  };

  // Map header to internal field name (supports both languages)
  const mapHeaderToField = (header: string): string | null => {
    const normalizedHeader = header.toLowerCase().trim();

    for (const [fieldName, mapping] of Object.entries(COLUMN_MAPPINGS)) {
      if (
        normalizedHeader === mapping.en.toLowerCase() ||
        normalizedHeader === mapping.he
      ) {
        return fieldName;
      }
    }
    return null; // Unknown column - will be ignored
  };

  const parseFileData = useCallback(
    (data: any[][]): ParsedData => {
      if (data.length === 0) {
        return { validRows: [], errors: [], preview: [] };
      }

      // Parse header row
      const rawHeaders = data[0].map((h) =>
        String(h || "")
          .trim()
          .replace(/"/g, "")
      );

      // Map headers to internal field names
      const headerMapping: { index: number; fieldName: string }[] = [];
      rawHeaders.forEach((header, index) => {
        const fieldName = mapHeaderToField(header);
        if (fieldName) {
          headerMapping.push({ index, fieldName });
        }
      });

      // Check for required headers
      const requiredFields = Object.entries(COLUMN_MAPPINGS)
        .filter(([_, mapping]) => mapping.required)
        .map(([fieldName, _]) => fieldName);

      const mappedFields = headerMapping.map((h) => h.fieldName);
      const missingRequired = requiredFields.filter(
        (f) => !mappedFields.includes(f)
      );

      if (missingRequired.length > 0) {
        const missingColumnsDisplay = missingRequired
          .map((f) => {
            const mapping = COLUMN_MAPPINGS[f];
            return language === "he" ? mapping.he : mapping.en;
          })
          .join(", ");

        return {
          validRows: [],
          errors: [
            {
              row: 0,
              field: "headers",
              message: t("csvUpload.missingColumns", {
                columns: missingColumnsDisplay,
              }),
            },
          ],
          preview: [],
        };
      }

      const validRows: CSVRow[] = [];
      const errors: ValidationError[] = [];

      // Parse data rows (skip header)
      for (let i = 1; i < data.length; i++) {
        const rowData = data[i];
        if (!rowData || rowData.every((cell) => !cell)) continue; // Skip empty rows

        const row: any = {};

        // Map values to field names
        headerMapping.forEach(({ index, fieldName }) => {
          const value = rowData[index];
          row[fieldName] =
            value !== undefined && value !== null ? String(value).trim() : "";
        });

        // Validate required fields
        if (!row.name || row.name.trim() === "") {
          errors.push({
            row: i + 1,
            field: "name",
            message: t("csvUpload.errors.nameRequired"),
          });
          continue;
        }

        if (!row.cellphone || row.cellphone.trim() === "") {
          errors.push({
            row: i + 1,
            field: "cellphone",
            message: t("csvUpload.errors.cellphoneRequired"),
          });
          continue;
        }

        if (!validatePhoneNumber(row.cellphone)) {
          errors.push({
            row: i + 1,
            field: "cellphone",
            message: t("csvUpload.errors.invalidPhone"),
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
    },
    [language, t]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      const fileName = selectedFile.name.toLowerCase();
      const isCSV = fileName.endsWith(".csv");
      const isXLSX = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

      if (!isCSV && !isXLSX) {
        alert(t("csvUpload.invalidFormat"));
        return;
      }

      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as any[][];

          const parsed = parseFileData(data);
          setCsvData(parsed);
        } catch (error) {
          console.error("Error parsing file:", error);
          alert(t("csvUpload.uploadError"));
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    },
    [parseFileData, t]
  );

  const handleDownloadTemplate = useCallback(() => {
    // Get headers in current language
    const columnKeys = Object.keys(COLUMN_MAPPINGS);
    const headers = Object.entries(COLUMN_MAPPINGS).map(([_, mapping]) =>
      language === "he" ? mapping.he : mapping.en
    );

    // Create worksheet with headers only
    const ws = XLSX.utils.aoa_to_sheet([headers]);

    // Set column widths for better readability
    ws["!cols"] = headers.map(() => ({ wch: 15 }));

    // Find cellphone column index and set the entire column to text format
    const cellphoneIndex = columnKeys.indexOf("cellphone");
    if (cellphoneIndex !== -1) {
      // Set format for cellphone column (up to 1000 rows) to preserve leading zeros
      const colLetter = String.fromCharCode(65 + cellphoneIndex); // A, B, C...
      for (let row = 2; row <= 1000; row++) {
        const cellRef = `${colLetter}${row}`;
        if (!ws[cellRef]) {
          ws[cellRef] = { t: "s", v: "" };
        }
        ws[cellRef].z = "@"; // Text format
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invitees");
    XLSX.writeFile(wb, `invitees_template.xlsx`);
  }, [language]);

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
          cellphone: normalizePhoneNumber(row.cellphone),
          rsvp: String(row.rsvp || "Pending"),
          percentage: 100,
          side: String(row.side || ""),
          relation: String(row.relation || ""),
          amount: row.amount ? Number(row.amount) : 1,
          amountConfirm: 0,
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
      console.error("Error uploading file:", error);
      alert(t("csvUpload.uploadError"));
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

  // Get localized column names for display
  const getColumnLabel = (fieldName: string): string => {
    const key = `csvUpload.columns.${fieldName}` as const;
    return t(key as any) || fieldName;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("csvUpload.dialogTitle")}</DialogTitle>

      <DialogContent>
        {!csvData && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("csvUpload.acceptedFormats")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>{t("csvUpload.requiredColumns")}:</strong>{" "}
              {getColumnLabel("name")}, {getColumnLabel("cellphone")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              <strong>{t("csvUpload.optionalColumns")}:</strong>{" "}
              {getColumnLabel("rsvp")}, {getColumnLabel("side")},{" "}
              {getColumnLabel("relation")}, {getColumnLabel("amount")}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
              >
                {t("csvUpload.downloadTemplate")}
              </Button>
            </Box>

            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              {t("csvUpload.selectFile")}
              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
            </Button>

            {file && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t("csvUpload.selectedFile", { filename: file.name })}
              </Alert>
            )}
          </Box>
        )}

        {csvData && (
          <Box>
            {csvData.errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("csvUpload.errors.foundErrors", {
                    count: csvData.errors.length,
                  })}
                </Typography>
                {csvData.errors.slice(0, 5).map((error, index) => (
                  <Typography key={index} variant="body2">
                    {t("csvUpload.errors.row", { row: error.row })},{" "}
                    {error.field}: {error.message}
                  </Typography>
                ))}
                {csvData.errors.length > 5 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {t("csvUpload.errors.moreErrors", {
                      count: csvData.errors.length - 5,
                    })}
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
                    {t("csvUpload.validRecords", {
                      count: csvData.validRows.length,
                    })}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  {t("csvUpload.preview")}
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{getColumnLabel("name")}</TableCell>
                        <TableCell>{getColumnLabel("cellphone")}</TableCell>
                        <TableCell>{getColumnLabel("rsvp")}</TableCell>
                        <TableCell>{getColumnLabel("side")}</TableCell>
                        <TableCell>{getColumnLabel("relation")}</TableCell>
                        <TableCell>{t("common.status")}</TableCell>
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
                                label={
                                  existingInvitee
                                    ? t("csvUpload.status.update")
                                    : t("csvUpload.status.new")
                                }
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
                  {t("csvUpload.uploading")}
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {uploadComplete && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  {t("csvUpload.uploadSuccess", {
                    count: csvData.validRows.length,
                  })}
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {uploadComplete ? t("csvUpload.close") : t("csvUpload.cancel")}
        </Button>
        {csvData && csvData.validRows.length > 0 && !uploadComplete && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? <LinearProgress /> : <CloudUploadIcon />}
          >
            {uploading
              ? t("csvUpload.uploading")
              : t("csvUpload.uploadRecords", { count: csvData.validRows.length })}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CSVUploadDialog;
