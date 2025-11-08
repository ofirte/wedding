import React, { useRef, useState, useEffect } from "react";
import { Box } from "@mui/material";
import { Stage, Layer } from "react-konva";
import { Table, LayoutElement } from "@wedding-plan/types";
import TableShape from "./TableShape";
import LayoutElementShape from "./LayoutElementShape";
import { KonvaEventObject } from "konva/lib/Node";

interface SeatingCanvasProps {
  tables: Table[];
  layoutElements?: LayoutElement[];
  selectedTableId: string | null;
  selectedElementId?: string | null;
  onTableSelect: (tableId: string | null) => void;
  onTableEdit?: (tableId: string) => void;
  onElementSelect?: (elementId: string | null) => void;
  onElementEdit?: (elementId: string) => void;
  onTableMove: (tableId: string, position: { x: number; y: number }) => void;
  onElementMove?: (
    elementId: string,
    position: { x: number; y: number }
  ) => void;
  onElementResize?: (
    elementId: string,
    size: { width: number; height: number }
  ) => void;
  onElementRotate?: (elementId: string, rotation: number) => void;
  onGuestDrop?: (guestId: string, tableId: string) => void;
}

const SeatingCanvas: React.FC<SeatingCanvasProps> = ({
  tables,
  layoutElements = [],
  selectedTableId,
  selectedElementId,
  onTableSelect,
  onTableEdit,
  onElementSelect,
  onElementEdit,
  onTableMove,
  onElementMove,
  onElementResize,
  onElementRotate,
  onGuestDrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Update canvas dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Handle zoom with mouse wheel
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const mousePointTo = {
      x: (pointerPosition.x - stage.x()) / oldScale,
      y: (pointerPosition.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Limit scale between 0.3 and 3
    const limitedScale = Math.max(0.3, Math.min(3, newScale));

    setScale(limitedScale);

    const newPos = {
      x: pointerPosition.x - mousePointTo.x * limitedScale,
      y: pointerPosition.y - mousePointTo.y * limitedScale,
    };
    setStagePos(newPos);
  };

  // Handle click on stage background to deselect
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Check if clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      onTableSelect(null);
      if (onElementSelect) {
        onElementSelect(null);
      }
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "#f5f5f5",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        draggable
        onDragEnd={(e) => {
          // Only update stage position if the stage itself was dragged (not a child)
          if (e.target === e.target.getStage()) {
            setStagePos({
              x: e.target.x(),
              y: e.target.y(),
            });
          }
        }}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Grid background - subtle */}
          {/* Can be enhanced with actual grid lines if needed */}

          {/* Render all layout elements */}
          {layoutElements.map((element) => (
            <LayoutElementShape
              key={
                element.id +
                element.position.x +
                element.position.y +
                element.size.width +
                element.size.height +
                element.rotation
              }
              element={element}
              isSelected={selectedElementId === element.id}
              onSelect={() => {
                if (onElementSelect) {
                  onElementSelect(element.id);
                  onTableSelect(null); // Deselect tables when selecting an element
                }
              }}
              onEdit={() => {
                if (onElementEdit) {
                  onElementEdit(element.id);
                }
              }}
              onDragEnd={(pos) => {
                if (onElementMove) {
                  onElementMove(element.id, pos);
                }
              }}
              onSizeChange={(size) => {
                if (onElementResize) {
                  onElementResize(element.id, size);
                }
              }}
              onRotationChange={(rotation) => {
                if (onElementRotate) {
                  onElementRotate(element.id, rotation);
                }
              }}
            />
          ))}

          {/* Render all tables */}
          {tables.map((table) => (
            <TableShape
              key={table.id}
              table={table}
              isSelected={selectedTableId === table.id}
              onSelect={() => {
                onTableSelect(table.id);
                if (onElementSelect) {
                  onElementSelect(null); // Deselect elements when selecting a table
                }
              }}
              onEdit={() => {
                if (onTableEdit) {
                  onTableEdit(table.id);
                }
              }}
              onDragEnd={(pos) => onTableMove(table.id, pos)}
              onGuestDrop={onGuestDrop}
            />
          ))}
        </Layer>
      </Stage>

      {/* Zoom indicator */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          bgcolor: "background.paper",
          px: 2,
          py: 1,
          borderRadius: 1,
          boxShadow: 1,
          fontSize: "0.875rem",
          color: "text.secondary",
        }}
      >
        {Math.round(scale * 100)}%
      </Box>
    </Box>
  );
};

export default SeatingCanvas;
