/**
 * Base Model Class
 * Provides common patterns and utilities for all Firebase model classes
 * This is the data access layer - handles direct Firebase operations
 */

import {
  ModelCRUD,
  FilterOptions,
  QueryOptions,
  ModelDocument,
} from "./ModelCRUD";

/**
 * Base model class that all data access models extend
 * Provides standardized CRUD operations with consistent error handling
 */
export abstract class BaseModel<T extends ModelDocument> {
  protected crud: ModelCRUD<T>;

  constructor(collectionName: string, isWeddingScoped: boolean = false) {
    this.crud = new ModelCRUD<T>(collectionName, isWeddingScoped);
  }

  // Standard CRUD operations
  async create(data: Omit<T, "id">, weddingId?: string): Promise<T> {
    return this.crud.create(data, weddingId);
  }

  async createWithId(
    id: string,
    data: Omit<T, "id">,
    weddingId?: string
  ): Promise<T> {
    return this.crud.createWithId(id, data, weddingId);
  }

  async getById(id: string, weddingId?: string): Promise<T | null> {
    return this.crud.getById(id, weddingId);
  }

  async getAll(weddingId?: string, options?: QueryOptions): Promise<T[]> {
    return this.crud.getAll(weddingId, options);
  }

  async update(
    id: string,
    data: Partial<Omit<T, "id">>,
    weddingId?: string
  ): Promise<T> {
    return this.crud.update(id, data, weddingId);
  }

  async delete(id: string, weddingId?: string): Promise<void> {
    return this.crud.delete(id, weddingId);
  }

  async exists(id: string, weddingId?: string): Promise<boolean> {
    return this.crud.exists(id, weddingId);
  }

  async count(filters?: FilterOptions[], weddingId?: string): Promise<number> {
    return this.crud.count(filters, weddingId);
  }

  // Bulk operations
  async bulkCreate(
    dataArray: Array<Omit<T, "id">>,
    weddingId?: string
  ): Promise<T[]> {
    return this.crud.bulkCreate(dataArray, weddingId);
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<Omit<T, "id">> }>,
    weddingId?: string
  ): Promise<void> {
    return this.crud.bulkUpdate(updates, weddingId);
  }

  async bulkDelete(ids: string[], weddingId?: string): Promise<void> {
    return this.crud.bulkDelete(ids, weddingId);
  }

  // Filter and pagination
  async getByFilter(
    filters: FilterOptions[],
    weddingId?: string,
    options?: QueryOptions
  ): Promise<T[]> {
    return this.crud.getByFilter(filters, weddingId, options);
  }

  async getPaginated(
    pageSize: number,
    lastDoc?: any,
    filters?: FilterOptions[],
    weddingId?: string,
    orderBy?: { field: string; direction?: "asc" | "desc" }
  ) {
    return this.crud.getPaginated(
      pageSize,
      lastDoc,
      filters,
      weddingId,
      orderBy
    );
  }

  // Helper methods that models can use
  protected requireWeddingId(weddingId?: string): string {
    if (!weddingId) {
      throw new Error("Wedding ID is required for this operation");
    }
    return weddingId;
  }

  protected validateId(id: string): void {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new Error("Valid document ID is required");
    }
  }
}
