import * as XLSX from "xlsx";
import { Column, ExportColumn } from "../components/common/DSTable";

/**
 * Exports data to an Excel file
 * @param data The data to export
 * @param columns The columns configuration
 * @param exportAddedColumns Additional columns to include in export but not shown in UI
 * @param filename The name of the file to be downloaded
 */
export const exportToExcel = <T extends { id: string | number }>(
  data: T[],
  columns: Column<T>[],
  exportAddedColumns: ExportColumn<T>[] = [],
  filename: string = "export"
): void => {
  // Combine display columns with additional export columns
  const displayHeaders = columns.map((column) => column.label);
  const additionalHeaders = exportAddedColumns.map((column) => column.label);
  const headers = [...displayHeaders, ...additionalHeaders];

  // Create worksheet data with headers
  const worksheetData = [
    headers,
    // For each data row, extract values based on columns
    ...data.map((row) => {
      // Get display column values
      const displayValues = columns.map((column) => {
        // Get the rendered content for this cell
        const renderedContent = column.render(row);

        // Since render might return React elements, we need to extract textual value
        // If it's a primitive value, use it directly
        if (
          typeof renderedContent === "string" ||
          typeof renderedContent === "number" ||
          typeof renderedContent === "boolean"
        ) {
          return renderedContent;
        }

        // For complex React elements, try to access the original data
        // This is a simplification - you might need to customize this based on your data structure
        const key = column.id as keyof T;
        return row[key]?.toString() || "";
      });

      // Get additional column values directly from data
      const additionalValues = exportAddedColumns.map((column) => {
        const value = row[column.id];
        return value?.toString() || "";
      });

      return [...displayValues, ...additionalValues];
    }),
  ];

  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // Generate file name with timestamp
  const dateStr = new Date().toISOString().slice(0, 10);
  const fullFilename = `${filename}_${dateStr}.xlsx`;

  // Write and download
  XLSX.writeFile(workbook, fullFilename);
};

/**
 * React hook for exporting table data to Excel
 * @param filename Base filename for the Excel export
 * @returns An object with the exportData function
 */
export const useExcelExport = (filename: string = "export") => {
  const exportData = <T extends { id: string | number }>(
    data: T[],
    columns: Column<T>[],
    exportAddedColumns: ExportColumn<T>[] = []
  ) => {
    exportToExcel(data, columns, exportAddedColumns, filename);
  };

  return { exportData };
};
