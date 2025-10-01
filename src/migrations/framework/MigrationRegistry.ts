import { weddingFirebase } from "../../api/weddingFirebaseHelpers";
import { Migration, MigrationRecord, MigrationStatus } from "./types";

/**
 * Registry for managing and discovering migrations
 */
export class MigrationRegistry {
  private migrations: Map<string, Migration> = new Map();

  /**
   * Register a migration
   */
  register(migration: Migration): void {
    if (this.migrations.has(migration.id)) {
      throw new Error(
        `Migration with id '${migration.id}' is already registered`
      );
    }
    this.migrations.set(migration.id, migration);
  }

  /**
   * Get a migration by ID
   */
  get(id: string): Migration | undefined {
    return this.migrations.get(id);
  }

  /**
   * Get all registered migrations
   */
  getAll(): Migration[] {
    return Array.from(this.migrations.values());
  }

  /**
   * Get migrations by tag
   */
  getByTag(tag: string): Migration[] {
    return this.getAll().filter((m) => m.tags?.includes(tag));
  }

  /**
   * Get migrations ordered by version
   */
  getOrderedByVersion(): Migration[] {
    return this.getAll().sort((a, b) => {
      // Simple version comparison - you might want to use semver for more complex versions
      return a.version.localeCompare(b.version);
    });
  }

  /**
   * Get pending migrations (not yet executed)
   */
  async getPendingMigrations(weddingId: string): Promise<Migration[]> {
    const executedMigrations = await this.getExecutedMigrationIds(weddingId);
    return this.getOrderedByVersion().filter(
      (migration) => !executedMigrations.includes(migration.id)
    );
  }

  /**
   * Get executed migration records from Firebase
   */
  async getExecutedMigrations(weddingId: string): Promise<MigrationRecord[]> {
    try {
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
    } catch (error) {
      console.warn("Could not fetch migration records:", error);
      return [];
    }
  }

  /**
   * Get list of executed migration IDs
   */
  async getExecutedMigrationIds(weddingId: string): Promise<string[]> {
    const records = await this.getExecutedMigrations(weddingId);
    return records
      .filter((r) => r.status === MigrationStatus.COMPLETED)
      .map((r) => r.migrationId);
  }

  /**
   * Mark a migration as executed
   */
  async markAsExecuted(
    migrationId: string,
    weddingId: string,
    stats: any,
    status: MigrationStatus = MigrationStatus.COMPLETED
  ): Promise<void> {
    const record: MigrationRecord = {
      migrationId,
      status,
      executedAt: new Date(),
      executionTime: stats.duration,
      stats,
      weddingId,
    };

    try {
      await weddingFirebase.addDocument("migrations", record, weddingId);
    } catch (error) {
      console.error(
        `Failed to mark migration ${migrationId} as executed:`,
        error
      );
      throw error;
    }
  }

  /**
   * Mark a migration as failed
   */
  async markAsFailed(
    migrationId: string,
    weddingId: string,
    error: string,
    stats?: any
  ): Promise<void> {
    const record: MigrationRecord = {
      migrationId,
      status: MigrationStatus.FAILED,
      executedAt: new Date(),
      executionTime: stats?.duration,
      stats,
      error,
      weddingId,
    };

    try {
      await weddingFirebase.addDocument("migrations", record, weddingId);
    } catch (err) {
      console.error(`Failed to mark migration ${migrationId} as failed:`, err);
    }
  }

  /**
   * Check if a migration has been executed
   */
  async isExecuted(migrationId: string, weddingId: string): Promise<boolean> {
    const executedIds = await this.getExecutedMigrationIds(weddingId);
    return executedIds.includes(migrationId);
  }

  /**
   * Get migration status
   */
  async getStatus(
    migrationId: string,
    weddingId: string
  ): Promise<MigrationStatus> {
    const records = await this.getExecutedMigrations(weddingId);
    const record = records.find((r) => r.migrationId === migrationId);
    return record?.status || MigrationStatus.PENDING;
  }

  /**
   * List all migrations with their status
   */
  async listWithStatus(weddingId: string): Promise<
    Array<{
      migration: Migration;
      status: MigrationStatus;
      lastExecuted?: Date;
      stats?: any;
    }>
  > {
    const records = await this.getExecutedMigrations(weddingId);
    const recordsMap = new Map(records.map((r) => [r.migrationId, r]));

    return this.getOrderedByVersion().map((migration) => {
      const record = recordsMap.get(migration.id);
      return {
        migration,
        status: record?.status || MigrationStatus.PENDING,
        lastExecuted: record?.executedAt,
        stats: record?.stats,
      };
    });
  }

  /**
   * Clear the registry (useful for testing)
   */
  clear(): void {
    this.migrations.clear();
  }
}

// Global registry instance
export const migrationRegistry = new MigrationRegistry();
