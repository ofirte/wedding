import React, { useRef, useEffect } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import { LayoutElement } from "@wedding-plan/types";
import Konva from "konva";

interface LayoutElementShapeProps {
  element: LayoutElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
}

const LayoutElementShape: React.FC<LayoutElementShapeProps> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onSizeChange,
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

  // Handle transform end to update size
  const handleTransformEnd = () => {
    if (!groupRef.current) return;

    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Calculate new size based on scale
    const newWidth = Math.max(50, element.size.width * scaleX);
    const newHeight = Math.max(50, element.size.height * scaleY);

    // Reset scale to 1 after applying size change
    node.scaleX(1);
    node.scaleY(1);

    onSizeChange({ width: newWidth, height: newHeight });
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
      {/* Element Rectangle */}
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
      />

      {/* Element Icon */}
      <Text
        text={getElementIcon()}
        fontSize={24}
        fontFamily="Arial"
        align="center"
        width={element.size.width}
        x={-element.size.width / 2}
        y={-element.size.height / 2 + 10}
      />

      {/* Element Label */}
      <Text
        text={getElementLabel()}
        fontSize={14}
        fontFamily="Arial"
        fontStyle="bold"
        fill="#FFFFFF"
        align="center"
        width={element.size.width}
        x={-element.size.width / 2}
        y={-element.size.height / 2 + 40}
      />

      {/* Selection Indicator */}
      {isSelected && (
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
      )}
      </Group>

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
