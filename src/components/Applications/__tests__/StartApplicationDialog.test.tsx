import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StartApplicationDialog from '../StartApplicationDialog'

// Mock the socket
jest.mock('@/lib/socket', () => ({
  getSocket: () => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    connected: true
  })
}))

// Mock the services data
const mockServices = [
  {
    id: 'wife-visa',
    name: 'Wife Visa',
    description: 'Sponsor your wife for UAE residence',
    category: 'family',
    requirements: ['passport', 'emirates-id', 'marriage-certificate'],
    processingTime: '5-7 business days'
  }
]

// Mock fetch for services
global.fetch = jest.fn()

describe('StartApplicationDialog', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockServices)
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders dialog when open', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    expect(screen.getByText('Start New Application')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<StartApplicationDialog open={false} onOpenChange={jest.fn()} />)
    
    expect(screen.queryByText('Start New Application')).not.toBeInTheDocument()
  })

  it('displays service selection tab by default', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    expect(screen.getByText('Service')).toBeInTheDocument()
    expect(screen.getByText('Sponsor')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Guidance')).toBeInTheDocument()
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('navigates to sponsor information tab', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    expect(screen.getByText('Sponsor Information')).toBeInTheDocument()
  })

  it('shows sponsor type selection', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    expect(screen.getByText('Employee')).toBeInTheDocument()
    expect(screen.getByText('Investor')).toBeInTheDocument()
    expect(screen.getByText('Partner')).toBeInTheDocument()
  })

  it('shows location selection', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    expect(screen.getByText('Your Current Location')).toBeInTheDocument()
    expect(screen.getByText('Inside UAE')).toBeInTheDocument()
    expect(screen.getByText('Outside UAE')).toBeInTheDocument()
  })

  it('shows processing method selection with pricing', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    expect(screen.getByText('Processing Method')).toBeInTheDocument()
    expect(screen.getByText('TAMMET Processing')).toBeInTheDocument()
    expect(screen.getByText('AMER Processing')).toBeInTheDocument()
    expect(screen.getByText('AED 1,089')).toBeInTheDocument()
    expect(screen.getByText('AED 1,500')).toBeInTheDocument()
    expect(screen.getByText('Recommended')).toBeInTheDocument()
  })

  it('shows TAMMET benefits', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    expect(screen.getByText('Lower processing fees')).toBeInTheDocument()
    expect(screen.getByText('Faster response time')).toBeInTheDocument()
    expect(screen.getByText('UAE Pass integration')).toBeInTheDocument()
    expect(screen.getByText('24/7 support')).toBeInTheDocument()
  })

  it('shows contact information fields', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument()
  })

  it('shows IBAN field for investor/partner', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    // Select investor type
    const investorCard = screen.getByText('Investor')
    fireEvent.click(investorCard)
    
    expect(screen.getByLabelText(/IBAN Number/)).toBeInTheDocument()
  })

  it('shows document requirements preview', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    expect(screen.getByText('Document Requirements Preview')).toBeInTheDocument()
    expect(screen.getByText('Studio Photo')).toBeInTheDocument()
    expect(screen.getByText('Passport Copy')).toBeInTheDocument()
    expect(screen.getByText('Passport Cover Page')).toBeInTheDocument()
  })

  it('shows different document requirements for employee', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    // Select employee type
    const employeeCard = screen.getByText('Employee')
    fireEvent.click(employeeCard)
    
    expect(screen.getByText('MOHRE approval and labor contract')).toBeInTheDocument()
  })

  it('shows different document requirements for investor/partner', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    // Select investor type
    const investorCard = screen.getByText('Investor')
    fireEvent.click(investorCard)
    
    expect(screen.getByText('Trade license and establishment documents')).toBeInTheDocument()
  })

  it('disables documents tab until sponsor info is complete', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const documentsTab = screen.getByText('Documents')
    expect(documentsTab.closest('button')).toHaveAttribute('disabled')
  })

  it('enables documents tab when sponsor info is complete', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    // Fill in required fields
    const emailInput = screen.getByLabelText(/Email Address/)
    const phoneInput = screen.getByLabelText(/Phone Number/)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '+971501234567' } })
    
    const documentsTab = screen.getByText('Documents')
    expect(documentsTab.closest('button')).not.toHaveAttribute('disabled')
  })

  it('shows continue button to proceed to documents', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    expect(screen.getByText('Continue to Document Upload')).toBeInTheDocument()
  })

  it('navigates to documents tab when continue button is clicked', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    // Fill in required fields
    const emailInput = screen.getByLabelText(/Email Address/)
    const phoneInput = screen.getByLabelText(/Phone Number/)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '+971501234567' } })
    
    const continueButton = screen.getByText('Continue to Document Upload')
    fireEvent.click(continueButton)
    
    // Should navigate to documents tab
    expect(screen.getByText('Documents')).toBeInTheDocument()
  })

  it('shows processing time information', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const guidanceTab = screen.getByText('Guidance')
    fireEvent.click(guidanceTab)
    
    expect(screen.getByText('1-3 business days')).toBeInTheDocument()
  })

  it('shows review and submit tab', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const submitTab = screen.getByText('Submit')
    fireEvent.click(submitTab)
    
    expect(screen.getByText('Review & Submit Application')).toBeInTheDocument()
    expect(screen.getByText('Ready to Submit')).toBeInTheDocument()
  })

  it('validates required fields', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    const continueButton = screen.getByText('Continue to Document Upload')
    expect(continueButton).toBeDisabled()
  })

  it('handles sponsor type selection', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    const employeeCard = screen.getByText('Employee')
    fireEvent.click(employeeCard)
    
    expect(employeeCard.closest('div')).toHaveClass('border-primary')
  })

  it('handles location selection', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    const insideUaeCard = screen.getByText('Inside UAE')
    fireEvent.click(insideUaeCard)
    
    expect(insideUaeCard.closest('div')).toHaveClass('border-primary')
  })

  it('handles processing method selection', () => {
    render(<StartApplicationDialog open={true} onOpenChange={jest.fn()} />)
    
    const sponsorTab = screen.getByText('Sponsor')
    fireEvent.click(sponsorTab)
    
    const tammetCard = screen.getByText('TAMMET Processing')
    fireEvent.click(tammetCard)
    
    expect(tammetCard.closest('div')).toHaveClass('border-primary')
  })
})
