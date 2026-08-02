import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommissionTracker } from '../CommissionTracker'

// Mock the toast function
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('CommissionTracker', () => {
  const mockOfficerId = 'officer-123'

  it('renders commission tracker header', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('Commission Tracker')).toBeInTheDocument()
    expect(screen.getByText('Track your earnings and compete with other officers')).toBeInTheDocument()
  })

  it('displays statistics cards', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('Total Commissions')).toBeInTheDocument()
    expect(screen.getByText('Monthly Commissions')).toBeInTheDocument()
    expect(screen.getByText('Applications Processed')).toBeInTheDocument()
    expect(screen.getByText('Current Rank')).toBeInTheDocument()
  })

  it('shows commission amounts', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('AED 60')).toBeInTheDocument() // Total commissions
    expect(screen.getByText('AED 40')).toBeInTheDocument() // Monthly commissions
    expect(screen.getByText('15')).toBeInTheDocument() // Applications processed
    expect(screen.getByText('#3')).toBeInTheDocument() // Current rank
  })

  it('displays monthly target progress', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('Monthly Target Progress')).toBeInTheDocument()
    expect(screen.getByText('AED 40 / AED 100')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('AED 60 to reach target')).toBeInTheDocument()
  })

  it('shows progress bar', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  it('displays achievements', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('Achievements')).toBeInTheDocument()
    expect(screen.getByText('First 10 Applications')).toBeInTheDocument()
    expect(screen.getByText('Monthly Target Achiever')).toBeInTheDocument()
    expect(screen.getByText('Quality Excellence')).toBeInTheDocument()
  })

  it('toggles leaderboard display', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    const leaderboardButton = screen.getByText('Show Leaderboard')
    fireEvent.click(leaderboardButton)
    
    expect(screen.getByText('Hide Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('Officer Leaderboard')).toBeInTheDocument()
  })

  it('shows leaderboard when toggled', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    const leaderboardButton = screen.getByText('Show Leaderboard')
    fireEvent.click(leaderboardButton)
    
    expect(screen.getByText('Amer Officer 1')).toBeInTheDocument()
    expect(screen.getByText('Amer Officer 2')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('displays leaderboard rankings', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    const leaderboardButton = screen.getByText('Show Leaderboard')
    fireEvent.click(leaderboardButton)
    
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('#3')).toBeInTheDocument()
  })

  it('shows leaderboard commission amounts', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    const leaderboardButton = screen.getByText('Show Leaderboard')
    fireEvent.click(leaderboardButton)
    
    expect(screen.getByText('AED 120')).toBeInTheDocument()
    expect(screen.getByText('AED 100')).toBeInTheDocument()
    expect(screen.getByText('AED 60')).toBeInTheDocument()
  })

  it('displays commission history table', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('Commission History')).toBeInTheDocument()
    expect(screen.getByText('COM-001')).toBeInTheDocument()
    expect(screen.getByText('COM-002')).toBeInTheDocument()
    expect(screen.getByText('COM-003')).toBeInTheDocument()
  })

  it('shows commission details', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('Mohammed Hassan')).toBeInTheDocument()
    expect(screen.getByText('Wife Visa')).toBeInTheDocument()
    expect(screen.getByText('Son Visa')).toBeInTheDocument()
    expect(screen.getByText('Daughter Visa')).toBeInTheDocument()
  })

  it('displays commission status badges', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows commission amounts in table', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('AED 1,089')).toBeInTheDocument()
    expect(screen.getByText('AED 1,500')).toBeInTheDocument()
    expect(screen.getByText('AED 20')).toBeInTheDocument() // Commission amount
  })

  it('displays application IDs', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('APP-001')).toBeInTheDocument()
    expect(screen.getByText('APP-002')).toBeInTheDocument()
    expect(screen.getByText('APP-003')).toBeInTheDocument()
  })

  it('shows commission dates', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('1/15/2024')).toBeInTheDocument()
    expect(screen.getByText('1/18/2024')).toBeInTheDocument()
    expect(screen.getByText('1/20/2024')).toBeInTheDocument()
  })

  it('handles target achievement', () => {
    // Mock officer with achieved target
    const mockStatsWithTarget = {
      totalCommissions: 60,
      monthlyCommissions: 100,
      applicationsProcessed: 15,
      rank: 1,
      target: 100,
      achievements: ['Target Achieved']
    }

    // This would require mocking the component with different props
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('Target achieved! 🎉')).toBeInTheDocument()
  })

  it('shows rank icons correctly', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    // Should have rank icons for different positions
    const rankElements = screen.getAllByText('#3')
    expect(rankElements.length).toBeGreaterThan(0)
  })

  it('displays achievement icons', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    // Should have achievement icons
    const achievementCards = screen.getAllByText(/First 10 Applications|Monthly Target Achiever|Quality Excellence/)
    expect(achievementCards.length).toBe(3)
  })

  it('shows commission progress percentage', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('displays target progress status', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('shows applications processed count', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('25 applications processed')).toBeInTheDocument()
    expect(screen.getByText('20 applications processed')).toBeInTheDocument()
    expect(screen.getByText('15 applications processed')).toBeInTheDocument()
  })

  it('handles responsive design', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    // Should have responsive classes
    const statsGrid = screen.getByText('Total Commissions').closest('div')?.closest('div')
    expect(statsGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
  })

  it('shows commission history table headers', () => {
    render(<CommissionTracker officerId={mockOfficerId} />)
    
    expect(screen.getByText('Commission ID')).toBeInTheDocument()
    expect(screen.getByText('Application')).toBeInTheDocument()
    expect(screen.getByText('Applicant')).toBeInTheDocument()
    expect(screen.getByText('Service')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Commission')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
  })
})
