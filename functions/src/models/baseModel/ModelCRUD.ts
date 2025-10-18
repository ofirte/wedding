/**
 * Base Model CRUD Class
 * Provides a simple abstraction layer over Firebase Firestore operations
 * Handles both wedding-scoped collections (/weddings/{id}/{collection}) and top-level collections
 * Eliminates complex Firebase syntax from service layer
 */

import { logger } from "firebase-functions/v2";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";

export interface ModelDocument {
  id: string;
  [key: string]: any;
}

export interface CreateData {
  [key: string]: any;
}

export interface UpdateData {
  [key: string]: any;
}

export interface FilterOptions {
  field: string;
  operator: FirebaseFirestore.WhereFilterOp;
  value: any;
}

export interface QueryOptions {
  limit?: number;
  orderBy?: {
    field: string;
    direction?: "asc" | "desc";
  };
  startAfter?: any;
}

/**
 * Base CRUD class for Firebase collections
 * Supports both wedding-scoped and top-level collections
 */
export class ModelCRUD<T extends ModelDocument> {
  protected db = getFirestore();
  protected collectionName: string;
  protected isWeddingScoped: boolean;

  constructor(collectionName: string, isWeddingScoped: boolean = false) {
    this.collectionName = collectionName;
    this.isWeddingScoped = isWeddingScoped;
  }

  /**
   * Get collection reference based on wedding scope
   */
  protected getCollectionRef(weddingId?: string) {
    if (this.isWeddingScoped) {
      if (!weddingId) {
        throw new Error(
          `Wedding ID is required for wedding-scoped collection: ${this.collectionName}`
        );
      }
      return this.db
        .collection("weddings")
        .doc(weddingId)
        .collection(this.collectionName);
    }
    return this.db.collection(this.collectionName);
  }

  /**
   * Convert Firestore document to typed object
   */
  protected docToObject(doc: FirebaseFirestore.DocumentSnapshot): T | null {
    if (!doc.exists) return null;
    const data = doc.data()!;

    // Convert Firestore timestamps to Date objects
    const convertedData = this.convertTimestamps(data);

    return {
      id: doc.id,
      ...convertedData,
    } as T;
  }

  /**
   * Convert Firestore timestamps to Date objects recursively
   */
  protected convertTimestamps(data: any): any {
    if (data instanceof Timestamp) {
      return data.toDate();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.convertTimestamps(item));
    }

    if (data && typeof data === "object") {
      const converted: any = {};
      for (const [key, value] of Object.entries(data)) {
        converted[key] = this.convertTimestamps(value);
      }
      return converted;
    }

