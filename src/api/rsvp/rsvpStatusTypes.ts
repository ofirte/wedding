export interface RSVPStatus {
  attendance: boolean;
  amount: string;
  isSubmitted?: boolean;
  submittedAt?: Date;
  [key: string]: any; // Allow any additional dynamic properties
}
