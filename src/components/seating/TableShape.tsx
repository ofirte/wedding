import React, { useRef } from "react";
import { Group, Circle, Rect, Text } from "react-konva";
import { Table } from "@wedding-plan/types";
import Konva from "konva";

interface TableShapeProps {
  table: Table;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onGuestDrop?: (guestId: string, tableId: string) => void;
}

const TableShape: React.FC<TableShapeProps> = ({
  table,
  isSelected,
  onSelect,
  onDragEnd,
}) => {
  const groupRef = useRef<Konva.Group>(null);

  // Calculate size based on capacity (scale factor: 4 pixels per seat)
  const getScaleSize = () => {
    const baseSize = 30;
    const scalePerSeat = 4;
    return baseSize + (table.capacity * scalePerSeat);
  };

  const getFillColor = () => {
    if (isSelected) return "#B8D1E0"; // Info light - selected
    if (table.assignedGuests.length >= table.capacity) return "#B7D9BD"; // Success - full
    if (table.assignedGuests.length > 0) return "#F0E5B2"; // Warning - partial
    return "#FFFFFF"; // White - empty
  };

  const getStrokeColor = () => {
    if (isSelected) return "#4A6F8A";
    return "#D1E4C4";
  };

  const renderShape = () => {
    const fillColor = getFillColor();
    const strokeColor = getStrokeColor();
    const strokeWidth = isSelected ? 3 : 2;
    const size = getScaleSize();

    switch (table.shape) {
      case "round":
        return (
          <Circle
            radius={size}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case "rectangular":
        return (
          <Rect
            x={-size * 1.2}
            y={-size * 0.6}
            width={size * 2.4}
            height={size * 1.2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            cornerRadius={4}
          />
        );
      case "square":
        return (
          <Rect
            x={-size * 0.8}
            y={-size * 0.8}
            width={size * 1.6}
            height={size * 1.6}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            cornerRadius={4}
          />
        );
      default:
        return null;
    }
  };

  const getTextWidth = () => {
    const size = getScaleSize();
    switch (table.shape) {
      case "rectangular":
        return size * 2.4;
      case "square":
        return size * 1.6;
      case "round":
      default:
        return size * 2;
    }
  };

  const getTextY = (isTopText: boolean) => {
    switch (table.shape) {
      case "rectangular":
        return isTopText ? -10 : 5;
      case "square":
        return isTopText ? -10 : 5;
      case "round":
      default:
        return isTopText ? -12 : 4;
    }
  };

  return (
    <Group
      ref={groupRef}
      x={table.position.x}
      y={table.position.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={(e) => {
        // Prevent drag event from bubbling to Stage
        e.cancelBubble = true;
      }}
      onDragEnd={(e) => {
        // Stop propagation to prevent Stage from panning
        e.cancelBubble = true;
        onDragEnd({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      {/* Table Shape */}
      {renderShape()}

      {/* Table Name or Number */}
      <Text
        text={table.name || `Table ${table.number}`}
        fontSize={14}
        fontFamily="Arial"
        fontStyle="bold"
        fill="#333333"
        align="center"
        width={getTextWidth()}
        x={-getTextWidth() / 2}
        y={getTextY(true)}
      />

      {/* Capacity Display */}
      <Text
        text={`${table.assignedGuests.length}/${table.capacity}`}
        fontSize={12}
        fontFamily="Arial"
        fill="#666666"
        align="center"
        width={getTextWidth()}
        x={-getTextWidth() / 2}
        y={getTextY(false)}
      />

      {/* Selection Indicator */}
      {isSelected && (() => {
        const size = getScaleSize();
        const padding = 5;
        switch (table.shape) {
          case "rectangular":
            return (
              <Rect
                x={-size * 1.2 - padding}
                y={-size * 0.6 - padding}
                width={size * 2.4 + padding * 2}
                height={size * 1.2 + padding * 2}
                stroke="#4A6F8A"
                strokeWidth={2}
                dash={[5, 5]}
                cornerRadius={8}
              />
            );
          case "square":
            return (
              <Rect
                x={-size * 0.8 - padding}
                y={-size * 0.8 - padding}
                width={size * 1.6 + padding * 2}
                height={size * 1.6 + padding * 2}
                stroke="#4A6F8A"
                strokeWidth={2}
                dash={[5, 5]}
                cornerRadius={8}
              />
            );
          case "round":
          default:
            return (
              <Circle
                radius={size + padding}
                stroke="#4A6F8A"
                strokeWidth={2}
                dash={[5, 5]}
              />
            );
        }
      })()}
    </Group>
  );
};

export default TableShape;
