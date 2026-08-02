import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileText,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  DollarSign,
  Calendar,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

interface Invoice {
  id: string
  applicationId: string
  applicantName: string
  applicantEmail: string
  serviceType: string
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  createdAt: string
  dueDate: string
  paidAt?: string
  paymentMethod?: string
  commission?: number
  officerName?: string
  processingMethod: 'tammat' | 'amer'
}

interface InvoiceManagementProps {
  className?: string
}

export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ className = '' }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: 'INV-001',
        applicationId: 'APP-001',
        applicantName: 'Ahmed Al-Rashid',
        applicantEmail: 'ahmed@example.com',
        serviceType: 'Wife Visa',
        amount: 1089,
        status: 'paid',
        createdAt: '2024-01-15',
        dueDate: '2024-01-22',
        paidAt: '2024-01-18',
        paymentMethod: 'Credit Card',
        commission: 20,
        officerName: 'Amer Officer 1',
        processingMethod: 'tammat'
      },
      {
        id: 'INV-002',
        applicationId: 'APP-002',
        applicantName: 'Sarah Johnson',
        applicantEmail: 'sarah@example.com',
        serviceType: 'Son Visa',
        amount: 1500,
        status: 'pending',
        createdAt: '2024-01-20',
        dueDate: '2024-01-27',
        commission: 20,
        officerName: 'Amer Officer 2',
        processingMethod: 'amer'
      },
      {
        id: 'INV-003',
        applicationId: 'APP-003',
        applicantName: 'Mohammed Hassan',
        applicantEmail: 'mohammed@example.com',
        serviceType: 'Daughter Visa',
        amount: 1089,
        status: 'overdue',
        createdAt: '2024-01-10',
        dueDate: '2024-01-17',
        commission: 20,
        officerName: 'Amer Officer 1',
        processingMethod: 'tammat'
      }
    ]
    setInvoices(mockInvoices)
    setFilteredInvoices(mockInvoices)
  }, [])

  // Filter invoices
  useEffect(() => {
    let filtered = invoices

    if (searchQuery) {
      filtered = filtered.filter(invoice =>
        invoice.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(invoice => 
            new Date(invoice.createdAt).toDateString() === now.toDateString()
          )
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(invoice => 
            new Date(invoice.createdAt) >= filterDate
          )
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(invoice => 
            new Date(invoice.createdAt) >= filterDate
          )
          break
      }
    }

    setFilteredInvoices(filtered)
  }, [invoices, searchQuery, statusFilter, dateFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0 text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTotalRevenue = () => {
    return invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0)
  }

  const getTotalCommissions = () => {
    return invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((total, invoice) => total + (invoice.commission || 0), 0)
  }

  const getPendingAmount = () => {
    return invoices
      .filter(invoice => invoice.status === 'pending')
      .reduce((total, invoice) => total + invoice.amount, 0)
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Generate and download PDF invoice
    toast.success(`Downloading invoice ${invoice.id}`)
    // Implement PDF generation logic here
  }

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { 
              ...invoice, 
              status: 'paid' as const, 
              paidAt: new Date().toISOString(),
              paymentMethod: 'Manual Entry'
            }
          : invoice
      )
    )
    toast.success('Invoice marked as paid')
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDetails(true)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoice Management</h1>
          <p className="text-text-secondary">Track and manage all application payments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Revenue</p>
                  <p className="text-xl font-bold text-foreground">AED {getTotalRevenue().toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Commissions</p>
                  <p className="text-xl font-bold text-foreground">AED {getTotalCommissions().toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Pending Amount</p>
                  <p className="text-xl font-bold text-foreground">AED {getPendingAmount().toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Invoices</p>
                  <p className="text-xl font-bold text-foreground">{invoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  placeholder="Search by name, email, or invoice ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <Label className="text-sm font-medium">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.applicantName}</p>
                        <p className="text-sm text-text-secondary">{invoice.applicantEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{invoice.serviceType}</span>
                        <Badge variant="outline" className="text-xs">
                          {invoice.processingMethod}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">AED {invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {invoice.officerName && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-text-muted" />
                          <span className="text-sm">{invoice.officerName}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          {invoice.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDetails} onOpenChange={setShowInvoiceDetails}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>
              Complete information about this invoice
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Applicant Name</Label>
                  <p className="text-sm">{selectedInvoice.applicantName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedInvoice.applicantEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Service Type</Label>
                  <p className="text-sm">{selectedInvoice.serviceType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm font-bold">AED {selectedInvoice.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Processing Method</Label>
                  <p className="text-sm">{selectedInvoice.processingMethod}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm">{new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm">{new Date(selectedInvoice.dueDate).toLocaleString()}</p>
                </div>
                {selectedInvoice.paidAt && (
                  <div>
                    <Label className="text-sm font-medium">Paid Date</Label>
                    <p className="text-sm">{new Date(selectedInvoice.paidAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedInvoice.paymentMethod && (
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <p className="text-sm">{selectedInvoice.paymentMethod}</p>
                  </div>
                )}
                {selectedInvoice.commission && (
                  <div>
                    <Label className="text-sm font-medium">Commission</Label>
                    <p className="text-sm">AED {selectedInvoice.commission}</p>
                  </div>
                )}
                {selectedInvoice.officerName && (
                  <div>
                    <Label className="text-sm font-medium">Officer</Label>
                    <p className="text-sm">{selectedInvoice.officerName}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleDownloadInvoice(selectedInvoice)} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => setShowInvoiceDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InvoiceManagement
