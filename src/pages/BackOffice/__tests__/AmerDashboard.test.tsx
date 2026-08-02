import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/contexts/AuthContext'
import { useAmerDashboard } from '@/hooks/useAmerDashboard'
import AmerDashboard from '../AmerDashboard'

// Mock the hooks
jest.mock('@/contexts/AuthContext')
jest.mock('@/hooks/useAmerDashboard')
jest.mock('@/lib/socket', () => ({
  getSocket: () => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    connected: true
  })
}))

// Mock the components
jest.mock('@/components/AmerDashboard/DocumentUploadDrawer', () => ({
  DocumentUploadDrawer: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="document-upload-drawer">Document Upload Drawer</div> : null
}))

jest.mock('@/components/AmerDashboard/ApplicationDetailsDrawer', () => ({
  ApplicationDetailsDrawer: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="application-details-drawer">Application Details Drawer</div> : null
}))

jest.mock('@/components/AmerDashboard/DocumentReviewDialog', () => ({
  DocumentReviewDialog: ({ open, onOpenChange }: any) => 
    open ? <div data-testid="document-review-dialog">Document Review Dialog</div> : null
}))

const mockUser = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: 'amer'
}

const mockApplications = [
  {
    _id: 'app-1',
    sponsor: {
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      email: 'ahmed@example.com'
    },
    applicationType: 'wife_visa',
    status: 'submitted',
    attachments: [
      { id: 'att-1', type: 'passport', filename: 'passport.pdf' }
    ],
    metadata: {
      submittedAt: '2024-01-15T10:00:00Z'
    }
  },
  {
    _id: 'app-2',
    sponsor: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com'
    },
    applicationType: 'son_visa',
    status: 'under_review',
    attachments: [],
    metadata: {
      submittedAt: '2024-01-20T14:30:00Z'
    }
  }
]

const mockStats = {
  byStatus: [
    { _id: 'submitted', count: 5 },
    { _id: 'under_review', count: 3 },
    { _id: 'approved', count: 2 }
  ]
}

