import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  DocumentReference,
  CollectionReference,
  Unsubscribe,
  writeBatch,
  query,
  where,
  WhereFilterOp,
  Timestamp,
  documentId,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * A utility class to handle all Firebase operations for top-level collections
 * (collections at the same level as the wedding collection, including weddings itself)
 */
class GeneralFirebaseService {
  /**
   * Get a top-level collection reference
   * @param collectionName The name of the collection to reference
   */
  getCollectionRef<T = any>(collectionName: string): CollectionReference<T> {
    return collection(db, collectionName) as CollectionReference<T>;
  }

  /**
   * Get a document reference from a top-level collection
   * @param collectionName The name of the collection
   * @param docId The document ID
   */
  getDocRef<T = any>(
    collectionName: string,
    docId: string
  ): DocumentReference<T> {
    return doc(db, collectionName, docId) as DocumentReference<T>;
  }

  /**
   * Add a new document to a top-level collection
   * @param collectionName The name of the collection
   * @param data The data to add
   */
  async addDocument<T extends object>(collectionName: string, data: T) {
    const collectionRef = this.getCollectionRef(collectionName);
    return addDoc(collectionRef, data);
  }

  /**
   * Update an existing document in a top-level collection
   * @param collectionName The name of the collection
   * @param docId The document ID to update
   * @param data The data to update (supports Firestore field values like arrayUnion, arrayRemove, etc.)
   */
  async updateDocument<T extends object>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ) {
    const docRef = this.getDocRef(collectionName, docId);

    // Remove undefined fields but preserve Firestore field values
    const sanitizedFields = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    return updateDoc(docRef, sanitizedFields);
  }

  /**
   * Delete a document from a top-level collection
   * @param collectionName The name of the collection
   * @param docId The document ID to delete
   */
  async deleteDocument(collectionName: string, docId: string) {
    const docRef = this.getDocRef(collectionName, docId);
    return deleteDoc(docRef);
  }

  /**
   * Get a document from a top-level collection
   * @param collectionName The name of the collection
   * @param docId The document ID to get
   */
  async getDocument<T = any>(
    collectionName: string,
    docId: string
  ): Promise<T | null> {
    const docRef = this.getDocRef<T>(collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const docData = { id: docSnap.id, ...docSnap.data() } as T;
      return this.convertTimestampsToDate(docData);
    } else {
      return null;
    }
  }

  /**
   * Set a document in a top-level collection (creates or overrides)
   * @param collectionName The name of the collection
   * @param docId The document ID to set
   * @param data The data to set
   */
  async setDocument<T extends object>(
    collectionName: string,
    docId: string,
    data: T
  ) {
    const docRef = this.getDocRef(collectionName, docId);
    return setDoc(docRef, data);
  }

  /**
   * Get all documents from a top-level collection once (no real-time updates)
   * Uses getDocs for one-time fetch instead of listeners
   * @param collectionName The name of the collection to get
   * @returns A Promise that resolves with an array of documents
   */
  async getCollection<T = any>(collectionName: string): Promise<T[]> {
    try {
      const collectionRef = this.getCollectionRef<T>(collectionName);

      // Use getDocs for one-time fetch - much more reliable than listener hacks
      const snapshot = await getDocs(collectionRef);

      return snapshot.docs.map((doc) => {
        const docData = { id: doc.id, ...doc.data() } as T;
        return this.convertTimestampsToDate(docData);
      });
    } catch (error) {
      console.error(`Error fetching collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Create a real-time listener for a top-level collection
   * @param collectionName The name of the collection to listen to
   * @param callback Function to call with the data when it changes
   * @param errorCallback Optional error callback
   * @returns An unsubscribe function to stop listening
   */
  listenToCollection<T = any>(
    collectionName: string,
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    try {
      const collectionRef = this.getCollectionRef<T>(collectionName);

      return onSnapshot(
        collectionRef,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => {
            const docData = { id: doc.id, ...doc.data() } as T;
            return this.convertTimestampsToDate(docData);
          });
          callback(items);
        },
        (error) => {
          console.error(`Error listening to ${collectionName}:`, error);
          if (errorCallback) errorCallback(error);
        }
      );
    } catch (error) {
      console.error(`Error setting up listener for ${collectionName}:`, error);
      if (errorCallback) errorCallback(error as Error);
      // Return a no-op unsubscribe function
      return () => {};
    }
  }

  /**
   * Bulk update multiple documents in a top-level collection
   * @param collectionName The name of the collection
   * @param updates Array of objects with {id, data} to update
   */
  async bulkUpdateDocuments<T extends object>(
    collectionName: string,
    updates: Array<{ id: string; data: Partial<T> }>
  ) {
    const batch = writeBatch(db);

    for (const update of updates) {
      const docRef = doc(db, collectionName, update.id);

      // Remove undefined fields to prevent Firestore errors
      const sanitizedFields = Object.entries(update.data).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      batch.update(docRef, sanitizedFields);
    }

    return batch.commit();
  }

  /**
   * Bulk delete multiple documents from a top-level collection
   * @param collectionName The name of the collection
   * @param docIds Array of document IDs to delete
   */
  async bulkDeleteDocuments(collectionName: string, docIds: string[]) {
    const batch = writeBatch(db);

    for (const docId of docIds) {
      const docRef = doc(db, collectionName, docId);
      batch.delete(docRef);
    }

    return batch.commit();
  }

  /**
   * Get documents from a top-level collection with filters
   * @param collectionName The name of the collection
   * @param filters Array of filter objects
   * @returns A Promise that resolves with an array of filtered documents
   */
  async getCollectionWithFilters<T = any>(
    collectionName: string,
    filters: Array<{ field: string; op: WhereFilterOp; value: unknown }>
  ): Promise<T[]> {
    const collectionRef = this.getCollectionRef<T>(collectionName);
    let q = query(collectionRef);

    filters.forEach((filter) => {
      if (filter.field === "id") {
        // Use documentId() for ID queries
        q = query(q, where(documentId(), filter.op, filter.value));
      } else {
        q = query(q, where(filter.field, filter.op, filter.value));
      }
    });

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const docData = { id: doc.id, ...doc.data() } as T;
      return this.convertTimestampsToDate(docData);
    });
  }

  /**
   * Convert Firebase Timestamp values to JavaScript Date objects recursively
   * @param data The document data that may contain Timestamp values
   * @returns The same data structure with Timestamps converted to Dates
   */
  convertTimestampsToDate<T = any>(data: T): T {
    if (!data) return data;

    if (data instanceof Timestamp) {
      return data.toDate() as T;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.convertTimestampsToDate(item)) as T;
    }

    if (typeof data === "object" && data !== null) {
      const result = {} as T;
      for (const [key, value] of Object.entries(data)) {
        (result as any)[key] = this.convertTimestampsToDate(value);
      }
      return result;
    }

    return data;
  }
}

// Export a singleton instance
export const generalFirebase = new GeneralFirebaseService();

/**
 * Generic API factory that creates all CRUD operations for a top-level collection
 * This eliminates code duplication across all API files for general collections
 */
export const createGeneralCollectionAPI = <T extends { id?: string }>(
  collectionName: string
) => {
  return {
    /**
     * Fetch all items from collection (one-time, auto-unsubscribe)
     */
    fetchAll: () => generalFirebase.getCollection<T>(collectionName),

    /**
     * Subscribe to collection with real-time updates
     * Returns unsubscribe function for manual cleanup
     */
    subscribe: (
      callback: (items: T[]) => void,
      errorCallback?: (error: Error) => void
    ) =>
      generalFirebase.listenToCollection<T>(
        collectionName,
        callback,
        errorCallback
      ),

    /**
     * Get single item by ID
     */
    fetchById: (id: string) =>
      generalFirebase.getDocument<T>(collectionName, id),

    /**
     * Create new item
     */
    create: (item: Omit<T, "id">) =>
      generalFirebase.addDocument(collectionName, item),

    /**
     * Update existing item
     */
    createWithId: (id: string, item: Omit<T, "id">) =>
      generalFirebase.setDocument(collectionName, id, item),

    update: (id: string, updates: Partial<T>) =>
      generalFirebase.updateDocument<T>(collectionName, id, updates),

    /**
     * Delete item
     */
    delete: (id: string) => generalFirebase.deleteDocument(collectionName, id),

    /**
     * Bulk update multiple items
     */
    bulkUpdate: (updates: Array<{ id: string; data: Partial<T> }>) =>
      generalFirebase.bulkUpdateDocuments<T>(collectionName, updates),

    /**
     * Bulk delete multiple items
     */
    bulkDelete: (ids: string[]) =>
      generalFirebase.bulkDeleteDocuments(collectionName, ids),

    /**
     * Fetch items with filters
     */
    fetchByFilter: (
      filters: Array<{ field: string; op: WhereFilterOp; value: unknown }>
    ): Promise<T[]> =>
      generalFirebase.getCollectionWithFilters<T>(collectionName, filters),
  };
};
