# Pinia Colada Transition Plan for PocketBase

## Overview
This document outlines the plan to transition from a manual client setup to using [Pinia Colada](https://pinia-colada.esm.dev/) for data fetching in our PocketBase integration. Pinia Colada offers automatic caching, async state management, and a powerful plugin system which will streamline our state management process.

## Goals
- Replace manual API calls with Pinia Colada's data fetching capabilities.
- Implement caching to reduce redundant requests.
- Utilize async state handling for better user experience.
- Leverage Pinia Colada plugins for additional functionality.
- Replace the monolithic singleton client with composable-based architecture.

## Architectural Changes

### From Singleton to Composables

The current implementation relies on a single monolithic client that handles all PocketBase operations. This approach has several limitations:

1. **Tight coupling**: The singleton pattern creates tight coupling between components and data fetching logic.
2. **Limited reusability**: All operations are bundled together, making it difficult to use only what's needed.
3. **Inefficient caching**: No built-in caching mechanism for repeated queries.
4. **Difficult testing**: Monolithic structure is harder to mock and test in isolation.

The new architecture will:

1. **Break down the monolithic client** into smaller, focused composables using Pinia Colada:
   - `useItemQuery` - For fetching single items
   - `useItemList` - For paginated lists with filtering
   - `useItemToggle` - For toggle operations
   - `useDebtTransaction` - For debt-related operations
   - `useAuth` - For authentication operations

2. **Organize by domain** instead of by operation type:
   - Group related queries and mutations by their domain (items, debts, auth)
   - Export composable functions that encapsulate the logic

3. **Create a modular structure**:
   ```
   /composables
     /queries
       useItemQuery.ts
       useItemListQuery.ts
       useActivitiesQuery.ts
       index.ts
     /mutations
       useItemToggleMutation.ts
       useDebtTransactionMutation.ts
     /auth
       useAuthQuery.ts
   ```

## Benefits

1. **Code Splitting**: Only load the queries that are actually used in each component.
2. **Automatic Caching**: Pinia Colada provides built-in caching and request deduplication.
3. **Better Developer Experience**:
   - More intuitive API with dedicated composables for specific operations
   - TypeScript inference works better with specialized functions
   - Easier to understand what data dependencies a component has
4. **Loading & Error States**: Automatic handling of loading, error, and success states.
5. **Performance Improvements**:
   - Reduced network requests through caching
   - Optimistic updates for better perceived performance
6. **Maintainability**:
   - Easier to add new operations or modify existing ones
   - Better separation of concerns
   - More modular codebase
7. **Testability**: Easier to mock and test individual operations.

## Steps
1. **Setup Pinia Colada**: Install and configure Pinia Colada in the project.
2. **Define Query Composables**: Create composables using Pinia Colada for different PocketBase collections.
3. **Create Domain-Specific Queries**: Implement the individual composables for queries and mutations.
4. **Integrate with PocketBase**: Adapt the existing PocketBase client to work with Pinia Colada's fetching mechanism.
5. **Update Components**: Modify components to use the new composables instead of direct API calls.
6. **Testing**: Ensure all functionalities work as expected with the new setup.
7. **Documentation**: Update module documentation to reflect the changes.

## Implementation Example

### Before:
```ts
const { $client } = useNuxtApp()
const item = await $client.getItem('item_id')
```

### After:
```ts
import { useItemQuery } from '~/composables/queries'

// Automatic caching, loading states, and error handling
const { data: item, isPending, error } = useItemQuery('item_id')

// Access to additional features like manual refetching
const { refetch } = useItemQuery('item_id')
```

## Resources
- [Pinia Colada Documentation](https://pinia-colada.esm.dev/)
- [VueUse storeToRefs](https://vueuse.org/core/storeToRefs/) - Useful for extracting reactive refs

This plan will be updated as we progress through the transition, incorporating feedback and addressing any issues that arise. 
