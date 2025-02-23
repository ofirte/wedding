// TableSort.tsx
import React from 'react';
import { TableSortLabel, TableCell } from '@mui/material';
import { Invitee } from './InviteList';

interface TableSortProps {
  orderBy: keyof Invitee;
  order: 'asc' | 'desc';
  property: keyof Invitee;
  label: string;
  onRequestSort: (property: keyof Invitee) => void;
}

const TableSort = ({ 
  orderBy, 
  order, 
  property, 
  label, 
  onRequestSort 
}: TableSortProps) => {
  return (
    <TableCell align="center">
      <TableSortLabel
        active={orderBy === property}
        direction={orderBy === property ? order : 'asc'}
        onClick={() => onRequestSort(property)}
        sx={{
          fontWeight: 'bold',
          '&.MuiTableSortLabel-root': {
            color: 'primary.main',
          },
          '&.MuiTableSortLabel-root:hover': {
            color: 'primary.dark',
          },
          '&.Mui-active': {
            color: 'primary.dark',
          },
        }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
};

export default TableSort;