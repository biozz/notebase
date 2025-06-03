import type { ListResult, RecordAuthResponse, RecordModel } from 'pocketbase'
import type {
  Frontmatter,
  ItemType,
  DebtFrontmatter,
  DebtTransaction,
  TrackFrontmatter,
  ItemRecord,
  GroceriesFrontmatter,
  GroceriesItem,
  ActivityFilter,
} from './schema'
/**
 * Base client interface for database operations
 * Provides methods for CRUD operations on items and user authentication
 */
export interface BaseClient {
  /**
   * Retrieves a paginated list of items with optional filtering
   * @param page - Page number to retrieve (starts at 1)
   * @param pageSize - Number of items per page
   * @param filter - Optional filter query string
   * @returns Promise resolving to paginated list result
   */
  getList: (page: number, pageSize: number, filter: string) => Promise<ListResult<ItemRecord>>

  /**
   * Retrieves a single item by its unique identifier
   * @param id - The unique identifier of the item to retrieve
   * @returns Promise resolving to the item record
   */
  getItem: (id: string) => Promise<ItemRecord>

  /**
  * Updates the frontmatter of an item
    * @param id - The unique identifier of the item
    * @param data - The new frontmatter of the item
    * @returns Promise resolving to the updated item record
    */
  updateFrontmatter: (id: string, data: Frontmatter) => Promise<void>

  /**
  * Updates the content of an item
   * @param id - The unique identifier of the item
   * @param data - The new content of the item
   * @returns Promise resolving to the updated item record
   */
  updateContent: (id: string, data: string) => Promise<void>

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
     * Retrieves all filters from the database
     * @returns Promise resolving to list of all filter records
     */
  getFilters: () => Promise<ActivityFilter[]>

  /**
     * Updates a filter's data by its unique identifier
     * @param id - The unique identifier of the filter to update
     * @param data - The new filter data as a string
     * @returns Promise that resolves when the filter is updated
     */
  updateFilter: (id: string, data: string) => Promise<RecordModel>

  /**
     * Creates a new filter with the specified label
     * @param label - The label for the new filter
     * @returns Promise resolving to the created filter record
     */
  createFilter: (label: string) => Promise<RecordModel>

}

export type {
  ItemType,
  Frontmatter,
  DebtFrontmatter,
  DebtTransaction,
  TrackFrontmatter,
  ItemRecord,
  GroceriesFrontmatter,
  GroceriesItem,
  ActivityFilter,
}
