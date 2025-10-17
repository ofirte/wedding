import { migrationRegistry } from "./framework/MigrationRegistry";

/**
 * Register all available migrations
 * Add new migrations here as they are created
 */

// Register the RSVP denormalization migration
// migrationRegistry.register(new DenormalizeRSVPStatusMigration());

// Export the configured registry
export { migrationRegistry };

// Export framework components for external use
export * from "./framework/types";
export * from "./framework/BaseMigration";
export * from "./framework/MigrationRegistry";
export * from "./framework/MigrationRunner";
