import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  Query,
  DocumentReference,
  CollectionReference,
  Firestore,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getCurrentUserWeddingId } from "./auth/authApi";

/**
 * A utility class to handle all Firebase operations with wedding ID context
 */
class WeddingFirebaseService {
  /**
   * Get a collection reference within a wedding subcollection
   * @param collectionName The name of the collection to reference
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   */
  async getCollectionRef<T = any>(
    collectionName: string,
    weddingId?: string
  ): Promise<CollectionReference<T>> {
    const resolvedWeddingId = weddingId || (await this.resolveWeddingId());
    if (!resolvedWeddingId) {
      throw new Error(
        "No wedding ID available - please create or join a wedding first"
      );
    }

    return collection(
      db,
      "weddings",
      resolvedWeddingId,
      collectionName
    ) as CollectionReference<T>;
  }

  /**
   * Get a document reference within a wedding subcollection
   * @param collectionName The name of the collection
   * @param docId The document ID
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   */
  async getDocRef<T = any>(
    collectionName: string,
    docId: string,
    weddingId?: string
  ): Promise<DocumentReference<T>> {
    const resolvedWeddingId = weddingId || (await this.resolveWeddingId());
    if (!resolvedWeddingId) {
      throw new Error(
        "No wedding ID available - please create or join a wedding first"
      );
    }

    return doc(
      db,
      "weddings",
      resolvedWeddingId,
      collectionName,
      docId
    ) as DocumentReference<T>;
  }

  /**
   * Add a new document to a wedding subcollection
   * @param collectionName The name of the collection
   * @param data The data to add
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   */
  async addDocument<T extends object>(
    collectionName: string,
    data: T,
    weddingId?: string
  ) {
    const collectionRef = await this.getCollectionRef(
      collectionName,
      weddingId
    );
    return addDoc(collectionRef, data);
  }

  /**
   * Update an existing document in a wedding subcollection
   * @param collectionName The name of the collection
   * @param docId The document ID to update
   * @param data The data to update
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   */
  async updateDocument<T extends object>(
    collectionName: string,
    docId: string,
    data: Partial<T>,
    weddingId?: string
  ) {
    const docRef = await this.getDocRef(collectionName, docId, weddingId);

    // Remove undefined fields to prevent Firestore errors
    const sanitizedFields = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    return updateDoc(docRef, sanitizedFields);
  }

  /**
   * Delete a document from a wedding subcollection
   * @param collectionName The name of the collection
   * @param docId The document ID to delete
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   */
  async deleteDocument(
    collectionName: string,
    docId: string,
    weddingId?: string
  ) {
    const docRef = await this.getDocRef(collectionName, docId, weddingId);
    return deleteDoc(docRef);
  }

  /**
   * Get a document from a wedding subcollection
   * @param collectionName The name of the collection
   * @param docId The document ID to get
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   */
  async getDocument<T = any>(
    collectionName: string,
    docId: string,
    weddingId?: string
  ): Promise<T | null> {
    const docRef = await this.getDocRef<T>(collectionName, docId, weddingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      return null;
    }
  }

  /**
   * Set a document in a wedding subcollection (creates or overrides)
   * @param collectionName The name of the collection
   * @param docId The document ID to set
   * @param data The data to set
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   */
  async setDocument<T extends object>(
    collectionName: string,
    docId: string,
    data: T,
    weddingId?: string
  ) {
    const docRef = await this.getDocRef(collectionName, docId, weddingId);
    return setDoc(docRef, data);
  }

  /**
   * Create a real-time listener for a collection within a wedding
   * @param collectionName The name of the collection to listen to
   * @param callback Function to call with the data when it changes
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   * @returns An unsubscribe function to stop listening
   */
  async listenToCollection<T = any>(
    collectionName: string,
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void,
    weddingId?: string
  ): Promise<Unsubscribe> {
    try {
      const collectionRef = await this.getCollectionRef<T>(
        collectionName,
        weddingId
      );

      return onSnapshot(
        collectionRef,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
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
   * Get or create a wedding-specific settings document
   * @param settingId The ID of the settings document
   * @param defaultData Default data to use if document doesn't exist
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   */
  async getOrCreateSettings<T extends object>(
    settingId: string,
    defaultData: T,
    weddingId?: string
  ): Promise<T> {
    const resolvedWeddingId = weddingId || (await this.resolveWeddingId());
    if (!resolvedWeddingId) {
      throw new Error(
        "No wedding ID available - please create or join a wedding first"
      );
    }

    const settingsRef = doc(
      db,
      "weddings",
      resolvedWeddingId,
      "settings",
      settingId
    );
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      // If no document exists, create one with default values
      await setDoc(settingsRef, defaultData);
      return { id: settingId, ...defaultData } as T;
    }
  }

  /**
   * Update wedding-specific settings
   * @param settingId The ID of the settings document
   * @param data Data to update in settings
   * @param weddingId Optional wedding ID (will attempt to get current user's wedding ID if not provided)
   */
  async updateSettings<T extends object>(
    settingId: string,
    data: Partial<T>,
    weddingId?: string
  ) {
    return this.updateDocument("settings", settingId, data, weddingId);
  }

  /**
   * Resolve the wedding ID from current user if not provided
   * @private
   */
  private async resolveWeddingId(): Promise<string | null> {
    try {
      return await getCurrentUserWeddingId();
    } catch (error) {
      console.error("Error resolving wedding ID:", error);
      return null;
    }
  }
}

// Export a singleton instance
export const weddingFirebase = new WeddingFirebaseService();
