import React, { useRef, useEffect, useState } from "react";
import { Group, Rect, Text, Transformer, Circle } from "react-konva";
import { LayoutElement } from "@wedding-plan/types";
import { Edit as EditIcon } from "@mui/icons-material";
import Konva from "konva";
import { Box } from "@mui/system";

interface LayoutElementShapeProps {
  element: LayoutElement;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  onRotationChange: (rotation: number) => void;
}

const LayoutElementShape: React.FC<LayoutElementShapeProps> = ({
  element,
  isSelected,
  onSelect,
  onEdit,
  onDragEnd,
  onSizeChange,
  onRotationChange,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach transformer to the selected element
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Handle transform end to update size and rotation
  const handleTransformEnd = () => {
    if (!groupRef.current) return;
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    const newWidth = Math.max(5, element.size.width * scaleX);
    const newHeight = Math.max(5, element.size.height * scaleY);

    node.scaleX(1);
    node.scaleY(1);
    node.getLayer()?.batchDraw();

    onSizeChange({ width: newWidth, height: newHeight });

    // Persist rotation if it changed
    if (rotation !== (element.rotation || 0)) {
      onRotationChange(rotation);
    }
  };
  const getEditButtonPosition = () => {
    const rotation = (element.rotation || 0) * (Math.PI / 180); // Convert to radians

    // Offset from center (top-right corner + padding)
    const offsetX = element.size.width / 2 + 30;
    const offsetY = -element.size.height / 2 - 30;

    // Rotate the offset around the origin
    const rotatedX =
      offsetX * Math.cos(rotation) - offsetY * Math.sin(rotation);
    const rotatedY =
      offsetX * Math.sin(rotation) + offsetY * Math.cos(rotation);

    return {
      x: element.position.x + rotatedX,
      y: element.position.y + rotatedY,
    };
  };
  const getElementColor = () => {
    switch (element.type) {
      case "stage":
        return "#8B4513"; // Brown for stage
      case "bar":
        return "#4A90E2"; // Blue for bar
      case "food-court":
        return "#E67E22"; // Orange for food court
      case "dance-floor":
        return "#9B59B6"; // Purple for dance floor
      case "entrance":
        return "#27AE60"; // Green for entrance
      case "bathroom":
        return "#95A5A6"; // Gray for bathroom
      default:
        return "#BDC3C7"; // Default gray
    }
  };

  const getElementIcon = () => {
    switch (element.type) {
      case "stage":
        return "🎭";
      case "bar":
        return "🍸";
      case "food-court":
        return "🍽️";
      case "dance-floor":
        return "💃";
      case "entrance":
        return "🚪";
      case "bathroom":
        return "🚻";
      default:
        return "📍";
    }
  };

  const getElementLabel = () => {
    if (element.name) return element.name;

    switch (element.type) {
      case "stage":
        return "Stage";
      case "bar":
        return "Bar";
      case "food-court":
        return "Food Court";
      case "dance-floor":
        return "Dance Floor";
      case "entrance":
        return "Entrance";
      case "bathroom":
        return "Restroom";
      default:
        return "Element";
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={element.position.x}
        y={element.position.y}
        rotation={element.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={(e) => {
          e.cancelBubble = true;
        }}
        onDragEnd={(e) => {
          e.cancelBubble = true;
          onDragEnd({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={handleTransformEnd}
      >
        {/* Element Shape - Circle or Rectangle */}
        {element.shape === "circle" ? (
          <Circle
            radius={element.size.width / 2}
            fill={getElementColor()}
            stroke={isSelected ? "#4A6F8A" : "#333333"}
            strokeWidth={isSelected ? 3 : 2}
            opacity={0.8}
            perfectDrawEnabled={false}
          />
        ) : (
          <Rect
            x={-element.size.width / 2}
            y={-element.size.height / 2}
            width={element.size.width}
            height={element.size.height}
            fill={getElementColor()}
            stroke={isSelected ? "#4A6F8A" : "#333333"}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={8}
            opacity={0.8}
            perfectDrawEnabled={false}
          />
        )}

        {/* Element Icon */}
        <Text
          text={getElementIcon()}
          fontSize={element.size.height/4}
          fontFamily="Arial"
          align="center"
          width={element.size.width}
          x={-element.size.width / 2}
          y={element.shape === "circle" ? -10 : -element.size.height / 2 + 10}
        />

        {/* Element Label */}
        <Text
          text={getElementLabel()}
          fontSize={element.size.height/4}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#FFFFFF"
          align="center"
          width={element.size.width}
          x={-element.size.width / 2}
          y={element.shape === "circle" ? 10 : -element.size.height / 2 + 40}
        />

        {/* Selection Indicator */}
        {isSelected && (element.shape === "circle" ? (
          <Circle
            radius={element.size.width / 2 + 5}
            stroke="#4A6F8A"
            strokeWidth={2}
            dash={[5, 5]}
          />
        ) : (
          <Rect
            x={-element.size.width / 2 - 5}
            y={-element.size.height / 2 - 5}
            width={element.size.width + 10}
            height={element.size.height + 10}
            stroke="#4A6F8A"
            strokeWidth={2}
            dash={[5, 5]}
            cornerRadius={10}
          />
        ))}

        {/* Edit Icon - Shows on hover when selected */}
      </Group>
      {isSelected && (
        <Group
          x={getEditButtonPosition().x}
          y={getEditButtonPosition().y}
          onClick={(e) => {
            e.cancelBubble = true;
            onEdit();
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onEdit();
          }}
        >
          {/* Icon Background Circle */}
          <Circle
            radius={14}
            fill="#4A6F8A"
            stroke="#FFFFFF"
            strokeWidth={2}
            shadowColor="black"
            shadowBlur={4}
            shadowOpacity={0.3}
            shadowOffsetY={2}
          />
          <Text
            text={"✏️"}
            fontSize={16}
            fontFamily="Arial"
            align="center"
            verticalAlign="middle"
            offsetX={8}
            offsetY={8}
          />
        </Group>
      )}
      {/* Transformer for resizing when selected */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size to 50x50
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default LayoutElementShape;
