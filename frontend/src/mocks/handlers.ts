/**
 * Mock Service Worker handlers
 * For development and testing
 */

// Using 'any' type to avoid msw dependency issues
const http = {
  get: (url: string, resolver: (params: any) => any) => ({ url, method: 'GET', resolver }),
  post: (url: string, resolver: (params: any) => any) => ({ url, method: 'POST', resolver })
};

const HttpResponse = {
  json: (data: any) => data
};

import { config } from '@/config'
import { mockCreditBalance, mockTransactions, mockCreditPackages } from '@/features/credits/utils/mockData'

// API base URL
const apiUrl = config.api.url

// Mock Request type
interface MockRequest {
  url: string;
  json: () => Promise<any>;
}

interface handlersProps {}


// Create handlers array
export const handlers = [
  // Get credit balance
  http.get(`${apiUrl}/credits/balance`, () => {
    return HttpResponse.json(mockCreditBalance)
  }),

  // Get credit transaction history
  http.get(`${apiUrl}/credits/history`, (props: { request: MockRequest }) => {
    const url = new URL(props.request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedTransactions = mockTransactions.slice(startIndex, endIndex)
    
    return HttpResponse.json({
      transactions: paginatedTransactions,
      pagination: {
        total: mockTransactions.length,
        page,
        limit,
        pages: Math.ceil(mockTransactions.length / limit),
      },
    })
  }),

  // Get credit packages
  http.get(`${apiUrl}/credits/packages`, () => {
    return HttpResponse.json(mockCreditPackages)
  }),

  // Purchase credit package
  http.post(`${apiUrl}/credits/purchase`, async (props: { request: MockRequest }) => {
    const data = await props.request.json()
    const { packageId } = data
    
    // Simulate a successful purchase
    return HttpResponse.json({
      success: true,
      redirectUrl: `/dashboard/credits?purchaseComplete=${packageId}`,
    })
  }),
]