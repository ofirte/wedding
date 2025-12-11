import { useMemo, useState } from "react";
import { InlineColumn } from "../types";

export const useTableSearch = <T extends { id: string | number }>(
  data: T[],
  searchFields: string[],
  columns: InlineColumn<T>[],
  t: (key: string) => string
) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!searchQuery || searchFields.length === 0) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      searchFields.some((field) => {
        const value = (row as any)[field];
        return value && String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchFields]);

  // Build search placeholder
  const searchPlaceholder = useMemo(() => {
    if (searchFields.length === 0) return "";
    const labels = searchFields
      .map((field) => columns.find((col) => col.id === field)?.label)
      .filter(Boolean);
    return `${t("common.search")} ${labels.join(", ")}...`;
  }, [searchFields, columns, t]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
    searchPlaceholder,
  };
};
