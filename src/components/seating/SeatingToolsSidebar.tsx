import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Stack,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MeetingRoom as StageIcon,
  LocalBar as BarIcon,
  Restaurant as FoodIcon,
  MusicNote as DanceIcon,
  Input as EntranceIcon,
  Wc as BathroomIcon,
} from "@mui/icons-material";
import { Table, Invitee, LayoutElement } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import GuestChip from "./GuestChip";
import { getUnassignedGuests } from "../../api/seating/seatingApi";

interface SeatingToolsSidebarProps {
  tables: Table[];
  invitees: Invitee[];
  onBulkAddClick: () => void;
  onTemplateSelect?: (templateId: string) => void;
  onAddLayoutElement?: (type: LayoutElement["type"]) => void;
}

const SeatingToolsSidebar: React.FC<SeatingToolsSidebarProps> = ({
  tables,
  invitees,
  onBulkAddClick,
  onTemplateSelect,
  onAddLayoutElement,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRelation, setFilterRelation] = useState("all");
  const [filterSide, setFilterSide] = useState("all");

  // Get unassigned guests
  const unassignedGuests = useMemo(
    () => getUnassignedGuests(invitees, tables),
    [invitees, tables]
  );

  // Get unique relations and sides for filters
  const uniqueRelations = useMemo(() => {
    const relations = new Set(invitees.map((inv) => inv.relation));
    return Array.from(relations).filter(Boolean);
  }, [invitees]);

  const uniqueSides = useMemo(() => {
    const sides = new Set(invitees.map((inv) => inv.side));
    return Array.from(sides).filter(Boolean);
  }, [invitees]);

  // Filter guests based on search and filters
  const filteredGuests = useMemo(() => {
    return unassignedGuests.filter((guest) => {
      const matchesSearch =
        searchQuery === "" ||
        guest.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRelation =
        filterRelation === "all" || guest.relation === filterRelation;
      const matchesSide = filterSide === "all" || guest.side === filterSide;

      return matchesSearch && matchesRelation && matchesSide;
    });
  }, [unassignedGuests, searchQuery, filterRelation, filterSide]);

  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Actions Section */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="info"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onBulkAddClick}
          sx={{ mb: 2 }}
        >
          {t("seating.actions.addTables")}
        </Button>

        {/* Templates Dropdown */}
        {onTemplateSelect && (
          <FormControl fullWidth size="small">
            <InputLabel>{t("seating.templates.title")}</InputLabel>
            <Select
              value=""
              onChange={(e) => onTemplateSelect(e.target.value)}
              label={t("seating.templates.title")}
            >
              <MenuItem value="standard-150">
                {t("seating.templates.standard")} (150)
              </MenuItem>
              <MenuItem value="intimate-50">
                {t("seating.templates.intimate")} (50)
              </MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <Divider />

      {/* Layout Elements Section */}
      {onAddLayoutElement && (
        <>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
              {t("seating.layoutElements.title")}
            </Typography>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<StageIcon />}
                onClick={() => onAddLayoutElement("stage")}
                sx={{ justifyContent: "flex-start" }}
              >
                {t("seating.layoutElements.types.stage")}
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<BarIcon />}
                onClick={() => onAddLayoutElement("bar")}
                sx={{ justifyContent: "flex-start" }}
              >
                {t("seating.layoutElements.types.bar")}
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<FoodIcon />}
                onClick={() => onAddLayoutElement("food-court")}
                sx={{ justifyContent: "flex-start" }}
              >
                {t("seating.layoutElements.types.foodCourt")}
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<DanceIcon />}
                onClick={() => onAddLayoutElement("dance-floor")}
                sx={{ justifyContent: "flex-start" }}
              >
                {t("seating.layoutElements.types.danceFloor")}
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<EntranceIcon />}
                onClick={() => onAddLayoutElement("entrance")}
                sx={{ justifyContent: "flex-start" }}
              >
                {t("seating.layoutElements.types.entrance")}
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<BathroomIcon />}
                onClick={() => onAddLayoutElement("bathroom")}
                sx={{ justifyContent: "flex-start" }}
              >
                {t("seating.layoutElements.types.bathroom")}
              </Button>
            </Stack>
          </Box>

          <Divider />
        </>
      )}


      {/* Unassigned Guests Section */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t("seating.assignment.unassigned")} ({unassignedGuests.length})
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ px: 2, pb: 1 }}>
          <Stack spacing={1.5}>
            {/* Search */}
            <TextField
              placeholder={t("seating.assignment.filter.searchGuests")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Relation Filter */}
            {uniqueRelations.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>{t("seating.assignment.filter.byRelation")}</InputLabel>
                <Select
                  value={filterRelation}
                  onChange={(e) => setFilterRelation(e.target.value)}
                  label={t("seating.assignment.filter.byRelation")}
                >
                  <MenuItem value="all">{t("seating.assignment.filter.all")}</MenuItem>
                  {uniqueRelations.map((relation) => (
                    <MenuItem key={relation} value={relation}>
                      {relation}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Side Filter */}
            {uniqueSides.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>{t("seating.assignment.filter.bySide")}</InputLabel>
                <Select
                  value={filterSide}
                  onChange={(e) => setFilterSide(e.target.value)}
                  label={t("seating.assignment.filter.bySide")}
                >
                  <MenuItem value="all">{t("seating.assignment.filter.all")}</MenuItem>
                  {uniqueSides.map((side) => (
                    <MenuItem key={side} value={side}>
                      {side}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Box>

        {/* Guest List */}
        <Paper
          sx={{
            flex: 1,
            overflow: "auto",
            m: 2,
            mt: 1,
            p: 1.5,
            bgcolor: "grey.50",
          }}
        >
          {filteredGuests.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              {unassignedGuests.length === 0
                ? t("seating.assignment.allAssigned")
                : t("seating.assignment.noMatchingGuests")}
            </Typography>
          ) : (
            <Stack spacing={1}>
              {filteredGuests.map((guest) => (
                <GuestChip key={guest.id} guest={guest} />
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default SeatingToolsSidebar;
