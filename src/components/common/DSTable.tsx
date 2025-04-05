import { Paper, Table, TableBody, TableContainer } from "@mui/material";
import { FC, useState, useEffect, useMemo } from "react";
import {
  ResolvedFilterConfig,
  FilterConfig,
  FilterState,
} from "./DSTableFilters";
import DSTableFilters from "./DSTableFilters";
import TableHeader from "./TableHeader";
import TableContent from "./TableContent";
import { applyFilters, sortData, resolveFilterOptions } from "./DSTableUtils";

export type Column<T extends { id: string | number }> = {
  render: (row: T) => React.ReactNode;
  id: string;
  label: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  filterConfig?: FilterConfig;
};

type DSTableProps<T extends { id: string | number }> = {
  columns: Column<T>[];
  data: T[];
  onRowDelete?: (row: T) => void;
  onDisplayedDataChange?: (data: T[]) => void;
};

type Order = "asc" | "desc";

const DSTable: FC<DSTableProps<any>> = ({
  columns,
  data,
  onDisplayedDataChange,
}) => {
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [filterStates, setFilterStates] = useState<FilterState[]>([]);

  const resolvedFilterConfigs = useMemo(
    () =>
      columns
        .filter((column) => column.filterConfig)
        .map((column) => {
          const config = column.filterConfig;
          return {
            ...config,
            resolvedOptions: resolveFilterOptions(config, data),
          } as ResolvedFilterConfig;
        }),
    [columns, data?.length]
  );
  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const onFilterSortChange = () => {
    const filteredData = applyFilters(data, filterStates);
    const sortedFilteredData = sortData(filteredData, columns, orderBy, order);

    setDisplayedData(sortedFilteredData);
    onDisplayedDataChange?.(sortedFilteredData);
  };

  useEffect(() => {
    onFilterSortChange();
  }, [filterStates, orderBy, order, data]);

  return (
    <>
      {resolvedFilterConfigs.length > 0 && (
        <DSTableFilters
          filters={filterStates}
          filterConfigs={resolvedFilterConfigs}
          setFilterStates={setFilterStates}
        />
      )}

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
          <TableHeader
            columns={columns}
            orderBy={orderBy}
            order={order}
            onRequestSort={handleRequestSort}
          />

          <TableBody>
            <TableContent columns={columns} data={displayedData} />
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DSTable;
