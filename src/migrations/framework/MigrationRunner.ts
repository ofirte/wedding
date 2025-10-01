import {
  Migration,
  MigrationContext,
  MigrationOptions,
  MigrationResult,
  MigrationStats,
  MigrationExecutionPlan,
} from "./types";
import { MigrationRegistry } from "./MigrationRegistry";

/**
 * Orchestrates migration execution with proper error handling, logging, and state management
 */
export class MigrationRunner {
  constructor(private registry: MigrationRegistry) {}

  /**
   * Execute a single migration
   */
  async runSingle(
    migrationId: string,
    options: MigrationOptions
  ): Promise<MigrationResult> {
    const migration = this.registry.get(migrationId);
    if (!migration) {
      throw new Error(`Migration '${migrationId}' not found in registry`);
    }

    return this.executeMigration(migration, options);
  }

  /**
   * Execute multiple migrations in order
   */
  async runMultiple(
    migrationIds: string[],
    options: MigrationOptions
  ): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];

    for (const migrationId of migrationIds) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Starting migration: ${migrationId}`);
      console.log("=".repeat(60));

      try {
        const result = await this.runSingle(migrationId, options);
        results.push(result);

        // Stop on error unless continueOnError is true
        if (!result.success && !options.continueOnError) {
          console.error(`Migration ${migrationId} failed, stopping execution`);
          break;
        }
      } catch (error) {
        console.error(`Fatal error in migration ${migrationId}:`, error);
        const errorResult: MigrationResult = {
          success: false,
          stats: {
            totalItems: 0,
            itemsProcessed: 0,
            itemsSkipped: 0,
            itemsUpdated: 0,
            errors: [{ id: migrationId, error: String(error) }],
            warnings: [],
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
          },
        };
        results.push(errorResult);

        if (!options.continueOnError) {
          break;
        }
      }
    }

    return results;
  }

  /**
   * Execute all pending migrations
   */
  async runPending(options: MigrationOptions): Promise<MigrationResult[]> {
    if (!options.weddingId) {
      throw new Error("Wedding ID is required for running pending migrations");
    }

    const pendingMigrations = await this.registry.getPendingMigrations(
      options.weddingId
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ No pending migrations found");
      return [];
    }

    console.log(`Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach((m) => {
      console.log(`  - ${m.id}: ${m.name}`);
    });

    if (options.dryRun) {
      console.log("\n🔍 Running in dry-run mode - no data will be modified\n");
    }

    const migrationIds = pendingMigrations.map((m) => m.id);
    return this.runMultiple(migrationIds, options);
  }

  /**
   * Create an execution plan without running migrations
   */
  async createExecutionPlan(
    migrationIds: string[] | "pending",
    weddingId?: string
  ): Promise<MigrationExecutionPlan> {
    let migrations: Migration[];

    if (migrationIds === "pending") {
      if (!weddingId) {
        throw new Error("Wedding ID is required for pending migrations plan");
      }
      migrations = await this.registry.getPendingMigrations(weddingId);
    } else {
      migrations = migrationIds
        .map((id) => this.registry.get(id))
        .filter((m): m is Migration => m !== undefined);
    }

    return {
      migrations,
      totalCount: migrations.length,
      estimatedDuration: this.estimateDuration(migrations),
    };
  }

  /**
   * Execute a single migration with full lifecycle management
   */
  private async executeMigration(
    migration: Migration,
    options: MigrationOptions
  ): Promise<MigrationResult> {
    const weddingId = options.weddingId || "";

    // Check prerequisites
    if (migration.canRun) {
      const context = this.createContext(options, weddingId);
      const canRun = await migration.canRun(context);
      if (!canRun) {
        throw new Error(
          `Migration '${migration.id}' cannot be run - prerequisites not met`
        );
      }
    }

    // Check if already executed (unless it's a dry run)
    if (!options.dryRun) {
      const isExecuted = await this.registry.isExecuted(
        migration.id,
        weddingId
      );
      if (isExecuted) {
        console.log(
          `⏭️ Migration '${migration.id}' already executed, skipping`
        );
        return {
          success: true,
          stats: {
            totalItems: 0,
            itemsProcessed: 0,
            itemsSkipped: 1,
            itemsUpdated: 0,
            errors: [],
            warnings: [],
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
          },
        };
      }
    }

    // Execute the migration
    const context = this.createContext(options, weddingId);
    console.log(`\n🚀 Executing migration: ${migration.name}`);
    console.log(`Description: ${migration.description}`);
    console.log(`Mode: ${options.dryRun ? "DRY RUN" : "ACTUAL EXECUTION"}`);

    let result: MigrationResult;

    try {
      result = await migration.execute(context);

      // Run validation if requested, available, and NOT a dry run
      if (
        options.validateAfter &&
        migration.validate &&
        result.success &&
        !options.dryRun
      ) {
        console.log("\n🔍 Running post-migration validation...");
        const validationResult = await migration.validate(context);
        result.validationResult = validationResult;

        if (!validationResult.isValid) {
          console.error("❌ Validation failed after migration");
          result.success = false;
        } else {
          console.log("✅ Validation passed");
        }
      } else if (options.validateAfter && options.dryRun) {
        console.log("\n⏭️ Skipping validation in dry-run mode");
      }

      // Record execution in registry (only for actual runs)
      if (!options.dryRun) {
        if (result.success) {
          await this.registry.markAsExecuted(
            migration.id,
            weddingId,
            result.stats
          );
        } else {
          const errorMsg = result.stats.errors.map((e) => e.error).join(", ");
          await this.registry.markAsFailed(
            migration.id,
            weddingId,
            errorMsg,
            result.stats
          );
        }
      }
    } catch (error) {
      console.error(
        `💥 Migration '${migration.id}' threw an exception:`,
        error
      );

      const errorStats: MigrationStats = {
        totalItems: 0,
        itemsProcessed: 0,
        itemsSkipped: 0,
        itemsUpdated: 0,
        errors: [{ id: migration.id, error: String(error) }],
        warnings: [],
        startTime: context.stats.startTime,
        endTime: new Date(),
        duration: 0,
      };

      result = {
        success: false,
        stats: errorStats,
      };

      // Record failure
      if (!options.dryRun) {
        await this.registry.markAsFailed(
          migration.id,
          weddingId,
          String(error),
          errorStats
        );
      }
    }

    return result;
  }

  /**
   * Create migration context
   */
  private createContext(
    options: MigrationOptions,
    weddingId: string
  ): MigrationContext {
    return {
      options,
      weddingId,
      stats: {
        totalItems: 0,
        itemsProcessed: 0,
        itemsSkipped: 0,
        itemsUpdated: 0,
        errors: [],
        warnings: [],
        startTime: new Date(),
      },
    };
  }

  /**
   * Estimate total execution duration (placeholder implementation)
   */
  private estimateDuration(migrations: Migration[]): number {
    // Simple estimation - could be enhanced with historical data
    return migrations.length * 30000; // 30 seconds per migration
  }

  /**
   * Print execution summary for multiple migrations
   */
  printExecutionSummary(results: MigrationResult[]): void {
    console.log("\n" + "=".repeat(70));
    console.log("MIGRATION EXECUTION SUMMARY");
    console.log("=".repeat(70));

    const totalMigrations = results.length;
    const successfulMigrations = results.filter((r) => r.success).length;
    const failedMigrations = totalMigrations - successfulMigrations;

    console.log(`Total migrations: ${totalMigrations}`);
    console.log(`Successful: ${successfulMigrations}`);
    console.log(`Failed: ${failedMigrations}`);

    const totalStats = results.reduce(
      (acc, result) => ({
        totalItems: acc.totalItems + result.stats.totalItems,
        itemsProcessed: acc.itemsProcessed + result.stats.itemsProcessed,
        itemsSkipped: acc.itemsSkipped + result.stats.itemsSkipped,
        itemsUpdated: acc.itemsUpdated + result.stats.itemsUpdated,
        errors: acc.errors + result.stats.errors.length,
        warnings: acc.warnings + result.stats.warnings.length,
      }),
      {
        totalItems: 0,
        itemsProcessed: 0,
        itemsSkipped: 0,
        itemsUpdated: 0,
        errors: 0,
        warnings: 0,
      }
    );

    console.log(`\nAggregate Stats:`);
    console.log(`  Total items processed: ${totalStats.totalItems}`);
    console.log(`  Items updated: ${totalStats.itemsUpdated}`);
    console.log(`  Items skipped: ${totalStats.itemsSkipped}`);
    console.log(`  Total errors: ${totalStats.errors}`);
    console.log(`  Total warnings: ${totalStats.warnings}`);

    if (failedMigrations === 0) {
      console.log("\n🎉 All migrations completed successfully!");
    } else {
      console.log(
        `\n⚠️ ${failedMigrations} migration(s) failed. Check the logs above for details.`
      );
    }
    console.log("=".repeat(70));
  }
}
