import { GoogleContact } from "./googleContactsApi";

/**
 * Search contacts by name with improved fuzzy matching
 */
export const searchContactsByName = (
  contacts: GoogleContact[],
  searchTerm: string
): GoogleContact[] => {
  if (!searchTerm.trim()) {
    return contacts;
  }

  const term = searchTerm.toLowerCase().trim();
  const searchWords = term.split(/\s+/).filter((word) => word.length > 0);

  return contacts
    .map((contact) => {
      if (!contact.names || contact.names.length === 0) return null;

      let score = 0;
      let hasMatch = false;

      contact.names.forEach((name) => {
        const displayName = name.displayName?.toLowerCase() || "";
        const givenName = name.givenName?.toLowerCase() || "";
        const familyName = name.familyName?.toLowerCase() || "";

        // Check for exact matches (highest score)
        if (
          displayName === term ||
          `${givenName} ${familyName}`.trim() === term
        ) {
          score += 100;
          hasMatch = true;
        }

        // Check if any search word matches any name part
        searchWords.forEach((word) => {
          if (displayName.includes(word)) {
            score += 50;
            hasMatch = true;
          }
          if (givenName.includes(word)) {
            score += 40;
            hasMatch = true;
          }
          if (familyName.includes(word)) {
            score += 40;
            hasMatch = true;
          }

          // Check for starts with (higher score for beginning matches)
          if (
            displayName.startsWith(word) ||
            givenName.startsWith(word) ||
            familyName.startsWith(word)
          ) {
            score += 20;
          }
        });

        // Bonus for matching multiple words
        const matchedWords = searchWords.filter(
          (word) =>
            displayName.includes(word) ||
            givenName.includes(word) ||
            familyName.includes(word)
        );
        if (matchedWords.length > 1) {
          score += matchedWords.length * 10;
        }
      });

      return hasMatch ? { contact, score } : null;
    })
    .filter(
      (item): item is { contact: GoogleContact; score: number } => item !== null
    )
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, 100) // Limit to top 100 results
    .map((item) => item.contact);
};

/**
 * Get display name from a Google contact
 */
export const getContactDisplayName = (contact: GoogleContact): string => {
  if (!contact.names || contact.names.length === 0) {
    return "Unknown Contact";
  }

  const name = contact.names[0];
  return (
    name.displayName ||
    `${name.givenName || ""} ${name.familyName || ""}`.trim() ||
    "Unknown Contact"
  );
};

/**
 * Get phone number from a Google contact, preferring mobile numbers
 */
export const getContactPhoneNumber = (
  contact: GoogleContact
): string | null => {
  if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
    return null;
  }

  // Prefer mobile numbers, then any phone number
  const mobileNumber = contact.phoneNumbers.find(
    (phone) =>
      phone.type?.toLowerCase() === "mobile" ||
      phone.formattedType?.toLowerCase() === "mobile"
  );

  if (mobileNumber) {
    return mobileNumber.value || null;
  }

  // Return first available number
  return contact.phoneNumbers[0].value || null;
};
