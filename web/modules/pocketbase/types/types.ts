import type { ListResult, RecordAuthResponse, RecordModel } from 'pocketbase'
import type { Frontmatter, ItemType, DebtFrontmatter, DebtTransaction, TrackFrontmatter, ItemRecord } from './schema'

/**
 * Base client interface for database operations
 * Provides methods for CRUD operations on items and user authentication
 */
export interface BaseClient {
  /**
   * Retrieves a single item by its unique identifier
   * @param id - The unique identifier of the item to retrieve
   * @returns Promise resolving to the item record
   */
  getItem: (id: string) => Promise<ItemRecord>

  /**
   * Toggles the completion status of an item
   * @param id - The unique identifier of the item to toggle
   * @returns Promise resolving to the updated item record
   */
  toggleItem: (id: string) => Promise<ItemRecord>

  /**
   * Adds a new debt transaction to an existing debt item
   * @param id - The unique identifier of the debt item
   * @param amount - The transaction amount (positive or negative)
   * @param comment - Optional description of the transaction
   * @returns Promise resolving to the updated debt record
   */
  addDebtTransaction: (id: string, amount: number, comment?: string) => Promise<ItemRecord>

  /**
   * Updates a debt transaction of an existing debt item
   * @param id - The unique identifier of the debt item
   * @param date - The date of the transaction to update
   * @param amount - The new transaction amount
   * @param comment - Optional new description of the transaction
   * @returns Promise resolving to the updated debt record
   */
  updateDebtTransaction: (id: string, date: string, payload: { date?: string, amount?: number, comment?: string }) => Promise<ItemRecord>

  /**
   * Checks if the current client has valid authentication
   * @returns Promise resolving to authentication status (true/false)
   */
  isAuthenticated: () => Promise<boolean>

  /**
   * Removes all authentication data from the client
   * @returns Promise that resolves when auth is cleared
   */
  clearAuth: () => Promise<void>

  /**
   * Authenticates a user with email and password credentials
   * @param payload - Object containing email and password
   * @returns Promise resolving to auth response with user data
   */
  authenticatedUser: (payload: { email: string, password: string }) => Promise<RecordAuthResponse<RecordModel>>

  /**
   * Retrieves a paginated list of items with optional filtering
   * @param page - Page number to retrieve (starts at 1)
   * @param pageSize - Number of items per page
   * @param filter - Optional filter query string
   * @returns Promise resolving to paginated list result
   */
  getList: (page: number, pageSize: number, filter: string) => Promise<ListResult<ItemRecord>>
}

export type {
  ItemType,
  Frontmatter,
  DebtFrontmatter,
  DebtTransaction,
  TrackFrontmatter,
  ItemRecord,
}
