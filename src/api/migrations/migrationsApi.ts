import { weddingFirebase } from "../weddingFirebaseHelpers";
import {
  MigrationRecord,
  MigrationStatus,
} from "../../migrations/framework/types";

/**
 * API for managing migration records in Firestore
 * Follows the pattern of other collection APIs (inviteesApi, tasksApi, etc.)
 */

/**
 * Fetches all migration records for a wedding
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns Promise that resolves with an array of migration records
 */
export const fetchMigrationRecords = async (
  weddingId?: string
): Promise<MigrationRecord[]> => {
  return new Promise((resolve, reject) => {
    weddingFirebase
      .listenToCollection<MigrationRecord>(
        "migrations",
        (records) => resolve(records),
        (error) => reject(error),
        weddingId
      )
      .then((unsubscribe) => {
        // Immediately unsubscribe since we just want the data once
        setTimeout(() => unsubscribe(), 100);
      })
      .catch(reject);
  });
};

/**
 * Creates a new migration record
 * @param migrationRecord Migration record to create (without ID)
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const createMigrationRecord = async (
  migrationRecord: Omit<MigrationRecord, "id">,
  weddingId?: string
): Promise<void> => {
  await weddingFirebase.addDocument("migrations", migrationRecord, weddingId);
};

/**
 * Updates an existing migration record
 * @param recordId ID of the migration record to update
 * @param updates Fields to update in the migration record
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const updateMigrationRecord = async (
  recordId: string,
  updates: Partial<MigrationRecord>,
  weddingId?: string
): Promise<void> => {
  return await weddingFirebase.updateDocument<MigrationRecord>(
    "migrations",
    recordId,
    updates,
    weddingId
  );
};

/**
 * Deletes a migration record
 * @param recordId ID of the migration record to delete
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const deleteMigrationRecord = async (
  recordId: string,
  weddingId?: string
): Promise<void> => {
  return await weddingFirebase.deleteDocument(
    "migrations",
    recordId,
    weddingId
  );
};

/**
 * Fetches a single migration record by ID
 * @param recordId The ID of the migration record to fetch
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns Promise that resolves with the migration record or null if not found
 */
export const fetchMigrationRecord = async (
  recordId: string,
  weddingId?: string
): Promise<MigrationRecord | null> => {
  return await weddingFirebase.getDocument<MigrationRecord>(
    "migrations",
    recordId,
    weddingId
  );
};

/**
 * Checks if a specific migration has been executed
 * @param migrationId The migration ID to check
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns Promise that resolves with true if migration has been executed
 */
export const checkMigrationExecuted = async (
  migrationId: string,
  weddingId?: string
): Promise<boolean> => {
  const records = await fetchMigrationRecords(weddingId);
  return records.some(
    (record) =>
      record.migrationId === migrationId &&
      record.status === MigrationStatus.COMPLETED
  );
};

/**
 * Gets all executed migration IDs for a wedding
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns Promise that resolves with an array of executed migration IDs
 */
export const fetchExecutedMigrationIds = async (
  weddingId?: string
): Promise<string[]> => {
  const records = await fetchMigrationRecords(weddingId);
  return records
    .filter((record) => record.status === MigrationStatus.COMPLETED)
    .map((record) => record.migrationId);
};
