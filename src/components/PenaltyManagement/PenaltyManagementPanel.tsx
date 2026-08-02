import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gavel, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Mail, 
  Download, 
  Plus,
  FileText,
  UserX,
  Ban,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Penalty {
  id: string;
  applicationId: string;
  type: 'fine' | 'ban' | 'blacklist' | 'legal_action';
  amount?: number;
  currency?: string;
  duration?: string;
  reason: string;
  status: 'pending' | 'issued' | 'paid' | 'disputed';
  issuedAt: string;
  dueDate?: string;
  applicantName: string;
  documentType: string;
  fraudEvidence: string[];
}

interface PenaltyManagementPanelProps {
  penalties: Penalty[];
  onPenaltyIssued: (penalty: Partial<Penalty>) => void;
  onPenaltyUpdated: (penaltyId: string, updates: Partial<Penalty>) => void;
}

const PenaltyManagementPanel: React.FC<PenaltyManagementPanelProps> = ({
  penalties,
  onPenaltyIssued,
  onPenaltyUpdated
}) => {
  const [showNewPenaltyModal, setShowNewPenaltyModal] = useState(false);
  const [newPenalty, setNewPenalty] = useState<Partial<Penalty>>({
    type: 'fine',
    currency: 'AED',
    status: 'pending'
  });

  const handleCreatePenalty = () => {
    if (newPenalty.type && newPenalty.reason) {
      onPenaltyIssued({
        ...newPenalty,
        id: Date.now().toString(),
        issuedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      });
      setNewPenalty({ type: 'fine', currency: 'AED', status: 'pending' });
      setShowNewPenaltyModal(false);
    }
  };

  const getPenaltyTypeIcon = (type: string) => {
    switch (type) {
      case 'fine': return <DollarSign className="w-4 h-4" />;
      case 'ban': return <Ban className="w-4 h-4" />;
      case 'blacklist': return <UserX className="w-4 h-4" />;
      case 'legal_action': return <FileText className="w-4 h-4" />;
      default: return <Gavel className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-surface text-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'issued': return <AlertTriangle className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'disputed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const sendEmailNotice = (penalty: Penalty) => {
    // Simulate sending email notice
    console.log('Sending email notice for penalty:', penalty.id);
    // Here you would integrate with SendGrid API
  };

  return (
    <div className="space-y-6">
      {/* Penalty Management Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Gavel className="w-5 h-5" />
            Penalty Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {penalties.length}
              </div>
              <div className="text-sm text-text-secondary">Total Penalties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {penalties.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-sm text-text-secondary">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {penalties.filter(p => p.status === 'paid').length}
              </div>
              <div className="text-sm text-text-secondary">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {penalties.filter(p => p.status === 'disputed').length}
              </div>
              <div className="text-sm text-text-secondary">Disputed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Penalty Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Penalties</h3>
        <Dialog open={showNewPenaltyModal} onOpenChange={setShowNewPenaltyModal}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Issue New Penalty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Issue New Penalty</DialogTitle>
              <DialogDescription>
                Create a new penalty for fraudulent activity or non-compliance
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="penaltyType">Penalty Type</Label>
                  <Select 
                    value={newPenalty.type} 
                    onValueChange={(value) => setNewPenalty({...newPenalty, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select penalty type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fine">Fine</SelectItem>
                      <SelectItem value="ban">Temporary Ban</SelectItem>
                      <SelectItem value="blacklist">Blacklist</SelectItem>
                      <SelectItem value="legal_action">Legal Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={newPenalty.currency} 
                    onValueChange={(value) => setNewPenalty({...newPenalty, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AED">AED</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {newPenalty.type === 'fine' && (
                <div>
                  <Label htmlFor="amount">Fine Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter fine amount"
                    value={newPenalty.amount || ''}
                    onChange={(e) => setNewPenalty({...newPenalty, amount: parseFloat(e.target.value)})}
                  />
                </div>
              )}
              
              {newPenalty.type === 'ban' && (
                <div>
                  <Label htmlFor="duration">Ban Duration</Label>
                  <Select 
                    value={newPenalty.duration} 
                    onValueChange={(value) => setNewPenalty({...newPenalty, duration: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30_days">30 Days</SelectItem>
                      <SelectItem value="90_days">90 Days</SelectItem>
                      <SelectItem value="6_months">6 Months</SelectItem>
                      <SelectItem value="1_year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="reason">Reason for Penalty</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe the reason for issuing this penalty..."
                  value={newPenalty.reason || ''}
                  onChange={(e) => setNewPenalty({...newPenalty, reason: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="applicantName">Applicant Name</Label>
                <Input
                  id="applicantName"
                  placeholder="Enter applicant name"
                  value={newPenalty.applicantName || ''}
                  onChange={(e) => setNewPenalty({...newPenalty, applicantName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Input
                  id="documentType"
                  placeholder="e.g., Emirates ID, Passport"
                  value={newPenalty.documentType || ''}
                  onChange={(e) => setNewPenalty({...newPenalty, documentType: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewPenaltyModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePenalty} className="bg-orange-600 hover:bg-orange-700">
                Issue Penalty
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Penalties List */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {penalties.map((penalty) => (
              <Card key={penalty.id} className="border-l-4 border-l-orange-400">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        {getPenaltyTypeIcon(penalty.type)}
                      </div>
                      <div>
                        <p className="font-medium">{penalty.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {penalty.applicantName} • {penalty.documentType} • {new Date(penalty.issuedAt).toLocaleDateString()}
                        </p>
                        {penalty.amount && (
                          <p className="text-sm font-medium text-orange-600">
                            {penalty.amount} {penalty.currency}
                          </p>
                        )}
                        {penalty.duration && (
                          <p className="text-sm text-muted-foreground">
                            Duration: {penalty.duration.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(penalty.status)}>
                        {getStatusIcon(penalty.status)}
                        {penalty.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => sendEmailNotice(penalty)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Notice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onPenaltyUpdated(penalty.id, { status: 'disputed' })}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Mark as Disputed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {penalties.length === 0 && (
              <div className="text-center py-12">
                <Gavel className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No penalties issued yet</p>
                <p className="text-sm text-gray-400">Penalties will appear here when issued</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PenaltyManagementPanel;
