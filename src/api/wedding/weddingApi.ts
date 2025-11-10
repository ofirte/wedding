import {
  Wedding,
  WeddingMemberInput,
  WeddingPlans,
} from "@wedding-plan/types";
import { createGeneralCollectionAPI } from "../generalFirebaseHelpers";
import { normalizeToUTCMidnight } from "../../utils/weddingDateUtils";

const WeddingApi = createGeneralCollectionAPI<Wedding>("weddings");
// Find wedding by invitation code

// Generate a unique invitation code with collision detection
export const generateInvitationCode = async (
  weddingName: string
): Promise<string> => {
  const generateCode = (name: string): string => {
    // Use first 3-4 letters of wedding name for readability
    const sanitizedName = name
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .substring(0, 3);

    // Generate 5-6 random characters for better entropy
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    return `${sanitizedName}${randomSuffix}`;
  };

  // Check for uniqueness and retry if needed
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateCode(weddingName);

    try {
      // Check if code already exists in weddings collection
      const weddingWithSameCode = await getWeddingByInvitationCode(code);
      if (!weddingWithSameCode) {
        return code; // Unique code found
      }

      attempts++;
    } catch (error) {
      console.error("Error checking invitation code uniqueness:", error);
      attempts++;
    }
  }
  const timestamp = Date.now().toString(36).toUpperCase();
  return `WED${timestamp}`;
};

export const getWeddingByInvitationCode = async (
  invitationCode: string
): Promise<Wedding | null> => {
  try {
    const weddings = await WeddingApi.fetchByFilter([
      { field: "invitationCode", op: "==", value: invitationCode },
    ]);
    if (weddings.length > 0) {
      return weddings[0];
    }
  } catch (error) {
    console.error("Error getting wedding by invitation code:", error);
  }
  return null;
};

export const getWeddingDetails = async (
  weddingId: string
): Promise<Wedding | null> => {
  try {
    const wedding = await WeddingApi.fetchById(weddingId);
    return wedding;
  } catch (error) {
    console.error("Error getting wedding details:", error);
    return null;
  }
};

export const getWeddingsDetailsBulk = async (
  weddingIds: string[]
): Promise<Wedding[]> => {
  try {
    const weddings = await WeddingApi.fetchByFilter([
      { field: "id", op: "in", value: weddingIds },
    ]);
    return weddings;
  } catch (error) {
    console.error("Error getting weddings details in bulk:", error);
    return [];
  }
};

export const joinWedding = async (
  userId: string,
  weddingIdentifier: string,
  isInvitationCode: boolean = false
): Promise<Wedding> => {
  try {
    const weddingData = isInvitationCode
      ? await getWeddingByInvitationCode(weddingIdentifier)
      : await getWeddingDetails(weddingIdentifier);
    if (!weddingData) {
      throw new Error("Wedding not found");
    }
    const weddingMembers = weddingData.members || {};
    const newMember: WeddingMemberInput = {
      plan: "free",
      addedAt: new Date().toISOString(),
      addedBy: "invitation",
    };
    await WeddingApi.update(weddingData.id, {
      members: { ...weddingMembers, [userId]: newMember },
    });
    return {
      ...weddingData,
      members: { ...weddingMembers, [userId]: newMember },
    };
  } catch (error) {
    console.error("Error joining wedding:", error);
    throw error;
  }
};

// Update wedding details
export const updateWeddingDetails = async (
  weddingId: string,
  data: Partial<Wedding>
): Promise<void> => {
  try {
    // Ensure wedding date is stored as UTC midnight for consistent timezone handling
    const processedData = { ...data };
    if (processedData.date && processedData.date instanceof Date) {
      const utcDate = normalizeToUTCMidnight(processedData.date);
      processedData.date = utcDate as any; // Will be converted to Timestamp in Firebase
    }

    await WeddingApi.update(weddingId, processedData);
  } catch (error) {
    console.error("Error updating wedding details:", error);
    throw error;
  }
};

// Add a user to a wedding
// Note: Users inherit the wedding's plan, no need for individual plan parameter
export const addUserToWedding = async (
  weddingId: string,
  userId: string,
  addedBy: string = "admin"
): Promise<void> => {
  try {
    const wedding = await WeddingApi.fetchById(weddingId);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    const currentMembers = wedding.members || {};
    const newMember: WeddingMemberInput = {
      addedAt: new Date().toISOString(),
      addedBy,
    };

    await WeddingApi.update(weddingId, {
      members: {
        ...currentMembers,
        [userId]: newMember,
      },
    });
  } catch (error) {
    console.error("Error adding user to wedding:", error);
    throw error;
  }
};

export const removeUserFromWedding = async (
  weddingId: string,
  userId: string
): Promise<void> => {
  try {
    const wedding = await WeddingApi.fetchById(weddingId);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    const currentMembers = wedding.members || {};
    if (!currentMembers[userId]) {
      throw new Error("User is not a member of this wedding");
    }

    const { [userId]: _, ...updatedMembers } = currentMembers;

    await WeddingApi.update(weddingId, {
      members: updatedMembers,
    });
  } catch (error) {
    console.error("Error removing user from wedding:", error);
    throw error;
  }
};

// Get all weddings
export const getAllWeddings = async (): Promise<Wedding[]> => {
  try {
    return await WeddingApi.fetchAll();
  } catch (error) {
    console.error("Error fetching all weddings:", error);
    return [];
  }
};

export const deleteWedding = async (weddingId: string): Promise<void> => {
  try {
    await WeddingApi.delete(weddingId);
  } catch (error) {
    console.error("Error deleting wedding:", error);
    throw error;
  }
};

// Create a new wedding for a user
export const createWedding = async (
  weddingData: Omit<Wedding, "id" | "createdAt" | "userIds" | "members">,
  userId: string
): Promise<string> => {
  try {
    // Generate unique invitation code for the wedding
    const invitationCode = await generateInvitationCode(weddingData.name);

    // Create initial member record for the creator
    const creatorMember: WeddingMemberInput = {
      addedAt: new Date().toISOString(),
      addedBy: "self",
    };
    const processedWeddingDate = normalizeToUTCMidnight(weddingData.date);

    // Create a wedding document
    const weddingRef = await WeddingApi.create({
      ...weddingData,
      date: processedWeddingDate,
      createdAt: new Date(),
      invitationCode,
      plan: WeddingPlans.FREE, // Default plan at wedding level
      members: {
        [userId]: creatorMember,
      },
    });

    return weddingRef.id;
  } catch (error) {
    console.error("Error creating wedding:", error);
    throw error;
  }
};
