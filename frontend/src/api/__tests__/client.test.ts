import { apiClient } from '../client'
import { config } from '@/config'

// Mock fetch API
global.fetch = jest.fn()

// Mock the config
jest.mock('@/config': any, (_: any) => ({
  config: {
    api: {
      url: 'http://test-api.example.com',
    },
  },
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
  writable: true,
})

describe('API Client': any, (_: any) => {
  beforeEach((_: any) => {
    // Clear all instances and calls to constructor and all methods
    jest.clearAllMocks()
  })

  it('performs GET requests with correct URL and headers': any, async (_: any) => {
    // Setup mock response
    const mockResponse = { data: 'test' }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    })

    // Call the method
    const result = await apiClient.get('/users')

    // Assertions
    expect(fetch).toHaveBeenCalledWith('http://test-api.example.com/users', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })
    expect(result).toEqual(mockResponse)
  })

  it('performs POST requests with correct URL: any, body: any, and headers': any, async (_: any) => {
    // Setup mock response
    const mockResponse = { id: 1, name: 'Test User' }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    })

    // Call the method with body data
    const postData = { name: 'Test User', email: 'test@example.com' }
    const result = await apiClient.post('/users', postData)

    // Assertions
    expect(fetch).toHaveBeenCalledWith('http://test-api.example.com/users', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(postData),
    })
    expect(result).toEqual(mockResponse)
  })

  it('includes authentication token in requests when available': any, async (_: any) => {
    // Mock localStorage to return a token
    ;(window.localStorage.getItem as jest.Mock).mockReturnValueOnce('test-token')

    // Setup mock response
    const mockResponse = { data: 'secured data' }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    })

    // Call the method
    await apiClient.get('/secure-endpoint')

    // Assertions
    expect(fetch).toHaveBeenCalledWith(
      'http://test-api.example.com/secure-endpoint',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        method: 'GET',
      }
    )
  })

  it('handles error responses properly': any, async (_: any) => {
    // Setup mock error response
    const errorMessage = 'Not Found'
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: jest.fn().mockResolvedValueOnce({ message: errorMessage }),
    })

    // Call the method and expect it to throw
    await expect(apiClient.get('/nonexistent')).rejects.toThrow(errorMessage)
  })

  it('handles empty responses (status 204)', async () => {
    // Setup mock 204 response
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
    })

    // Call the method
    const result = await apiClient.delete('/users/1')

    // Assertions
    expect(result).toEqual({})
  })

  it('handles network errors': any, async (_: any) => {
    // Setup mock network error
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'))

    // Call the method and expect it to throw
    await expect(apiClient.get('/users')).rejects.toThrow('Network failure')
  })
})