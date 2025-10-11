/**
 * Core types and interfaces for the migration framework
 */

export interface MigrationStats {
  totalItems: number;
  itemsProcessed: number;
  itemsSkipped: number;
  itemsUpdated: number;
  errors: Array<{ id: string; error: string; details?: any }>;
  warnings: Array<{ id: string; warning: string; details?: any }>;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface MigrationOptions {
  dryRun: boolean;
  weddingId?: string;
  batchSize?: number;
  continueOnError?: boolean;
  validateAfter?: boolean;
}

export interface MigrationContext {
  options: MigrationOptions;
  stats: MigrationStats;
  weddingId: string;
}

export interface MigrationResult {
  success: boolean;
  stats: MigrationStats;
  validationResult?: ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  inconsistencies: number;
  details: Array<{ id: string; issue: string; expected?: any; actual?: any }>;
}

/**
 * Base interface that all migrations must implement
 */
export interface Migration {
  /** Unique identifier for this migration */
  readonly id: string;

  /** Human-readable name for this migration */
  readonly name: string;

  /** Description of what this migration does */
  readonly description: string;

  /** Version when this migration was created (for ordering) */
  readonly version: string;

  /** Tags for categorizing migrations */
  readonly tags?: string[];

  /**
   * Execute the migration
   * @param context Migration context with options and stats
   * @returns Promise<MigrationResult>
   */
  execute(context: MigrationContext): Promise<MigrationResult>;

  /**
   * Validate that the migration completed successfully
   * @param context Migration context
   * @returns Promise<ValidationResult>
   */
  validate?(context: MigrationContext): Promise<ValidationResult>;

  /**
   * Rollback the migration (if supported)
   * @param context Migration context
   * @returns Promise<MigrationResult>
   */
  rollback?(context: MigrationContext): Promise<MigrationResult>;

  /**
   * Check if this migration can be run (prerequisites, etc.)
   * @param context Migration context
   * @returns Promise<boolean>
   */
  canRun?(context: MigrationContext): Promise<boolean>;
}

export enum MigrationStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped",
  ROLLED_BACK = "rolled_back",
}

export interface MigrationRecord {
  id?: string;
  migrationId: string;
  status: MigrationStatus;
  executedAt?: Date;
  executionTime?: number;
  stats?: MigrationStats;
  error?: string;
  weddingId: string;
}

export interface MigrationExecutionPlan {
  migrations: Migration[];
  totalCount: number;
  estimatedDuration?: number;
}
