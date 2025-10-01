import { BaseMigration } from "../framework/BaseMigration";
import {
  MigrationContext,
  MigrationResult,
  ValidationResult,
} from "../framework/types";
import { weddingFirebase } from "../../api/weddingFirebaseHelpers";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";
import { Invitee } from "../../components/invitees/InviteList";
import { getDocs, updateDoc, doc } from "firebase/firestore";

/**
 * Migration to denormalize RSVP status data from subcollections into main invitee documents
 *
 * This migration:
 * 1. Fetches all invitees for a wedding
 * 2. For each invitee, reads their rsvpStatus/current subcollection document
 * 3. Copies the RSVP fields into the main invitee document under an 'rsvpStatus' field
 * 4. Preserves the original subcollection for backward compatibility
 */
export class DenormalizeRSVPStatusMigration extends BaseMigration {
  readonly id = "denormalize-rsvp-status-v1";
  readonly name = "Denormalize RSVP Status Data";
  readonly description =
    "Copy RSVP status from subcollections to main invitee documents for better query performance";
  readonly version = "1.0.0";
  readonly tags = ["rsvp", "performance", "data-structure"];

  async execute(context: MigrationContext): Promise<MigrationResult> {
    const { weddingId, options } = context;

    this.log(
      `Starting RSVP denormalization for wedding: ${weddingId}`,
      context
    );
    this.log(
      `Mode: ${options.dryRun ? "DRY RUN" : "ACTUAL EXECUTION"}`,
      context
    );

    try {
      // Get all invitees for this wedding
      const inviteesCollectionRef = await weddingFirebase.getCollectionRef(
        "invitee",
        weddingId
      );
      const inviteesSnapshot = await getDocs(inviteesCollectionRef);

      context.stats.totalItems = inviteesSnapshot.size;
      this.log(
        `Found ${context.stats.totalItems} invitees to process`,
        context
      );

      if (context.stats.totalItems === 0) {
        this.log("No invitees found. Migration completed.", context);
        return this.createResult(context);
      }

      // Process each invitee
      for (const inviteeDoc of inviteesSnapshot.docs) {
        const inviteeId = inviteeDoc.id;
        const inviteeData = inviteeDoc.data() as Invitee;

        try {
          await this.processInvitee(inviteeId, inviteeData, context);
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          this.logError(errorMsg, inviteeId, context);
        }
      }

      // Print summary
      this.printSummary(context);

      return this.createResult(context);
    } catch (error) {
      this.logError(
        "Fatal error during migration",
        "migration",
        context,
        error
      );
      throw error;
    }
  }

  private async processInvitee(
    inviteeId: string,
    inviteeData: Invitee,
    context: MigrationContext
  ): Promise<void> {
    const { weddingId, options } = context;

    this.log(`Processing invitee: ${inviteeData.name} (${inviteeId})`, context);

    // Check if invitee already has denormalized RSVP data
    if (inviteeData.rsvpStatus) {
      this.log(
        `Invitee ${inviteeId} already has denormalized RSVP data, skipping`,
        context
      );
      context.stats.itemsSkipped++;
      return;
    }

    // Fetch RSVP status from subcollection
    const rsvpStatus = await weddingFirebase.getDocument<RSVPStatus>(
      `invitee/${inviteeId}/rsvpStatus`,
      "current",
      weddingId
    );

    context.stats.itemsProcessed++;

    if (!rsvpStatus) {
      this.log(`No RSVP status found for invitee ${inviteeId}`, context);
      return;
    }

    this.logSuccess(
      `Found RSVP status: ${JSON.stringify(rsvpStatus)}`,
      inviteeId,
      context
    );

    if (!options.dryRun) {
      // Update the invitee document with denormalized RSVP data
      const inviteesCollectionRef = await weddingFirebase.getCollectionRef(
        "invitee",
        weddingId
      );
      const inviteeDocRef = doc(inviteesCollectionRef, inviteeId);

      await updateDoc(inviteeDocRef, {
        rsvpStatus: rsvpStatus,
      });

      this.logSuccess(
        `Updated invitee ${inviteeId} with RSVP data`,
        inviteeId,
        context
      );
    } else {
      this.logSuccess(
        `Would update invitee ${inviteeId} with RSVP data`,
        inviteeId,
        context
      );
    }

    context.stats.itemsUpdated++;
  }

  /**
   * Validate that the migration completed successfully
   */
  async validate(context: MigrationContext): Promise<ValidationResult> {
    const { weddingId } = context;

    this.log(`Validating RSVP migration for wedding: ${weddingId}`, context);

    const result: ValidationResult = {
      isValid: true,
      inconsistencies: 0,
      details: [],
    };

    try {
      const inviteesCollectionRef = await weddingFirebase.getCollectionRef(
        "invitee",
        weddingId
      );
      const inviteesSnapshot = await getDocs(inviteesCollectionRef);

      let validated = 0;

      for (const inviteeDoc of inviteesSnapshot.docs) {
        const inviteeId = inviteeDoc.id;
        const inviteeData = inviteeDoc.data() as Invitee;

        // Get RSVP from both locations
        const denormalizedRSVP = inviteeData.rsvpStatus;
        const subcollectionRSVP = await weddingFirebase.getDocument<RSVPStatus>(
          `invitee/${inviteeId}/rsvpStatus`,
          "current",
          weddingId
        );

        if (subcollectionRSVP && !denormalizedRSVP) {
          result.details.push({
            id: inviteeId,
            issue: "Has subcollection RSVP but no denormalized data",
            expected: subcollectionRSVP,
            actual: null,
          });
          result.inconsistencies++;
        } else if (subcollectionRSVP && denormalizedRSVP) {
          // Check if data matches
          const matches =
            subcollectionRSVP.attendance === denormalizedRSVP.attendance &&
            subcollectionRSVP.amount === denormalizedRSVP.amount &&
            subcollectionRSVP.sleepover === denormalizedRSVP.sleepover &&
            subcollectionRSVP.rideFromTelAviv ===
              denormalizedRSVP.rideFromTelAviv &&
            subcollectionRSVP.isSubmitted === denormalizedRSVP.isSubmitted;

          if (!matches) {
            result.details.push({
              id: inviteeId,
              issue:
                "Inconsistent RSVP data between subcollection and denormalized",
              expected: subcollectionRSVP,
              actual: denormalizedRSVP,
            });
            result.inconsistencies++;
          } else {
            validated++;
          }
        }
        // No RSVP data in either location is fine
      }

      this.log(`Validated ${validated} invitees`, context);

      if (result.inconsistencies > 0) {
        this.log(`Found ${result.inconsistencies} inconsistencies`, context);
        result.isValid = false;
      } else {
        this.log("All RSVP data is consistent!", context);
      }
    } catch (error) {
      this.logError("Error during validation", "validation", context, error);
      result.isValid = false;
      result.details.push({
        id: "validation",
        issue: "Validation failed with error",
        actual: String(error),
      });
    }

    return result;
  }

  /**
   * Check if this migration can be run
   */
  async canRun(context: MigrationContext): Promise<boolean> {
    try {
      // Check if we can access the invitees collection
      const inviteesCollectionRef = await weddingFirebase.getCollectionRef(
        "invitee",
        context.weddingId
      );

      // Try to read from the collection to verify permissions
      await getDocs(inviteesCollectionRef);
      return true;
    } catch (error) {
      this.logError(
        "Cannot run migration - permission or access error",
        "prerequisites",
        context,
        error
      );
      return false;
    }
  }
}
