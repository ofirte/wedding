import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  AutoFixHigh as AutoFixHighIcon,
} from '@mui/icons-material';
import { useDrop, useDrag } from 'react-dnd';
import { Table } from '../../../shared/src/models/seating';
import { Invitee } from '../../../shared/src/models/invitee';

import GuestChip from './GuestChip';
import { useTranslation } from 'src/localization/LocalizationContext';
import { autoAssignGuests } from 'src/utils/autoAssignment';

interface AssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (assignments: Map<string, string[]>) => Promise<void>;
  tables: Table[];
  invitees: Invitee[];
  initialAssignments?: Map<string, string[]>;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  open,
  onClose,
  onApply,
  tables,
  invitees,
  initialAssignments,
}) => {
  const { t } = useTranslation();

  // State
  const [assignments, setAssignments] = useState<Map<string, string[]>>(
    initialAssignments || new Map()
  );
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [relationFilter, setRelationFilter] = useState<string>('all');
  const [sideFilter, setSideFilter] = useState<string>('all');
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [bulkAssignTableId, setBulkAssignTableId] = useState<string>('');

  // Get all assigned guest IDs
  const assignedGuestIds = useMemo(() => {
    const ids = new Set<string>();
    assignments.forEach((guestIds) => {
      guestIds.forEach((id) => ids.add(id));
    });
    return ids;
  }, [assignments]);

  // Get unassigned guests
  const unassignedGuests = useMemo(() => {
    return invitees.filter((invitee) => !assignedGuestIds.has(invitee.id));
  }, [invitees, assignedGuestIds]);

  // Apply filters to unassigned guests
  const filteredUnassignedGuests = useMemo(() => {
    return unassignedGuests.filter((guest) => {
      const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRelation = relationFilter === 'all' || guest.relation === relationFilter;
      const matchesSide = sideFilter === 'all' || guest.side === sideFilter;
      return matchesSearch && matchesRelation && matchesSide;
    });
  }, [unassignedGuests, searchQuery, relationFilter, sideFilter]);

  // Get unique relations and sides for filters
  const { relations, sides } = useMemo(() => {
    const relationsSet = new Set<string>();
    const sidesSet = new Set<string>();
    invitees.forEach((invitee) => {
      if (invitee.relation) relationsSet.add(invitee.relation);
      if (invitee.side) sidesSet.add(invitee.side);
    });
    return {
      relations: Array.from(relationsSet).sort(),
      sides: Array.from(sidesSet).sort(),
    };
  }, [invitees]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalGuests = invitees.length;
    const assignedCount = assignedGuestIds.size;
    const tablesUsed = Array.from(assignments.values()).filter((guests) => guests.length > 0).length;
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
    const usedCapacity = assignedCount;
    return {
      totalGuests,
      assignedCount,
      unassignedCount: totalGuests - assignedCount,
      tablesUsed,
      totalTables: tables.length,
      capacityPercent: totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0,
    };
  }, [invitees, assignedGuestIds, assignments, tables]);

  // Handle auto-assign
  const handleAutoAssign = useCallback(() => {
    setIsAutoAssigning(true);
    try {
      const unassigned = invitees.filter((inv) => !assignedGuestIds.has(inv.id));

      if (unassigned.length === 0) {
        alert(t('seating.autoAssignment.noGuestsToAssign'));
        setIsAutoAssigning(false);
        return;
      }

      const availableTables = tables.map((table) => ({
        ...table,
        assignedGuests: assignments.get(table.id) || [],
      }));

      if (availableTables.length === 0) {
        alert(t('seating.autoAssignment.noTablesAvailable'));
        setIsAutoAssigning(false);
        return;
      }

      // Use default grouping rules
      const rules = {
        groupByRelation: true,
        groupBySide: true,
      };

      const result = autoAssignGuests(unassigned, availableTables, rules);

      // Merge with existing assignments
      const newAssignments = new Map(assignments);
      result.forEach((guestIds, tableId) => {
        const existing = newAssignments.get(tableId) || [];
        newAssignments.set(tableId, [...existing, ...guestIds]);
      });

      setAssignments(newAssignments);
      setSelectedGuests(new Set()); // Clear selection
    } catch (error) {
      console.error('Auto-assignment failed:', error);
      alert('Auto-assignment failed. Please try again.');
    } finally {
      setIsAutoAssigning(false);
    }
  }, [invitees, assignedGuestIds, tables, assignments, t]);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    if (window.confirm(t('seating.assignmentDialog.confirmClearAll'))) {
      setAssignments(new Map());
      setSelectedGuests(new Set());
    }
  }, [t]);

  // Handle guest selection toggle
  const handleToggleGuest = useCallback((guestId: string) => {
    setSelectedGuests((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) {
        next.delete(guestId);
      } else {
        next.add(guestId);
      }
      return next;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedGuests.size === filteredUnassignedGuests.length) {
      setSelectedGuests(new Set());
    } else {
      setSelectedGuests(new Set(filteredUnassignedGuests.map((g) => g.id)));
    }
  }, [filteredUnassignedGuests, selectedGuests]);

  // Handle assign to table (single guest)
  const handleAssignGuestToTable = useCallback((guestId: string, tableId: string) => {
    setAssignments((prev) => {
      const next = new Map(prev);

      // Remove from old table if exists
      next.forEach((guests, tId) => {
        const filtered = guests.filter((id) => id !== guestId);
        if (filtered.length !== guests.length) {
          next.set(tId, filtered);
        }
      });

      // Add to new table
      const tableGuests = next.get(tableId) || [];
      next.set(tableId, [...tableGuests, guestId]);

      return next;
    });
  }, []);

  // Handle bulk assign selected guests
  const handleBulkAssign = useCallback(() => {
    if (!bulkAssignTableId || selectedGuests.size === 0) return;

    const table = tables.find((t) => t.id === bulkAssignTableId);
    if (!table) return;

    const currentAssigned = assignments.get(table.id) || [];
    const remainingCapacity = table.capacity - currentAssigned.length;

    if (selectedGuests.size > remainingCapacity) {
      if (!window.confirm(
        t('seating.assignmentDialog.confirmOverCapacity', {
          selected: selectedGuests.size,
          remaining: remainingCapacity,
        })
      )) {
        return;
      }
    }

    setAssignments((prev) => {
      const next = new Map(prev);
      const tableGuests = next.get(bulkAssignTableId) || [];
      next.set(bulkAssignTableId, [...tableGuests, ...Array.from(selectedGuests)]);
      return next;
    });

    setSelectedGuests(new Set());
    setBulkAssignTableId('');
  }, [bulkAssignTableId, selectedGuests, tables, assignments, t]);

  // Handle remove guest from table
  const handleRemoveGuestFromTable = useCallback((guestId: string, tableId: string) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      const tableGuests = next.get(tableId) || [];
      next.set(tableId, tableGuests.filter((id) => id !== guestId));
      return next;
    });
  }, []);

  // Handle apply
  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply(assignments);
      onClose();
    } catch (error) {
      console.error('Failed to apply assignments:', error);
      alert('Failed to apply assignments. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Get guest by ID
  const getGuest = useCallback(
    (guestId: string) => invitees.find((inv) => inv.id === guestId),
    [invitees]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' },
      }}
    >
      <DialogTitle sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
        {t('seating.assignmentDialog.title')}
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Statistics Bar */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={isAutoAssigning ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
            onClick={handleAutoAssign}
            disabled={isAutoAssigning || stats.unassignedCount === 0}
          >
            {t('seating.assignmentDialog.autoAssign')}
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
            disabled={stats.assignedCount === 0}
          >
            {t('seating.assignmentDialog.clearAll')}
          </Button>

          <Box sx={{ flex: 1 }} />

          <Typography variant="body2">
            {t('seating.assignmentDialog.assigned')}: {stats.assignedCount}/{stats.totalGuests}
          </Typography>
          <Typography variant="body2">
            {t('seating.assignmentDialog.tables')}: {stats.tablesUsed}/{stats.totalTables}
          </Typography>
          <Typography variant="body2">
            {t('seating.assignmentDialog.capacity')}: {stats.capacityPercent}%
          </Typography>
        </Box>

        {/* Main Split Layout */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel - Unassigned Guests */}
          <Box
            sx={{
              width: 320,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('seating.assignmentDialog.unassigned')} ({stats.unassignedCount})
              </Typography>

              <Stack spacing={1.5}>
                <TextField
                  size="small"
                  placeholder={t('seating.assignmentDialog.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>{t('seating.assignmentDialog.relation')}</InputLabel>
                  <Select
                    value={relationFilter}
                    onChange={(e) => setRelationFilter(e.target.value)}
                    label={t('seating.assignmentDialog.relation')}
                  >
                    <MenuItem value="all">{t('seating.assignmentDialog.all')}</MenuItem>
                    {relations.map((rel) => (
                      <MenuItem key={rel} value={rel}>
                        {rel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>{t('seating.assignmentDialog.side')}</InputLabel>
                  <Select
                    value={sideFilter}
                    onChange={(e) => setSideFilter(e.target.value)}
                    label={t('seating.assignmentDialog.side')}
                  >
                    <MenuItem value="all">{t('seating.assignmentDialog.all')}</MenuItem>
                    {sides.map((side) => (
                      <MenuItem key={side} value={side}>
                        {side}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  size="small"
                  onClick={handleSelectAll}
                  disabled={filteredUnassignedGuests.length === 0}
                >
                  {selectedGuests.size === filteredUnassignedGuests.length
                    ? t('seating.assignmentDialog.deselectAll')
                    : t('seating.assignmentDialog.selectAll')}
                </Button>
              </Stack>
            </Box>

            {/* Guest List */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Stack spacing={1}>
                {filteredUnassignedGuests.map((guest) => (
                  <UnassignedGuestItem
                    key={guest.id}
                    guest={guest}
                    isSelected={selectedGuests.has(guest.id)}
                    onToggle={handleToggleGuest}
                  />
                ))}
                {filteredUnassignedGuests.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    {t('seating.assignmentDialog.noUnassignedGuests')}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Bulk Assign Controls */}
            {selectedGuests.size > 0 && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" gutterBottom>
                  {t('seating.assignmentDialog.selectedCount', { count: selectedGuests.size })}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <Select
                      value={bulkAssignTableId}
                      onChange={(e) => setBulkAssignTableId(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">{t('seating.assignmentDialog.selectTable')}</MenuItem>
                      {tables.map((table) => {
                        const assigned = assignments.get(table.id) || [];
                        return (
                          <MenuItem key={table.id} value={table.id}>
                            {table.name || `Table ${table.number}`} ({assigned.length}/{table.capacity})
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleBulkAssign}
                    disabled={!bulkAssignTableId}
                  >
                    {t('seating.assignmentDialog.assign')}
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>

          {/* Right Panel - Tables */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {t('seating.assignmentDialog.tablesAndAssignments')}
            </Typography>

            <Stack spacing={1}>
              {tables.map((table) => {
                const tableGuests = assignments.get(table.id) || [];
                const isOverCapacity = tableGuests.length > table.capacity;

                return (
                  <TableAccordion
                    key={table.id}
                    table={table}
                    assignedGuestIds={tableGuests}
                    getGuest={getGuest}
                    onRemoveGuest={handleRemoveGuestFromTable}
                    onDropGuest={handleAssignGuestToTable}
                    isOverCapacity={isOverCapacity}
                  />
                );
              })}
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isApplying}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={isApplying}
          startIcon={isApplying && <CircularProgress size={16} />}
        >
          {t('seating.assignmentDialog.applyChanges')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Unassigned Guest Item Component
interface UnassignedGuestItemProps {
  guest: Invitee;
  isSelected: boolean;
  onToggle: (guestId: string) => void;
}

const UnassignedGuestItem: React.FC<UnassignedGuestItemProps> = ({
  guest,
  isSelected,
  onToggle,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'GUEST',
    item: { guest },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Box
      ref={drag as any}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1,
        border: 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderRadius: 1,
        bgcolor: isSelected ? 'primary.lighter' : 'transparent',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          bgcolor: isSelected ? 'primary.light' : 'action.hover',
        },
      }}
      onClick={() => onToggle(guest.id)}
    >
      <Checkbox checked={isSelected} size="small" sx={{ p: 0, mr: 1 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {guest.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {guest.relation} • {guest.side}
        </Typography>
      </Box>
    </Box>
  );
};

// Table Accordion Component
interface TableAccordionProps {
  table: Table;
  assignedGuestIds: string[];
  getGuest: (guestId: string) => Invitee | undefined;
  onRemoveGuest: (guestId: string, tableId: string) => void;
  onDropGuest: (guestId: string, tableId: string) => void;
  isOverCapacity: boolean;
}

const TableAccordion: React.FC<TableAccordionProps> = ({
  table,
  assignedGuestIds,
  getGuest,
  onRemoveGuest,
  onDropGuest,
  isOverCapacity,
}) => {
  const { t } = useTranslation();

  const [{ isOver }, drop] = useDrop({
    accept: 'GUEST',
    drop: (item: { guest: Invitee; guestId?: string }) => {
      // Support both formats: GuestChip passes { guest }, others might pass { guestId }
      const guestId = item.guestId || item.guest?.id;
      if (guestId) {
        onDropGuest(guestId, table.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Accordion defaultExpanded={assignedGuestIds.length > 0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <Typography fontWeight="medium">
            {table.name || `Table ${table.number}`}
          </Typography>
          <Chip
            label={`${assignedGuestIds.length}/${table.capacity}`}
            size="small"
            color={isOverCapacity ? 'error' : assignedGuestIds.length === table.capacity ? 'warning' : 'default'}
          />
          {table.isVIP && (
            <Chip label="VIP" size="small" color="secondary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          ref={drop as any}
          sx={{
            minHeight: 80,
            p: 1,
            border: 1,
            borderColor: isOver ? 'primary.main' : 'divider',
            borderRadius: 1,
            bgcolor: isOver ? 'primary.lighter' : 'transparent',
          }}
        >
          {isOverCapacity && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              {t('seating.assignmentDialog.overCapacity')}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {assignedGuestIds.map((guestId) => {
              const guest = getGuest(guestId);
              if (!guest) return null;

              return (
                <Chip
                  key={guestId}
                  label={guest.name}
                  size="small"
                  onDelete={() => onRemoveGuest(guestId, table.id)}
                />
              );
            })}
            {assignedGuestIds.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {t('seating.assignmentDialog.dropGuestsHere')}
              </Typography>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default AssignmentDialog;
