import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Unsubscribe,
  WhereFilterOp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { generalFirebase } from "./generalFirebaseHelpers";

/**
 * A utility class to handle Firebase operations across multiple weddings
 * This is useful for users who manage multiple weddings and need to access data from all of them
 */
class MultiWeddingFirebaseService {
  private readonly weddingCollection = "weddings";

  /**
   * Get a subcollection reference from multiple weddings
   * @param weddingIds Array of wedding IDs to fetch from
   * @param subCollectionName The name of the subcollection
   * @returns Promise with array of documents from all weddings
   */
  async getSubCollectionFromWeddings<T = any>(
    weddingIds: string[],
    subCollectionName: string
  ): Promise<T[]> {
    // Parallelize queries for better performance
    const promises = weddingIds.map(async (weddingId) => {
      const subCollectionPath = `${this.weddingCollection}/${weddingId}/${subCollectionName}`;
      const subCollectionRef = collection(db, subCollectionPath);
      const snapshot = await getDocs(subCollectionRef);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        weddingId, // Include the wedding ID for reference
        ...generalFirebase.convertTimestampsToDate(doc.data()),
      })) as T[];
    });

    const results = await Promise.all(promises);
    return results.flat();
  }

  /**
   * Create a real-time listener for a subcollection across multiple weddings
   * @param weddingIds Array of wedding IDs to listen to
   * @param subCollectionName The name of the subcollection
   * @param callback Function to call with the aggregated data when it changes
   * @param errorCallback Optional error callback
   * @returns An array of unsubscribe functions to stop listening
   */
  listenToSubCollectionFromWeddings<T = any>(
    weddingIds: string[],
    subCollectionName: string,
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe[] {
    const unsubscribeFunctions: Unsubscribe[] = [];

    for (const weddingId of weddingIds) {
      const subCollectionPath = `${this.weddingCollection}/${weddingId}/${subCollectionName}`;
      const subCollectionRef = collection(db, subCollectionPath);

      const unsubscribe = onSnapshot(
        subCollectionRef,
        (snapshot) => {


          // Get data from all weddings
          this.getSubCollectionFromWeddings<T>(weddingIds, subCollectionName)
            .then((allData) => callback(allData))
            .catch((error) => {
              if (errorCallback) errorCallback(error);
            });
        },
        (error) => {
          console.error(
            `Error listening to ${subCollectionName} in wedding ${weddingId}:`,
            error
          );
          if (errorCallback) errorCallback(error);
        }
      );

      unsubscribeFunctions.push(unsubscribe);
    }

    return unsubscribeFunctions;
  }

  /**
   * Get documents from a subcollection across multiple weddings with filters
   * @param weddingIds Array of wedding IDs to fetch from
   * @param subCollectionName The name of the subcollection
   * @param filters Array of filter objects
   * @returns Promise with array of filtered documents from all weddings
   */
  async getSubCollectionWithFilters<T = any>(
    weddingIds: string[],
    subCollectionName: string,
    filters: Array<{ field: string; op: WhereFilterOp; value: unknown }>
  ): Promise<T[]> {
    // Parallelize queries for better performance
    const promises = weddingIds.map(async (weddingId) => {
      const subCollectionPath = `${this.weddingCollection}/${weddingId}/${subCollectionName}`;
      const subCollectionRef = collection(db, subCollectionPath);

      let q = query(subCollectionRef);
      filters.forEach((filter) => {
        q = query(q, where(filter.field, filter.op, filter.value));
      });

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        weddingId,
        ...generalFirebase.convertTimestampsToDate(doc.data()),
      })) as T[];
    });

    const results = await Promise.all(promises);
    return results.flat();
  }
}

// Export a singleton instance
export const multiWeddingFirebase = new MultiWeddingFirebaseService();

/**
 * Generic API factory that creates operations for accessing data across multiple weddings
 * This provides a consistent interface for working with multi-wedding data
 */
export const createMultiWeddingCollectionAPI = <
  T extends { id?: string; weddingId?: string }
>(
  subCollectionName: string
) => {
  return {
    /**
     * Fetch all items from the subcollection across multiple weddings
     */
    fetchAll: (weddingIds: string[]) =>
      multiWeddingFirebase.getSubCollectionFromWeddings<T>(
        weddingIds,
        subCollectionName
      ),

    /**
     * Subscribe to the subcollection across multiple weddings with real-time updates
     * Returns array of unsubscribe functions for manual cleanup
     */
    subscribe: (
      weddingIds: string[],
      callback: (items: T[]) => void,
      errorCallback?: (error: Error) => void
    ) =>
      multiWeddingFirebase.listenToSubCollectionFromWeddings<T>(
        weddingIds,
        subCollectionName,
        callback,
        errorCallback
      ),

    /**
     * Fetch items with filters across multiple weddings
     */
    fetchByFilter: (
      weddingIds: string[],
      filters: Array<{ field: string; op: WhereFilterOp; value: unknown }>
    ): Promise<T[]> =>
      multiWeddingFirebase.getSubCollectionWithFilters<T>(
        weddingIds,
        subCollectionName,
        filters
      ),
  };
};
