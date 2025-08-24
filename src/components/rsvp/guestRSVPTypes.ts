export interface GuestInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plusOneAllowed?: boolean;
}

export interface WeddingInfo {
  id: string;
  brideName: string;
  groomName: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  dressCode?: string;
}

export interface RSVPFormData {
  attending: "yes" | "no" | undefined;
  guestCount: number | undefined;
  sleepover: "yes" | "no" | undefined;
  needsRideFromTelAviv: "yes" | "no" | undefined;
}

export interface RSVPSubmission {
  guestId: string;
  weddingId: string;
  attending: boolean;
  guestCount: number;
  dietaryRestrictions?: string;
  specialRequests?: string;
  plusOneName?: string;
  contactEmail: string;
  contactPhone?: string;
  submittedAt: Date;
}
