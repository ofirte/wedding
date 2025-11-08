/**
 * Seating Arrangement Model Types
 * Seating-related entity models shared between frontend and backend
 */

export interface SeatingArrangement {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  settings: SeatingSettings;
}

export interface Table {
  id: string;
  arrangementId: string;
  number: number | string;
  name?: string;
  shape: "round" | "rectangular" | "square";
  capacity: number;
  assignedGuests: string[]; // Invitee IDs
  position: { x: number; y: number };
  rotation?: number;
  notes?: string;
  isVIP?: boolean;
}

export interface LayoutElement {
  id: string;
  arrangementId: string;
  type: "stage" | "bar" | "food-court" | "entrance" | "bathroom" | "dance-floor";
  name?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation?: number;
  notes?: string;
}

export interface SeatingSettings {
  autoAssignmentRules: {
    groupByRelation: boolean;
    groupBySide: boolean;
  };
  canvasWidth: number;
  canvasHeight: number;
}
