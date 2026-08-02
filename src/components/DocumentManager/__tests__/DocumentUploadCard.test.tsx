import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DocumentUploadCard } from '../DocumentUploadCard'

// Mock the toast function
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

const mockDocument = {
  id: 'test-doc',
  label: 'Test Document',
  required: true,
  category: 'sponsor' as const,
  accepted: ['image/*', 'application/pdf']
}

const mockUploadedDoc = {
  id: 'test-doc',
  file: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
  preview: 'blob:test-preview',
  status: 'uploaded' as const,
  progress: 100
}

const defaultProps = {
  document: mockDocument,
  onUpload: jest.fn(),
  onDelete: jest.fn(),
  onView: jest.fn(),
  onCrop: jest.fn(),
  disabled: false
}

describe('DocumentUploadCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders document information correctly', () => {
    render(<DocumentUploadCard {...defaultProps} />)
    
    expect(screen.getByText('Test Document')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument() // Required indicator
    expect(screen.getByText('Drag & drop or click to upload')).toBeInTheDocument()
  })

  it('shows uploaded document status', () => {
    render(<DocumentUploadCard {...defaultProps} uploadedDoc={mockUploadedDoc} />)
    
    expect(screen.getByText('Uploaded & Verified')).toBeInTheDocument()
  })

  it('handles file drag and drop', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const mockOnUpload = jest.fn().mockResolvedValue(undefined)
    
    render(<DocumentUploadCard {...defaultProps} onUpload={mockOnUpload} />)
    
    const dropZone = screen.getByText('Drag & drop or click to upload').closest('div')
    
    fireEvent.dragOver(dropZone!)
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    })
    
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith('test-doc', mockFile)
    })
  })

  it('validates file type on drag and drop', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const mockOnUpload = jest.fn()
    
    render(<DocumentUploadCard {...defaultProps} onUpload={mockOnUpload} />)
    
    const dropZone = screen.getByText('Drag & drop or click to upload').closest('div')
    
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    })
    
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled()
    })
  })

  it('validates file size on drag and drop', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(mockFile, 'size', { value: 15 * 1024 * 1024 }) // 15MB
    const mockOnUpload = jest.fn()
    
    render(<DocumentUploadCard {...defaultProps} onUpload={mockOnUpload} />)
    
    const dropZone = screen.getByText('Drag & drop or click to upload').closest('div')
    
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    })
    
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled()
    })
  })

  it('handles Amer officer result document upload', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const mockOnUpload = jest.fn()
    
    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
    
    render(
      <DocumentUploadCard 
        {...defaultProps} 
        onUpload={mockOnUpload}
        isAmerOfficer={true}
        isResultDocument={true}
        applicationId="test-app-123"
      />
    )
    
    const dropZone = screen.getByText('Drag & drop or click to upload').closest('div')
    
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/visa/test-app-123/result-documents'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': expect.any(String)
          }
        })
      )
    })
  })

  it('shows action buttons for uploaded documents', () => {
    render(<DocumentUploadCard {...defaultProps} uploadedDoc={mockUploadedDoc} />)
    
    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument()
  })

  it('handles document deletion', () => {
    const mockOnDelete = jest.fn()
    render(<DocumentUploadCard {...defaultProps} uploadedDoc={mockUploadedDoc} onDelete={mockOnDelete} />)
    
    const moreButton = screen.getByRole('button', { name: /more/i })
    fireEvent.click(moreButton)
    
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    expect(mockOnDelete).toHaveBeenCalledWith('test-doc')
  })

  it('handles document viewing', () => {
    const mockOnView = jest.fn()
    render(<DocumentUploadCard {...defaultProps} uploadedDoc={mockUploadedDoc} onView={mockOnView} />)
    
    const viewButton = screen.getByText('View')
    fireEvent.click(viewButton)
    
    expect(mockOnView).toHaveBeenCalledWith('test-doc')
  })

  it('shows preview dialog when view is clicked', () => {
    render(<DocumentUploadCard {...defaultProps} uploadedDoc={mockUploadedDoc} />)
    
    const viewButton = screen.getByText('View')
    fireEvent.click(viewButton)
    
    expect(screen.getByText('Test Document')).toBeInTheDocument()
    expect(screen.getByText('Document preview and details')).toBeInTheDocument()
  })

  it('disables interaction when disabled prop is true', () => {
    render(<DocumentUploadCard {...defaultProps} disabled={true} />)
    
    const dropZone = screen.getByText('Drag & drop or click to upload').closest('div')
    expect(dropZone).toHaveClass('cursor-not-allowed')
  })

  it('shows uploading progress', () => {
    const uploadingDoc = {
      ...mockUploadedDoc,
      status: 'uploading' as const,
      progress: 50
    }
    
    render(<DocumentUploadCard {...defaultProps} uploadedDoc={uploadingDoc} />)
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows error status', () => {
    const errorDoc = {
      ...mockUploadedDoc,
      status: 'error' as const
    }
    
    render(<DocumentUploadCard {...defaultProps} uploadedDoc={errorDoc} />)
    
    expect(screen.getByText('Upload Failed')).toBeInTheDocument()
  })

  it('shows rejection reason when document is rejected', () => {
    const rejectedDoc = {
      ...mockUploadedDoc,
      rejectionReason: 'Document quality is too low'
    }
    
    render(<DocumentUploadCard {...defaultProps} uploadedDoc={rejectedDoc} />)
    
    expect(screen.getByText('Rejected:')).toBeInTheDocument()
    expect(screen.getByText('Document quality is too low')).toBeInTheDocument()
  })
})
