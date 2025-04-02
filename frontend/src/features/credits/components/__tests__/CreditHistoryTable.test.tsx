import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react'
import { CreditHistoryTable } from '../CreditHistoryTable'
import { useCreditHistory } from '../../hooks/useCredits'
import { CreditTransactionType } from '../../api/credits.api'

// Mock the React Query hook
jest.mock('../../hooks/useCredits': any, (_: any) => ({
  useCreditHistory: jest.fn(),
}))

// Mock the Pagination component from @ajna/pagination
jest.mock('@ajna/pagination': any, (_: any) => ({
  Pagination: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PaginationContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PaginationPrevious: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  PaginationNext: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  PaginationPageGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PaginationPage: ({ page }: { page: number }) => <button>Page {page}</button>,
  usePagination: () => ({
    pages: [1, 2, 3],
    pagesCount: 3,
    currentPage: 1,
    setCurrentPage: jest.fn(),
    disabled: false,
  }),
}))

describe('CreditHistoryTable': any, (_: any) => {
  const mockUseCreditHistory = useCreditHistory as jest.Mock

  const mockTransactions = [
    {
      id: '1',
      userId: '123',
      type: CreditTransactionType.ALLOCATION,
      amount: 100,
      description: 'Welcome bonus',
      balanceAfter: 100,
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      userId: '123',
      type: CreditTransactionType.PURCHASE,
      amount: 500,
      description: 'Credit purchase',
      balanceAfter: 600,
      createdAt: '2023-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      userId: '123',
      type: CreditTransactionType.USAGE,
      amount: -50,
      description: 'Service usage',
      balanceAfter: 550,
      createdAt: '2023-01-03T00:00:00.000Z',
    },
  ]

  beforeEach((_: any) => {
    jest.clearAllMocks()
  })

  it('should display loading state': any, (_: any) => {
    mockUseCreditHistory.mockReturnValue({
      data: null,
      loading: true,
      isError: false,
    })

    render(<CreditHistoryTable />)
    expect(screen.getByRole('status')).toBeInTheDocument() // spinner
  })

  it('should display error state': any, (_: any) => {
    mockUseCreditHistory.mockReturnValue({
      data: null,
      loading: false,
      isError: true,
    })

    render(<CreditHistoryTable />)
    expect(screen.getByText(/There was an error loading your credit history/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
  })

  it('should display empty state': any, (_: any) => {
    mockUseCreditHistory.mockReturnValue({
      data: {
        transactions: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        },
      },
      loading: false,
      isError: false,
    })

    render(<CreditHistoryTable />)
    expect(screen.getByText(/You don't have any credit transactions yet/)).toBeInTheDocument()
  })

  it('should display transaction history': any, (_: any) => {
    mockUseCreditHistory.mockReturnValue({
      data: {
        transactions: mockTransactions,
        pagination: {
          total: 3,
          page: 1,
          limit: 10,
          pages: 1,
        },
      },
      loading: false,
      isError: false,
    })

    render(<CreditHistoryTable />)
    
    // Table headers
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Balance')).toBeInTheDocument()
    
    // Transaction data
    expect(screen.getByText('Welcome bonus')).toBeInTheDocument()
    expect(screen.getByText('Credit purchase')).toBeInTheDocument()
    expect(screen.getByText('Service usage')).toBeInTheDocument()
    
    // Transaction types
    expect(screen.getByText(/ALLOCATION/)).toBeInTheDocument()
    expect(screen.getByText(/PURCHASE/)).toBeInTheDocument()
    expect(screen.getByText(/USAGE/)).toBeInTheDocument()
    
    // Amounts (numbers might be formatted)
    expect(screen.getByText('+100')).toBeInTheDocument()
    expect(screen.getByText('+500')).toBeInTheDocument()
    expect(screen.getByText('-50')).toBeInTheDocument()
  })
})