    return data;
  }

  /**
   * Prepare data for Firestore by converting dates and adding timestamps
   */
  protected prepareDataForFirestore(
    data: CreateData | UpdateData,
    isUpdate: boolean = false
  ): any {
    const prepared = { ...data };

    // Convert Date objects to Firestore Timestamps
    const converted = this.convertDatesToTimestamps(prepared);

    // Add timestamps
    if (!isUpdate) {
      converted.createdAt = FieldValue.serverTimestamp();
    }
    converted.updatedAt = FieldValue.serverTimestamp();

    return converted;
  }

  /**
   * Convert Date objects to Firestore Timestamps recursively
   */
  protected convertDatesToTimestamps(data: any): any {
    if (data instanceof Date) {
      return Timestamp.fromDate(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.convertDatesToTimestamps(item));
    }

    if (data && typeof data === "object") {
      const converted: any = {};
      for (const [key, value] of Object.entries(data)) {
        converted[key] = this.convertDatesToTimestamps(value);
      }
      return converted;
    }

    return data;
  }

  /**
   * Create a new document
   */
  async create(data: CreateData, weddingId?: string): Promise<T> {
    try {
      const collectionRef = this.getCollectionRef(weddingId);
      const preparedData = this.prepareDataForFirestore(data, false);

      const docRef = await collectionRef.add(preparedData);
      const doc = await docRef.get();

      const result = this.docToObject(doc);
      if (!result) {
        throw new Error("Failed to create document");
      }

      logger.info(`Created ${this.collectionName} document: ${result.id}`);
      return result;
    } catch (error) {
      logger.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document with a specific ID
   */
  async createWithId(
    id: string,
    data: CreateData,
    weddingId?: string
  ): Promise<T> {
    try {
      const collectionRef = this.getCollectionRef(weddingId);
      const preparedData = this.prepareDataForFirestore(data, false);

      const docRef = collectionRef.doc(id);
      await docRef.set(preparedData);

      const doc = await docRef.get();
      const result = this.docToObject(doc);

      if (!result) {
        throw new Error("Failed to create document with ID");
      }

      logger.info(
        `Created ${this.collectionName} document with ID: ${result.id}`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error creating ${this.collectionName} with ID ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getById(id: string, weddingId?: string): Promise<T | null> {
    try {
      const collectionRef = this.getCollectionRef(weddingId);
      const doc = await collectionRef.doc(id).get();

      return this.docToObject(doc);
    } catch (error) {
      logger.error(`Error getting ${this.collectionName} by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all documents
   */
  async getAll(weddingId?: string, options?: QueryOptions): Promise<T[]> {
    try {
      let query: FirebaseFirestore.Query = this.getCollectionRef(weddingId);

      // Apply query options
      if (options?.orderBy) {
        query = query.orderBy(
          options.orderBy.field,
          options.orderBy.direction || "asc"
        );
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.startAfter) {
        query = query.startAfter(options.startAfter);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => this.docToObject(doc)!).filter(Boolean);
    } catch (error) {
      logger.error(`Error getting all ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get documents by filter
   */
  async getByFilter(
    filters: FilterOptions[],
    weddingId?: string,
    options?: QueryOptions
  ): Promise<T[]> {
    try {
      let query: FirebaseFirestore.Query = this.getCollectionRef(weddingId);

      // Apply filters
      for (const filter of filters) {
        query = query.where(filter.field, filter.operator, filter.value);
      }

      // Apply query options
      if (options?.orderBy) {
        query = query.orderBy(
          options.orderBy.field,
          options.orderBy.direction || "asc"
        );
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.startAfter) {
        query = query.startAfter(options.startAfter);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => this.docToObject(doc)!).filter(Boolean);
    } catch (error) {
      logger.error(`Error filtering ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update document by ID
   */
  async update(id: string, data: UpdateData, weddingId?: string): Promise<T> {
    try {
      const collectionRef = this.getCollectionRef(weddingId);
      const preparedData = this.prepareDataForFirestore(data, true);

      await collectionRef.doc(id).update(preparedData);

      const updatedDoc = await collectionRef.doc(id).get();
      const result = this.docToObject(updatedDoc);

      if (!result) {
        throw new Error("Failed to update document");
      }

      logger.info(`Updated ${this.collectionName} document: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error updating ${this.collectionName} ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete document by ID
   */
  async delete(id: string, weddingId?: string): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef(weddingId);
      await collectionRef.doc(id).delete();

      logger.info(`Deleted ${this.collectionName} document: ${id}`);
    } catch (error) {
      logger.error(`Error deleting ${this.collectionName} ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk create documents
   */
  async bulkCreate(dataArray: CreateData[], weddingId?: string): Promise<T[]> {
    try {
      const batch = this.db.batch();
      const collectionRef = this.getCollectionRef(weddingId);
      const docRefs: FirebaseFirestore.DocumentReference[] = [];

      for (const data of dataArray) {
        const docRef = collectionRef.doc();
        const preparedData = this.prepareDataForFirestore(data, false);
        batch.set(docRef, preparedData);
        docRefs.push(docRef);
      }

      await batch.commit();

      // Fetch created documents
      const results: T[] = [];
      for (const docRef of docRefs) {
        const doc = await docRef.get();
        const result = this.docToObject(doc);
        if (result) {
          results.push(result);
        }
      }

      logger.info(
        `Bulk created ${results.length} ${this.collectionName} documents`
      );
      return results;
    } catch (error) {
      logger.error(`Error bulk creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Bulk update documents
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: UpdateData }>,
    weddingId?: string
  ): Promise<void> {
    try {
      const batch = this.db.batch();
      const collectionRef = this.getCollectionRef(weddingId);

      for (const update of updates) {
        const docRef = collectionRef.doc(update.id);
        const preparedData = this.prepareDataForFirestore(update.data, true);
        batch.update(docRef, preparedData);
      }

      await batch.commit();
      logger.info(
        `Bulk updated ${updates.length} ${this.collectionName} documents`
      );
    } catch (error) {
      logger.error(`Error bulk updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Bulk delete documents
   */
  async bulkDelete(ids: string[], weddingId?: string): Promise<void> {
    try {
      const batch = this.db.batch();
      const collectionRef = this.getCollectionRef(weddingId);

      for (const id of ids) {
        const docRef = collectionRef.doc(id);
        batch.delete(docRef);
      }

      await batch.commit();
      logger.info(
        `Bulk deleted ${ids.length} ${this.collectionName} documents`
      );
    } catch (error) {
      logger.error(`Error bulk deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Count documents
   */
  async count(filters?: FilterOptions[], weddingId?: string): Promise<number> {
    try {
      let query: FirebaseFirestore.Query = this.getCollectionRef(weddingId);

      // Apply filters if provided
      if (filters) {
        for (const filter of filters) {
          query = query.where(filter.field, filter.operator, filter.value);
        }
      }

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      logger.error(`Error counting ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async exists(id: string, weddingId?: string): Promise<boolean> {
    try {
      const collectionRef = this.getCollectionRef(weddingId);
      const doc = await collectionRef.doc(id).get();
      return doc.exists;
    } catch (error) {
      logger.error(
        `Error checking if ${this.collectionName} ${id} exists:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get paginated results
   */
  async getPaginated(
    pageSize: number,
    lastDoc?: FirebaseFirestore.DocumentSnapshot,
    filters?: FilterOptions[],
    weddingId?: string,
    orderBy?: { field: string; direction?: "asc" | "desc" }
  ): Promise<{
    documents: T[];
    lastDoc?: FirebaseFirestore.DocumentSnapshot;
    hasMore: boolean;
  }> {
    try {
      let query: FirebaseFirestore.Query = this.getCollectionRef(weddingId);

      // Apply filters
      if (filters) {
        for (const filter of filters) {
          query = query.where(filter.field, filter.operator, filter.value);
        }
      }

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || "asc");
      }

      // Apply pagination
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      query = query.limit(pageSize + 1); // Get one extra to check if there are more

      const snapshot = await query.get();
      const docs = snapshot.docs
        .map((doc) => this.docToObject(doc)!)
        .filter(Boolean);

      const hasMore = docs.length > pageSize;
      const documents = hasMore ? docs.slice(0, pageSize) : docs;
      const newLastDoc = hasMore ? snapshot.docs[pageSize - 1] : undefined;

      return {
        documents,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      logger.error(`Error getting paginated ${this.collectionName}:`, error);
      throw error;
    }
  }
}

/**
 * Factory function to create model CRUD instances with proper typing
 */
export function createModelCRUD<T extends ModelDocument>(
  collectionName: string,
  isWeddingScoped: boolean = false
): ModelCRUD<T> {
  return new ModelCRUD<T>(collectionName, isWeddingScoped);
}
