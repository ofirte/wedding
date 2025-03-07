import {
  Paper,
  Table,
  TableBody,
  TableContainer,
} from "@mui/material";
import { FC, useState, useEffect, useMemo } from "react";
import { FilterConfig, FilterState } from "./DSTableFilters";
import DSTableFilters from "./DSTableFilters";
import TableHeader from "./TableHeader";
import TableContent from "./TableContent";
import { applyFilters, sortData, resolveFilterOptions } from "./DSTableUtils";

export type Column<T extends { id: string  | number}> = {
  render: (row: T) => React.ReactNode;
  id: string;
  label: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  filterConfig?: FilterConfig;
};

type DSTableProps<T extends { id: string | number; }> = {
  columns: Column<T>[];
  data: T[];
  onRowDelete?: (row: T) => void;
  onDisplayedDataChange?: (data: T[]) => void;
};

type Order = "asc" | "desc";

const DSTable: FC<DSTableProps<any>> = ({ columns, data, onDisplayedDataChange }) => {
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");
  const [displayedData, setDisplayedData] = useState<any[]>(data);
  const [filterStates, setFilterStates] = useState<FilterState[]>([]);

  const filterConfigs = useMemo(() => 
    columns
      .filter(column => column.filterConfig)
      .map(column => column.filterConfig!)
  , [columns]);

  useEffect(() => {
    setFilterStates(filterConfigs.map(config => ({
      id: config.id,
      value: [],
      resolvedOptions: resolveFilterOptions(config, data)
    })));
  }, [filterConfigs]);

  useEffect(() => {
    if (data.length === 0) return;
    
    setFilterStates(prevStates => 
      prevStates.map(state => {
        const config = filterConfigs.find(c => c.id === state.id);
        if (!config || !config.options) return state;
        
        return {
          ...state,
          resolvedOptions: resolveFilterOptions(config, data)
        };
      })
    );
  }, [data, filterConfigs]);

  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const handleFilterChange = (filterId: string, newValue: any[]) => {
    setFilterStates(prevStates => 
      prevStates.map(state => 
        state.id === filterId 
          ? { ...state, value: newValue } 
          : state
      )
    );
  };

  const handleClearFilters = () => {
    setFilterStates(prevStates => 
      prevStates.map(state => ({ ...state, value: [] }))
    );
  };

  useEffect(() => {
    const filteredData = applyFilters(data, filterStates);
    const sortedFilteredData = sortData(filteredData, columns, orderBy, order);
    
    setDisplayedData(sortedFilteredData);
    onDisplayedDataChange?.(sortedFilteredData);

  }, [data, filterStates, orderBy, order, columns, onDisplayedDataChange]);

  return (
    <>
      {filterConfigs.length > 0 && (
        <DSTableFilters
          filters={filterStates}
          filterConfigs={filterConfigs}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
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
