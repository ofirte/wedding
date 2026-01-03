import {
  createGeneralCollectionAPI,
} from "../generalFirebaseHelpers";
import { Lead, LeadEvent } from "@wedding-plan/types";
import { auth } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Create basic CRUD operations for leads using the general collection API
const leadsAPI = createGeneralCollectionAPI<Lead>("leads");

/**
 * Get the current producer's user ID
 */
const getCurrentProducerId = (): string => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user - please sign in");
  }
  return user.uid;
};

/**
 * Fetch all leads for the current producer
 */
export const fetchLeads = async (): Promise<Lead[]> => {
  const producerId = getCurrentProducerId();
  return leadsAPI.fetchByFilter([
    { field: "producerId", op: "==", value: producerId },
  ]);
};

/**
 * Fetch a single lead by ID (validates ownership)
 */
export const fetchLead = async (leadId: string): Promise<Lead | null> => {
  const lead = await leadsAPI.fetchById(leadId);
  if (!lead) return null;

  // Validate that this lead belongs to the current producer
  const producerId = getCurrentProducerId();
  if (lead.producerId !== producerId) {
    throw new Error("Unauthorized: This lead belongs to another producer");
  }

  return lead;
};

/**
 * Create a new lead for the current producer
 */
export const createLead = async (
  leadData: Omit<Lead, "id" | "producerId" | "createdAt">
): Promise<any> => {
  const producerId = getCurrentProducerId();
  const now = new Date().toISOString();

  const newLead: Omit<Lead, "id"> = {
    ...leadData,
    producerId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await leadsAPI.create(newLead);

  // Log the creation event
  await createLeadEvent(docRef.id, {
    type: "created",
    description: `Lead created`,
    metadata: {
      status: leadData.status,
    },
  });

  return docRef;
};

/**
 * Update a lead (validates ownership)
 */
export const updateLead = async (
  leadId: string,
  updates: Partial<Lead>
): Promise<void> => {
  // Validate ownership first
  await fetchLead(leadId);

  const now = new Date().toISOString();
  return leadsAPI.update(leadId, {
    ...updates,
    updatedAt: now,
  });
};

/**
 * Delete a lead (validates ownership)
 */
export const deleteLead = async (leadId: string): Promise<void> => {
  // Validate ownership first
  await fetchLead(leadId);

  return leadsAPI.delete(leadId);
};

/**
 * Bulk update multiple leads (validates ownership of all)
 */
export const bulkUpdateLeads = async (
  updates: Array<{ id: string; data: Partial<Lead> }>
): Promise<void> => {
  // Validate ownership of all leads first
  await Promise.all(updates.map((update) => fetchLead(update.id)));

  const now = new Date().toISOString();
  const updatesWithTimestamp = updates.map((update) => ({
    ...update,
    data: {
      ...update.data,
      updatedAt: now,
    },
  }));

  return leadsAPI.bulkUpdate(updatesWithTimestamp);
};

/**
 * Bulk delete multiple leads (validates ownership of all)
 */
export const bulkDeleteLeads = async (leadIds: string[]): Promise<void> => {
  // Validate ownership of all leads first
  await Promise.all(leadIds.map((id) => fetchLead(id)));

  return leadsAPI.bulkDelete(leadIds);
};

// ===== Lead Events (Activity Log) =====

/**
 * Create a lead event (activity log entry)
 */
export const createLeadEvent = async (
  leadId: string,
  eventData: Omit<LeadEvent, "id" | "leadId" | "userId" | "userName" | "timestamp">
): Promise<any> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }

  // Validate lead ownership
  await fetchLead(leadId);

  const eventsCollection = collection(db, "leads", leadId, "events");

  const newEvent: Omit<LeadEvent, "id"> = {
    ...eventData,
    leadId,
    userId: user.uid,
    userName: user.displayName || user.email || "Unknown User",
    timestamp: new Date().toISOString(),
  };

  return addDoc(eventsCollection, newEvent);
};

/**
 * Fetch all events for a lead (validates ownership)
 */
export const fetchLeadEvents = async (leadId: string): Promise<LeadEvent[]> => {
  // Validate lead ownership
  await fetchLead(leadId);

  const eventsCollection = collection(db, "leads", leadId, "events");
  const eventsSnapshot = await getDocs(eventsCollection);

  return eventsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LeadEvent[];
};
