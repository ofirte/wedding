import {
  Migration,
  MigrationContext,
  MigrationResult,
  MigrationStats,
  ValidationResult,
} from "./types";

/**
 * Abstract base class for migrations that provides common functionality
 */
export abstract class BaseMigration implements Migration {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly version: string;
  readonly tags?: string[];

  /**
   * Initialize migration statistics
   */
  protected initStats(): MigrationStats {
    return {
      totalItems: 0,
      itemsProcessed: 0,
      itemsSkipped: 0,
      itemsUpdated: 0,
      errors: [],
      warnings: [],
      startTime: new Date(),
    };
  }

  /**
   * Finalize migration statistics
   */
  protected finalizeStats(stats: MigrationStats): MigrationStats {
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
    return stats;
  }

  /**
   * Log migration progress
   */
  protected log(message: string, context?: MigrationContext): void {
    const timestamp = new Date().toISOString();
    const prefix = context?.options.dryRun ? "[DRY RUN]" : "[MIGRATION]";
    console.log(`${timestamp} ${prefix} ${this.id}: ${message}`);
  }

  /**
   * Log error and add to stats
   */
  protected logError(
    error: string,
    id: string,
    context: MigrationContext,
    details?: any
  ): void {
    const errorMsg = `❌ Error processing ${id}: ${error}`;
    console.error(errorMsg);
    context.stats.errors.push({ id, error, details });
  }

  /**
   * Log warning and add to stats
   */
  protected logWarning(
    warning: string,
    id: string,
    context: MigrationContext,
    details?: any
  ): void {
    const warningMsg = `⚠️ Warning for ${id}: ${warning}`;
    console.warn(warningMsg);
    context.stats.warnings.push({ id, warning, details });
  }

  /**
   * Log successful processing
   */
  protected logSuccess(
    message: string,
    id: string,
    context: MigrationContext
  ): void {
    const prefix = context.options.dryRun ? "→" : "✓";
    console.log(`  ${prefix} ${message} (${id})`);
  }

  /**
   * Create a standardized migration result
   */
  protected createResult(
    context: MigrationContext,
    validationResult?: ValidationResult
  ): MigrationResult {
    const finalStats = this.finalizeStats(context.stats);
    const success = finalStats.errors.length === 0;

    return {
      success,
      stats: finalStats,
      validationResult,
    };
  }

  /**
   * Print migration summary
   */
  protected printSummary(context: MigrationContext): void {
    const { stats, options } = context;
    const { dryRun } = options;

    console.log("\n" + "=".repeat(50));
    console.log("Migration Summary");
    console.log("=".repeat(50));
    console.log(`Migration: ${this.name}`);
    console.log(`Mode: ${dryRun ? "DRY RUN" : "ACTUAL EXECUTION"}`);
    console.log(`Total items: ${stats.totalItems}`);
    console.log(`Items processed: ${stats.itemsProcessed}`);
    console.log(
      `Items ${dryRun ? "to be updated" : "updated"}: ${stats.itemsUpdated}`
    );
    console.log(`Items skipped: ${stats.itemsSkipped}`);
    console.log(`Warnings: ${stats.warnings.length}`);
    console.log(`Errors: ${stats.errors.length}`);

    if (stats.duration) {
      console.log(`Duration: ${stats.duration}ms`);
    }

    if (stats.errors.length > 0) {
      console.log("\nErrors:");
      stats.errors.forEach(({ id, error }) => {
        console.log(`  ${id}: ${error}`);
      });
    }

    if (stats.warnings.length > 0) {
      console.log("\nWarnings:");
      stats.warnings.forEach(({ id, warning }) => {
        console.log(`  ${id}: ${warning}`);
      });
    }

    if (dryRun) {
      console.log("\n🔍 This was a dry run. No data was actually modified.");
      console.log("Run with dryRun=false to perform the actual migration.");
    } else if (stats.errors.length === 0) {
      console.log("\n✅ Migration completed successfully!");
    } else {
      console.log("\n❌ Migration completed with errors.");
    }
    console.log("=".repeat(50));
  }

  // Abstract methods that must be implemented by concrete migrations
  abstract execute(context: MigrationContext): Promise<MigrationResult>;

  // Optional methods that can be overridden
  async validate?(context: MigrationContext): Promise<ValidationResult>;
  async rollback?(context: MigrationContext): Promise<MigrationResult>;
  async canRun?(context: MigrationContext): Promise<boolean>;
}
