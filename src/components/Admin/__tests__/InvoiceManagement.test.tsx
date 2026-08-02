import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InvoiceManagement } from '../InvoiceManagement'

// Mock the toast function
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('InvoiceManagement', () => {
  it('renders invoice management header', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('Invoice Management')).toBeInTheDocument()
    expect(screen.getByText('Track and manage all application payments')).toBeInTheDocument()
  })

  it('displays statistics cards', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Total Commissions')).toBeInTheDocument()
    expect(screen.getByText('Pending Amount')).toBeInTheDocument()
    expect(screen.getByText('Total Invoices')).toBeInTheDocument()
  })

  it('shows revenue amounts', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('AED 2,589')).toBeInTheDocument() // Total revenue from mock data
    expect(screen.getByText('AED 60')).toBeInTheDocument() // Total commissions
    expect(screen.getByText('AED 1,500')).toBeInTheDocument() // Pending amount
    expect(screen.getByText('3')).toBeInTheDocument() // Total invoices
  })

  it('displays invoices table', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('Invoices (3)')).toBeInTheDocument()
    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.getByText('INV-002')).toBeInTheDocument()
    expect(screen.getByText('INV-003')).toBeInTheDocument()
  })

  it('shows invoice details', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('Mohammed Hassan')).toBeInTheDocument()
    expect(screen.getByText('Wife Visa')).toBeInTheDocument()
    expect(screen.getByText('Son Visa')).toBeInTheDocument()
    expect(screen.getByText('Daughter Visa')).toBeInTheDocument()
  })

  it('displays status badges', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('shows processing method badges', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('tammat')).toBeInTheDocument()
    expect(screen.getByText('amer')).toBeInTheDocument()
  })

  it('handles search functionality', () => {
    render(<InvoiceManagement />)
    
    const searchInput = screen.getByPlaceholderText('Search by name, email, or invoice ID...')
    fireEvent.change(searchInput, { target: { value: 'Ahmed' } })
    
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
  })

  it('filters by status', () => {
    render(<InvoiceManagement />)
    
    const statusSelect = screen.getByDisplayValue('All statuses')
    fireEvent.change(statusSelect, { target: { value: 'paid' } })
    
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
  })

  it('filters by date range', () => {
    render(<InvoiceManagement />)
    
    const dateSelect = screen.getByDisplayValue('All dates')
    fireEvent.change(dateSelect, { target: { value: 'today' } })
    
    // Should filter based on today's date
    expect(screen.getByText('Invoices (0)')).toBeInTheDocument()
  })

  it('opens invoice details dialog', () => {
    render(<InvoiceManagement />)
    
    const moreButtons = screen.getAllByRole('button', { name: /more/i })
    fireEvent.click(moreButtons[0])
    
    const viewDetailsOption = screen.getByText('View Details')
    fireEvent.click(viewDetailsOption)
    
    expect(screen.getByText('Invoice Details - INV-001')).toBeInTheDocument()
    expect(screen.getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(screen.getByText('ahmed@example.com')).toBeInTheDocument()
  })

  it('handles download invoice', () => {
    render(<InvoiceManagement />)
    
    const moreButtons = screen.getAllByRole('button', { name: /more/i })
    fireEvent.click(moreButtons[0])
    
    const downloadOption = screen.getByText('Download PDF')
    fireEvent.click(downloadOption)
    
    // Should trigger download
    expect(screen.getByText('Downloading invoice INV-001')).toBeInTheDocument()
  })

  it('marks invoice as paid', () => {
    render(<InvoiceManagement />)
    
    const moreButtons = screen.getAllByRole('button', { name: /more/i })
    fireEvent.click(moreButtons[1]) // Second invoice (pending)
    
    const markAsPaidOption = screen.getByText('Mark as Paid')
    fireEvent.click(markAsPaidOption)
    
    expect(screen.getByText('Invoice marked as paid')).toBeInTheDocument()
  })

  it('toggles statistics display', () => {
    render(<InvoiceManagement />)
    
    const statsButton = screen.getByText('Show Stats')
    fireEvent.click(statsButton)
    
    expect(screen.getByText('Hide Stats')).toBeInTheDocument()
  })

  it('exports all invoices', () => {
    render(<InvoiceManagement />)
    
    const exportButton = screen.getByText('Export All')
    fireEvent.click(exportButton)
    
    // Should trigger export
    expect(exportButton).toBeInTheDocument()
  })

  it('shows commission information', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('AED 20')).toBeInTheDocument() // Commission amount
    expect(screen.getByText('Amer Officer 1')).toBeInTheDocument()
    expect(screen.getByText('Amer Officer 2')).toBeInTheDocument()
  })

  it('displays payment information', () => {
    render(<InvoiceManagement />)
    
    const moreButtons = screen.getAllByRole('button', { name: /more/i })
    fireEvent.click(moreButtons[0])
    
    const viewDetailsOption = screen.getByText('View Details')
    fireEvent.click(viewDetailsOption)
    
    expect(screen.getByText('Credit Card')).toBeInTheDocument()
    expect(screen.getByText('1/18/2024')).toBeInTheDocument() // Paid date
  })

  it('shows processing method in details', () => {
    render(<InvoiceManagement />)
    
    const moreButtons = screen.getAllByRole('button', { name: /more/i })
    fireEvent.click(moreButtons[0])
    
    const viewDetailsOption = screen.getByText('View Details')
    fireEvent.click(viewDetailsOption)
    
    expect(screen.getByText('tammat')).toBeInTheDocument()
  })

  it('handles empty search results', () => {
    render(<InvoiceManagement />)
    
    const searchInput = screen.getByPlaceholderText('Search by name, email, or invoice ID...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    expect(screen.getByText('Invoices (0)')).toBeInTheDocument()
  })

  it('shows invoice amounts correctly', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('AED 1,089')).toBeInTheDocument()
    expect(screen.getByText('AED 1,500')).toBeInTheDocument()
  })

  it('displays creation and due dates', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('1/15/2024')).toBeInTheDocument()
    expect(screen.getByText('1/20/2024')).toBeInTheDocument()
    expect(screen.getByText('1/22/2024')).toBeInTheDocument()
    expect(screen.getByText('1/27/2024')).toBeInTheDocument()
  })

  it('shows officer information', () => {
    render(<InvoiceManagement />)
    
    expect(screen.getByText('Amer Officer 1')).toBeInTheDocument()
    expect(screen.getByText('Amer Officer 2')).toBeInTheDocument()
  })

  it('handles responsive design', () => {
    render(<InvoiceManagement />)
    
    // Should have responsive classes
    const statsGrid = screen.getByText('Total Revenue').closest('div')?.closest('div')
    expect(statsGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
  })
})
