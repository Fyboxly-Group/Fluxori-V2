import React from 'react';
import { render, screen } from '@testing-library/react'
import { CreditBalanceDisplay } from '../CreditBalanceDisplay'
import { useCreditBalance } from '../../hooks/useCredits'

// Mock the React Query hook
jest.mock('../../hooks/useCredits': any, (_: any) => ({
  useCreditBalance: jest.fn(),
}))

describe('CreditBalanceDisplay': any, (_: any) => {
  const mockUseCreditBalance = useCreditBalance as jest.Mock

  beforeEach((_: any) => {
    jest.clearAllMocks()
  })

  it('should display loading state': any, (_: any) => {
    mockUseCreditBalance.mockReturnValue({
      loading: true,
      data: null,
      isError: false,
    })

    render(<CreditBalanceDisplay />)
    expect(screen.getByText('Credits:')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument() // spinner
  })

  it('should display error state': any, (_: any) => {
    mockUseCreditBalance.mockReturnValue({
      loading: false,
      data: null,
      isError: true,
    })

    render(<CreditBalanceDisplay />)
    expect(screen.getByText('Credits:')).toBeInTheDocument()
    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('should display credit balance': any, (_: any) => {
    mockUseCreditBalance.mockReturnValue({
      loading: false,
      data: {
        userId: '123',
        balance: 1500,
        lastUpdated: '2023-01-01T00:00:00.000Z',
      },
      isError: false,
    })

    render(<CreditBalanceDisplay />)
    expect(screen.getByText('Credits:')).toBeInTheDocument()
    expect(screen.getByText('1,500')).toBeInTheDocument()
  })

  it('should hide label when showLabel is false': any, (_: any) => {
    mockUseCreditBalance.mockReturnValue({
      loading: false,
      data: {
        userId: '123',
        balance: 1500,
        lastUpdated: '2023-01-01T00:00:00.000Z',
      },
      isError: false,
    })

    render(<CreditBalanceDisplay showLabel={false} />)
    expect(screen.queryByText('Credits:')).not.toBeInTheDocument()
    expect(screen.getByText('1,500')).toBeInTheDocument()
  })
})