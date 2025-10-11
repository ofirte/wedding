import { createGeneralCollectionAPI } from "../generalFirebaseHelpers";
import { Wedding, WeddingMemberInput, WeddingPlans } from "./types";

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
    await WeddingApi.update(weddingId, data);
  } catch (error) {
    console.error("Error updating wedding details:", error);
    throw error;
  }
};

// Create a new wedding for a user
export const createWedding = async (
  userId: string,
  weddingName: string,
  weddingDate: Date,
  brideName?: string,
  groomName?: string
): Promise<string> => {
  try {
    // Generate unique invitation code for the wedding
    const invitationCode = await generateInvitationCode(weddingName);

    // Create initial member record for the creator
    const creatorMember: WeddingMemberInput = {
      plan: WeddingPlans.FREE, // Default plan
      addedAt: new Date().toISOString(),
      addedBy: "self",
    };

    // Create a wedding document
    const weddingRef = await WeddingApi.create({
      name: weddingName,
      date: weddingDate || null,
      createdAt: new Date(),
      brideName: brideName || "",
      groomName: groomName || "",
      invitationCode,
      userIds: [],
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
