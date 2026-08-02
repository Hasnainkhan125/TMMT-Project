import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Send,
  Eye,
  Shield,
  Building,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';

interface OTPRequest {
  id: string;
  applicationId: string;
  type: 'establishment_card' | 'esignature_card' | 'phone_verification';
  status: 'pending' | 'sent' | 'verified' | 'expired';
  otp: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  applicantName: string;
  contactInfo: string;
  purpose: string;
  notes?: string;
}

interface OTPVerificationPanelProps {
  otpRequests: OTPRequest[];
  onOTPSent: (otpId: string) => void;
  onOTPVerified: (otpId: string, verificationCode: string) => void;
  onOTPExpired: (otpId: string) => void;
}

const OTPVerificationPanel: React.FC<OTPVerificationPanelProps> = ({
  otpRequests,
  onOTPSent,
  onOTPVerified,
  onOTPExpired
}) => {
  const [showNewOTPModal, setShowNewOTPModal] = useState(false);
  const [verificationModal, setVerificationModal] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [newOTP, setNewOTP] = useState<Partial<OTPRequest>>({
    type: 'establishment_card',
    status: 'pending',
    maxAttempts: 3
  });

  const handleCreateOTP = () => {
    if (newOTP.type && newOTP.applicantName && newOTP.contactInfo) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newOTPRequest: OTPRequest = {
        ...newOTP,
        id: Date.now().toString(),
        otp,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        attempts: 0,
        status: 'pending'
      } as OTPRequest;
      
      // Here you would add the new OTP request to your state
      console.log('New OTP created:', newOTPRequest);
      setNewOTP({ type: 'establishment_card', status: 'pending', maxAttempts: 3 });
      setShowNewOTPModal(false);
    }
  };

  const handleSendOTP = (otpId: string) => {
    onOTPSent(otpId);
    // Here you would integrate with SendGrid API to send the OTP
    console.log('Sending OTP for:', otpId);
  };

  const handleVerifyOTP = (otpId: string) => {
    if (verificationCode) {
      onOTPVerified(otpId, verificationCode);
      setVerificationCode('');
      setVerificationModal(null);
    }
  };

  const getOTPTypeIcon = (type: string) => {
    switch (type) {
      case 'establishment_card': return <Building className="w-4 h-4" />;
      case 'esignature_card': return <CreditCard className="w-4 h-4" />;
      case 'phone_verification': return <Phone className="w-4 h-4" />;
      default: return <Key className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-surface text-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* OTP Verification Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Key className="w-5 h-5" />
            OTP Verification System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {otpRequests.length}
              </div>
              <div className="text-sm text-text-secondary">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {otpRequests.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-text-secondary">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {otpRequests.filter(o => o.status === 'verified').length}
              </div>
              <div className="text-sm text-text-secondary">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {otpRequests.filter(o => o.status === 'expired').length}
              </div>
              <div className="text-sm text-text-secondary">Expired</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New OTP Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">OTP Verification Requests</h3>
        <Dialog open={showNewOTPModal} onOpenChange={setShowNewOTPModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New OTP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New OTP Request</DialogTitle>
              <DialogDescription>
                Generate a new OTP for applicant verification
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="otpType">OTP Type</Label>
                  <Select 
                    value={newOTP.type} 
                    onValueChange={(value) => setNewOTP({...newOTP, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select OTP type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="establishment_card">Establishment Card</SelectItem>
                      <SelectItem value="esignature_card">E-Signature Card</SelectItem>
                      <SelectItem value="phone_verification">Phone Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Select 
                    value={newOTP.maxAttempts?.toString()} 
                    onValueChange={(value) => setNewOTP({...newOTP, maxAttempts: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select max attempts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Attempts</SelectItem>
                      <SelectItem value="5">5 Attempts</SelectItem>
                      <SelectItem value="10">10 Attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="applicantName">Applicant Name</Label>
                <Input
                  id="applicantName"
                  placeholder="Enter applicant name"
                  value={newOTP.applicantName || ''}
                  onChange={(e) => setNewOTP({...newOTP, applicantName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input
                  id="contactInfo"
                  placeholder="Email or phone number"
                  value={newOTP.contactInfo || ''}
                  onChange={(e) => setNewOTP({...newOTP, contactInfo: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  placeholder="Reason for OTP verification"
                  value={newOTP.purpose || ''}
                  onChange={(e) => setNewOTP({...newOTP, purpose: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={newOTP.notes || ''}
                  onChange={(e) => setNewOTP({...newOTP, notes: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewOTPModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOTP} className="bg-blue-600 hover:bg-blue-700">
                Create OTP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* OTP Requests List */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {otpRequests.map((otp) => (
              <Card key={otp.id} className="border-l-4 border-l-blue-400">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        {getOTPTypeIcon(otp.type)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {otp.type.replace('_', ' ')} Verification
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {otp.applicantName} • {otp.contactInfo} • {otp.purpose}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-mono">OTP: {otp.otp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className={`text-sm ${
                              isExpired(otp.expiresAt) ? 'text-red-600' : 'text-text-secondary'
                            }`}>
                              {getTimeRemaining(otp.expiresAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-text-secondary">
                              {otp.attempts}/{otp.maxAttempts} attempts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(otp.status)}>
                        {getStatusIcon(otp.status)}
                        {otp.status}
                      </Badge>
                      
                      {otp.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleSendOTP(otp.id)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send OTP
                        </Button>
                      )}
                      
                      {otp.status === 'sent' && !isExpired(otp.expiresAt) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setVerificationModal(otp.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      )}
                      
                      {isExpired(otp.expiresAt) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onOTPExpired(otp.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Renew
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {otpRequests.length === 0 && (
              <div className="text-center py-12">
                <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No OTP requests yet</p>
                <p className="text-sm text-gray-400">OTP requests will appear here when created</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <Dialog open={!!verificationModal} onOpenChange={() => setVerificationModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              Enter the verification code provided by the applicant
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                placeholder={t('otp.enterCode')}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest bg-background border-border text-foreground focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerificationModal(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => verificationModal && handleVerifyOTP(verificationModal)}
              className="bg-green-600 hover:bg-green-700"
              disabled={verificationCode.length !== 6}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OTPVerificationPanel;
