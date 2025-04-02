/**
 * Query utilities
 */

/**
 * Create a query client with default options
 */
export const createQueryClient = () => ({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
