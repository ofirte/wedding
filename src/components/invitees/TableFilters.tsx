// CompactTableFilters.tsx
import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  Typography,
  Button,
  Divider
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';

interface CompactTableFiltersProps {
  relationFilter: string[];
  sideFilter: string;
  attendanceFilter: number | "";
  existingRelations: string[];
  onRelationFilterChange: (event: SelectChangeEvent<string[]>) => void;
  onSideFilterChange: (event: SelectChangeEvent<string>) => void;
  onAttendanceFilterChange: (event: SelectChangeEvent<string>) => void;
  onClearFilters: () => void;
}

const TableFilters = ({
  relationFilter,
  sideFilter,
  attendanceFilter,
  existingRelations,
  onRelationFilterChange,
  onSideFilterChange,
  onAttendanceFilterChange,
  onClearFilters
}: CompactTableFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (relationFilter.length > 0) count++;
    if (sideFilter) count++;
    if (attendanceFilter !== '') count++;
    return count;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          startIcon={<FilterAltIcon />}
          onClick={handleClick}
          variant="outlined"
          color={getActiveFiltersCount() > 0 ? "primary" : "inherit"}
          sx={{ height: 32 }}
        >
          Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </Button>

        <Stack direction="row" spacing={1} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {relationFilter.map((relation) => (
            <Chip
              key={relation}
              label={`${relation}`}
              onDelete={() => {
                const newRelations = relationFilter.filter(r => r !== relation);
                onRelationFilterChange({ target: { value: newRelations } } as SelectChangeEvent<string[]>);
              }}
              size="small"
            />
          ))}
          {sideFilter && (
            <Chip
              label={`${sideFilter}`}
              onDelete={() => onSideFilterChange({ target: { value: '' } } as SelectChangeEvent<string>)}
              size="small"
            />
          )}
          {attendanceFilter !== '' && (
            <Chip
              label={`≤${attendanceFilter}%`}
              onDelete={() => onAttendanceFilterChange({ target: { value: '' } } as SelectChangeEvent<string>)}
              size="small"
            />
          )}
        </Stack>

        {getActiveFiltersCount() > 0 && (
          <Button
            size="small"
            onClick={onClearFilters}
            sx={{ height: 32 }}
          >
            Clear all
          </Button>
        )}
      </Stack>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { 
            width: 320,
            p: 2,
            mt: 1
          }
        }}
      >
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold">Filters</Typography>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Divider />

          <FormControl fullWidth size="small">
            <InputLabel>Relation</InputLabel>
            <Select
              multiple
              value={relationFilter}
              onChange={onRelationFilterChange}
              label="Relation"
              renderValue={(selected) => `${selected.length} selected`}
            >
              {existingRelations.map((relation) => (
                <MenuItem key={relation} value={relation}>
                  {relation}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Side</InputLabel>
            <Select
              value={sideFilter}
              onChange={onSideFilterChange}
              label="Side"
            >
              <MenuItem value="">
                <em>All Sides</em>
              </MenuItem>
              <MenuItem value="חתן">חתן</MenuItem>
              <MenuItem value="כלה">כלה</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Attendance</InputLabel>
            <Select
              value={attendanceFilter.toString()}
              onChange={onAttendanceFilterChange}
              label="Attendance"
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {[25, 50, 75, 100].map((num) => (
                <MenuItem key={num} value={num}>
                  ≤ {num}%
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Popover>
    </Box>
  );
};

export default TableFilters;