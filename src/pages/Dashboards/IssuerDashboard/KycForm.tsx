
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  User, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Lock,
  Mail,
  Phone,
  Calendar,
  Building,
  CreditCard,
  Wallet
} from 'lucide-react';
import { submitKYC, KYCFormData } from '@/lib/kycService';

interface FormData extends KYCFormData {
  walletAddress: string;
}

export default function KYCForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    address: '',
    city: '',
    country: '',
    idType: '',
    idNumber: '',
    occupation: '',
    annualIncome: '',
    walletAddress: '',
    idDocument: null,
    addressProof: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateFormData = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.idType) newErrors.idType = 'ID type is required';
    if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
    if (!formData.walletAddress) newErrors.walletAddress = 'Wallet address is required';
    if (!formData.idDocument) newErrors.idDocument = 'ID document is required';
    if (!formData.addressProof) newErrors.addressProof = 'Address proof is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Submit KYC application using the service
      const result = await submitKYC(formData);
      console.log(result,'here is a result')
      // if (result.success) {
      //   setSubmitted(true);
      // } else {
      //   throw new Error(result.error || 'Submission failed');
      // }
    } catch (error) {
      console.error('Submission failed:', error);
      // You can add error handling here, like showing a toast notification
      alert('KYC submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FileUploadZone = ({ 
    label, 
    field, 
    acceptedTypes, 
    description 
  }: { 
    label: string; 
    field: keyof FormData; 
    acceptedTypes: string; 
    description: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-blue-500 transition-colors group">
        <input
          type="file"
          accept={acceptedTypes}
          onChange={(e) => updateFormData(field, e.target.files?.[0] || null)}
          className="hidden"
          id={field}
        />
        <label htmlFor={field} className="cursor-pointer">
          <Upload className="mx-auto h-6 w-6 text-slate-400 group-hover:text-blue-500 mb-2" />
          <p className="text-sm text-text-secondary mb-1">Click to upload</p>
          <p className="text-xs text-slate-500">{description}</p>
          {formData[field] && (
            <Badge variant="secondary" className="mt-2">
              {(formData[field] as File)?.name}
            </Badge>
          )}
        </label>
      </div>
      {errors[field] && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">KYC Submitted Successfully!</h2>
              <p className="text-text-secondary mb-6">
                Thank you for completing your KYC verification. We'll review your submission 
                and notify you within 1-2 business days.
              </p>
              <Alert className="border-blue-200 bg-blue-50 text-left">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your documents are encrypted and stored securely. You can track your verification status in your dashboard.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">KYC Verification</h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Complete your identity verification to unlock all platform features. 
            Your information is encrypted and secured with bank-grade security.
          </p>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Identity Verification Form
            </CardTitle>
            <CardDescription className="text-blue-100">
              Please provide accurate information for verification
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className="h-11"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      className="h-11"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="h-11"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="h-11"
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date of Birth *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      className="h-11"
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="walletAddress" className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Wallet className="h-4 w-4" />
                      Wallet Address *
                    </Label>
                    <Input
                      id="walletAddress"
                      value={formData.walletAddress}
                      onChange={(e) => updateFormData('walletAddress', e.target.value)}
                      className="h-11"
                      placeholder="0x..."
                    />
                    {errors.walletAddress && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.walletAddress}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Gender *</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => updateFormData('gender', value)}
                      className="flex gap-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                    {errors.gender && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Nationality *</Label>
                    <Select value={formData.nationality} onValueChange={(value) => updateFormData('nationality', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.nationality && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.nationality}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Address Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-foreground">
                    Street Address *
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="min-h-[80px]"
                    placeholder="Enter your complete address"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-foreground">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="h-11"
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Identity & Employment */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Identity & Employment
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      ID Document Type *
                    </Label>
                    <Select value={formData.idType} onValueChange={(value) => updateFormData('idType', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                        <SelectItem value="national_id">National ID Card</SelectItem>
                        <SelectItem value="state_id">State ID Card</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.idType && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.idType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-sm font-medium text-foreground">
                      ID Number *
                    </Label>
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={(e) => updateFormData('idNumber', e.target.value)}
                      className="h-11"
                      placeholder="Enter ID number"
                    />
                    {errors.idNumber && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.idNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="occupation" className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      Occupation
                    </Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => updateFormData('occupation', e.target.value)}
                      className="h-11"
                      placeholder="Enter your occupation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Annual Income</Label>
                    <Select value={formData.annualIncome} onValueChange={(value) => updateFormData('annualIncome', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-25000">$0 - $25,000</SelectItem>
                        <SelectItem value="25001-50000">$25,001 - $50,000</SelectItem>
                        <SelectItem value="50001-100000">$50,001 - $100,000</SelectItem>
                        <SelectItem value="100001-250000">$100,001 - $250,000</SelectItem>
                        <SelectItem value="250001+">$250,001+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Document Upload
                </h3>
                
                <Alert className="border-amber-200 bg-amber-50">
                  <Upload className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Please upload clear, high-quality images of your documents. Ensure all text is readable.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadZone
                    label="Government ID Document *"
                    field="idDocument"
                    acceptedTypes="image/*,.pdf"
                    description="PDF, JPG, PNG up to 10MB"
                  />

                  <FileUploadZone
                    label="Address Proof *"
                    field="addressProof"
                    acceptedTypes="image/*,.pdf"
                    description="Utility bill, bank statement"
                  />
                </div>
              </div>

              {/* Security Notice */}
              <Alert className="border-green-200 bg-green-50">
                <Lock className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Security Notice:</strong> All uploaded documents are encrypted end-to-end 
                  and stored in compliance with international data protection standards.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting KYC...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Submit KYC Verification
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <Lock className="h-4 w-4" />
            <span>256-bit SSL encryption • GDPR compliant • SOC 2 certified</span>
          </div>
          <p className="text-xs text-slate-500">
            Your data is protected by bank-grade security measures
          </p>
        </div>
      </div>
    </div>
  );
}