describe('AmerDashboard', () => {
  beforeEach(() => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      checkRole: jest.fn().mockResolvedValue(true)
    })

    ;(useAmerDashboard as jest.Mock).mockReturnValue({
      applications: mockApplications,
      filteredApplications: mockApplications,
      stats: mockStats,
      loading: false,
      fetchAllApplications: jest.fn(),
      updateApplicationStatus: jest.fn(),
      addFraudAlert: jest.fn(),
      issuePenalty: jest.fn(),
      requestAdditionalDocuments: jest.fn(),
      filterApplications: jest.fn(),
      fetchStats: jest.fn()
    })
  })

  it('renders dashboard header correctly', () => {
    render(<AmerDashboard />)
    
    expect(screen.getByText('Amer Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Officer Portal')).toBeInTheDocument()
  })

  it('displays statistics cards', () => {
    render(<AmerDashboard />)
    
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // Total applications
    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('shows applications list in mobile view', () => {
    render(<AmerDashboard />)
    
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('ahmed@example.com')).toBeInTheDocument()
    expect(screen.getByText('sarah@example.com')).toBeInTheDocument()
  })

  it('handles application row expansion', () => {
    render(<AmerDashboard />)
    
    const firstApplication = screen.getByText('Ahmed Al-Rashid').closest('div')
    fireEvent.click(firstApplication!)
    
    // Should show expanded content
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Upload Result')).toBeInTheDocument()
  })

  it('opens document upload drawer when upload button is clicked', () => {
    render(<AmerDashboard />)
    
    const uploadButtons = screen.getAllByText('Upload Result')
    fireEvent.click(uploadButtons[0])
    
    expect(screen.getByTestId('document-upload-drawer')).toBeInTheDocument()
  })

  it('opens application details drawer when view details is clicked', () => {
    render(<AmerDashboard />)
    
    // First expand the row
    const firstApplication = screen.getByText('Ahmed Al-Rashid').closest('div')
    fireEvent.click(firstApplication!)
    
    const viewDetailsButton = screen.getByText('View Details')
    fireEvent.click(viewDetailsButton)
    
    expect(screen.getByTestId('application-details-drawer')).toBeInTheDocument()
  })

  it('opens document review dialog when review button is clicked', () => {
    render(<AmerDashboard />)
    
    const reviewButtons = screen.getAllByText(/Review/)
    fireEvent.click(reviewButtons[0])
    
    expect(screen.getByTestId('document-review-dialog')).toBeInTheDocument()
  })

  it('handles status update dialog', () => {
    render(<AmerDashboard />)
    
    const moreButtons = screen.getAllByRole('button', { name: /more/i })
    fireEvent.click(moreButtons[0])
    
    // Should show status update option
    expect(screen.getByText('Update Application Status')).toBeInTheDocument()
  })

  it('filters applications by status', () => {
    render(<AmerDashboard />)
    
    const filterButton = screen.getByRole('button', { name: /filter/i })
    fireEvent.click(filterButton)
    
    const statusSelect = screen.getByDisplayValue('All Statuses')
    fireEvent.change(statusSelect, { target: { value: 'submitted' } })
    
    // Should filter applications
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
  })

  it('searches applications by query', () => {
    render(<AmerDashboard />)
    
    const searchInput = screen.getByPlaceholderText('Search applications...')
    fireEvent.change(searchInput, { target: { value: 'Ahmed' } })
    
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
  })

  it('shows loading state', () => {
    ;(useAmerDashboard as jest.Mock).mockReturnValue({
      applications: [],
      filteredApplications: [],
      stats: {},
      loading: true,
      fetchAllApplications: jest.fn(),
      updateApplicationStatus: jest.fn(),
      addFraudAlert: jest.fn(),
      issuePenalty: jest.fn(),
      requestAdditionalDocuments: jest.fn(),
      filterApplications: jest.fn(),
      fetchStats: jest.fn()
    })

    render(<AmerDashboard />)
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  it('shows access denied for non-amer users', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { ...mockUser, role: 'user' },
      loading: false,
      checkRole: jest.fn().mockResolvedValue(false)
    })

    render(<AmerDashboard />)
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.getByText("You don't have permission to access this dashboard.")).toBeInTheDocument()
  })

  it('displays fraud detection summary', () => {
    render(<AmerDashboard />)
    
    expect(screen.getByText('Security Monitor')).toBeInTheDocument()
    expect(screen.getByText('active alerts')).toBeInTheDocument()
    expect(screen.getByText('pending penalties')).toBeInTheDocument()
  })

  it('shows quick actions', () => {
    render(<AmerDashboard />)
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Fraud Scan')).toBeInTheDocument()
    expect(screen.getByText('Issue Penalty')).toBeInTheDocument()
    expect(screen.getByText('OTP Verification')).toBeInTheDocument()
  })

  it('handles mobile navigation tabs', () => {
    render(<AmerDashboard />)
    
    const applicationsTab = screen.getByText('Applications')
    const fraudTab = screen.getByText('Fraud')
    const penaltiesTab = screen.getByText('Penalties')
    
    expect(applicationsTab).toBeInTheDocument()
    expect(fraudTab).toBeInTheDocument()
    expect(penaltiesTab).toBeInTheDocument()
  })

  it('displays document count for each application', () => {
    render(<AmerDashboard />)
    
    expect(screen.getByText('1 docs')).toBeInTheDocument() // Ahmed's application has 1 attachment
    expect(screen.getByText('0 docs')).toBeInTheDocument() // Sarah's application has 0 attachments
  })

  it('shows application type badges', () => {
    render(<AmerDashboard />)
    
    expect(screen.getByText('wife visa')).toBeInTheDocument()
    expect(screen.getByText('son visa')).toBeInTheDocument()
  })

  it('displays submission dates', () => {
    render(<AmerDashboard />)
    
    expect(screen.getByText('1/15/2024')).toBeInTheDocument()
    expect(screen.getByText('1/20/2024')).toBeInTheDocument()
  })
})
