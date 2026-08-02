"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Building2, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CreditCard, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Save,
  Send,
  Upload,
  Eye,
  EyeOff,
  Info,
  HelpCircle,
  Star,
  Clock,
  CheckSquare,
  Square
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import EnhancedAIDocumentUploader from '@/components/DocumentUpload/EnhancedAIDocumentUploader'
import { useApplications } from '@/hooks/useApplications'

interface VisaApplicationFormData {
  applicationType: string
  serviceId: string
  serviceName: string
  sponsored: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    nationality: string
    passportNumber: string
    dateOfBirth: string
    relationship: string
  }
  metadata: {
    personalInfo: {
      nationality: string
      emiratesId: string
      currentVisa: string
      accommodation: string
    }
    sponsorInfo: {
      salary: string
      company: string
      tradeLicense: string
      establishmentCard: string
      nationality: string
      emiratesId: string
      firstName: string
      lastName: string
      email: string
      phoneNumber: string
    }
    additionalNotes: string
  }
}

const VISA_TYPES = [
  { value: 'family_visa', label: 'Family Visa', icon: User, color: 'text-blue-700' },
  { value: 'residence_visa', label: 'Residence Visa', icon: Building2, color: 'text-green-700' },
  { value: 'entry_permit', label: 'Entry Permit', icon: MapPin, color: 'text-purple-700' },
  { value: 'emirates_id', label: 'Emirates ID', icon: CreditCard, color: 'text-orange-700' },
  { value: 'medical', label: 'Medical Visa', icon: Shield, color: 'text-red-700' },
  { value: 'visa_renewal', label: 'Visa Renewal', icon: Clock, color: 'text-indigo-700' },
  { value: 'change_status', label: 'Change Status', icon: ArrowRight, color: 'text-pink-700' },
  { value: 'visa_stamping', label: 'Visa Stamping', icon: CheckSquare, color: 'text-teal-700' }
]

const RELATIONSHIPS = [
  'Spouse', 'Child', 'Parent', 'Sibling', 'In-Law', 'Other'
]

const NATIONALITIES = [
  'UAE', 'India', 'Pakistan', 'Bangladesh', 'Philippines', 'Egypt', 'Jordan', 'Lebanon', 'Syria', 'Iraq', 'Iran', 'Afghanistan', 'Other'
]

const VisaApplicationForm: React.FC = () => {
  const { createApplication, loading } = useApplications()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<VisaApplicationFormData>({
    applicationType: '',
    serviceId: '',
    serviceName: '',
    sponsored: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      nationality: '',
      passportNumber: '',
      dateOfBirth: '',
      relationship: ''
    },
    metadata: {
      personalInfo: {
        nationality: '',
        emiratesId: '',
        currentVisa: '',
        accommodation: ''
      },
      sponsorInfo: {
        salary: '',
        company: '',
        tradeLicense: '',
        establishmentCard: '',
        nationality: '',
        emiratesId: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
      },
      additionalNotes: ''
    }
  })

  const [errors, setErrors] = useState<Partial<Record<keyof VisaApplicationFormData, string>>>({})
  const [documents, setDocuments] = useState<File[]>([])
  const [extractedData, setExtractedData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 4

  const handleInputChange = (field: string, value: string, subField?: string) => {
    console.log('handleInputChange called:', { field, value, subField })
    setFormData(prev => {
      if (subField) {
        if (field === 'sponsored') {
          return {
            ...prev,
            sponsored: {
              ...prev.sponsored,
              [subField]: value
            }
          }
        } else if (field === 'metadata') {
          return {
            ...prev,
            metadata: {
              ...prev.metadata,
              [subField]: value
            }
          }
        }
      }
      return {
        ...prev,
        [field]: value
      }
    })
    
    if (errors[field as keyof VisaApplicationFormData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePersonalInfoChange = (field: string, value: string) => {
    console.log('handlePersonalInfoChange called:', { field, value })
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        personalInfo: {
          ...prev.metadata.personalInfo,
          [field]: value
        }
      }
    }))
  }

  const handleSponsorInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        sponsorInfo: {
          ...prev.metadata.sponsorInfo,
          [field]: value
        }
      }
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof VisaApplicationFormData, string>> = {}

    switch (step) {
      case 1:
        if (!formData.applicationType) newErrors.applicationType = 'Application type is required'
        if (!formData.serviceId) newErrors.serviceId = 'Service ID is required'
        break
      case 2:
        if (!formData.sponsored.firstName) newErrors.sponsored = 'Sponsored person first name is required'
        if (!formData.sponsored.lastName) newErrors.sponsored = 'Sponsored person last name is required'
        if (!formData.sponsored.email) newErrors.sponsored = 'Sponsored person email is required'
        if (!formData.sponsored.phoneNumber) newErrors.sponsored = 'Sponsored person phone is required'
        break
      case 3:
        if (!formData.metadata.personalInfo.nationality) newErrors.metadata = '  is required'
        if (!formData.metadata.personalInfo.emiratesId) newErrors.metadata = 'Emirates ID is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleDocumentsReady = (files: File[]) => {
    setDocuments(files)
  }

  const handleUploadComplete = (uploadedDocs: any[], extracted: any) => {
    setDocuments(uploadedDocs.map(doc => doc.file))
    setExtractedData(extracted)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    console.log('handleSubmit called', formData, documents)
    setIsSubmitting(true)
    try {
      const applicationData = {
        applicationType: formData.applicationType,
        sponsored: formData.sponsored,
        metadata: {
          serviceId: formData.serviceId,
          serviceName: formData.serviceName,
          personalInfo: formData.metadata.personalInfo,
          sponsorInfo: formData.metadata.sponsorInfo,
          additionalNotes: formData.metadata.additionalNotes,
          fraudRisk: 'low',
          blacklistStatus: 'clean',
          requiredDocuments: documents.map(doc => doc.name)||[],
          priority: 'normal'
        }
      }

      console.log('applicationData', applicationData)
      const result = await createApplication(applicationData)
      if (result) {
        toast.success('Visa application created successfully!')
      }
    } catch (error) {
      toast.error('Failed to create application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <FileText className="w-5 h-5" />
      case 2: return <User className="w-5 h-5" />
      case 3: return <Building2 className="w-5 h-5" />
      case 4: return <Upload className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Application Details'
      case 2: return 'Sponsored Person'
      case 3: return 'Personal Information'
      case 4: return 'Document Upload'
      default: return 'Application Details'
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      x: -50, 
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        delay: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-['Poppins']">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">Visa Application Form</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Complete your application with our step-by-step process designed for clarity and ease
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i + 1} className="flex items-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep > i + 1 
                      ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                      : currentStep === i + 1 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                      : 'bg-background border-border text-slate-400'
                  }`}
                >
                  {currentStep > i + 1 ? <CheckCircle className="w-6 h-6" /> : getStepIcon(i + 1)}
                </motion.div>
                {i < totalSteps - 1 && (
                  <div className={`w-20 h-1 mx-3 rounded-full transition-all duration-500 ${
                    currentStep > i + 1 ? 'bg-green-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-3 bg-slate-200" />
          <p className="text-center text-base text-foreground mt-4 font-medium">
            Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
          </p>
        </motion.div>

        {/* Debug Section - Remove in production */}
        <div className="mb-8 p-4 bg-slate-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-12"
          >
            {/* Step 1: Application Details */}
            {currentStep === 1 && (
              <motion.div variants={cardVariants}>
                <Card className="shadow-xl border-0 bg-background">
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <CardTitle className="flex items-center text-2xl font-bold text-foreground">
                      <FileText className="w-7 h-7 mr-4 text-blue-600" />
                      Application Details
                    </CardTitle>
                    <CardDescription className="text-base text-foreground mt-2">
                      Select the type of visa application and provide basic service information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {/* Application Type Selection */}
                    <div className="space-y-6">
                      <Label className="text-lg font-semibold text-foreground">Application Type *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {VISA_TYPES.map((type) => {
                          const Icon = type.icon
                          return (
                            <motion.div
                              key={type.value}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                                formData.applicationType === type.value
                                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                                  : 'border-border bg-background hover:border-border hover:shadow-md'
                              }`}
                              onClick={() => handleInputChange('applicationType', type.value)}
                            >
                              <div className="text-center">
                                <Icon className={`w-10 h-10 mx-auto mb-3 ${type.color}`} />
                                <p className="text-sm font-semibold text-foreground">{type.label}</p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                      {errors.applicationType && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-600 text-sm flex items-center font-medium"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {errors.applicationType}
                        </motion.p>
                      )}
                    </div>

                    {/* Service Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="serviceId" className="text-lg font-semibold text-foreground">
                          Service ID *
                        </Label>
                        <Input
                          id="serviceId"
                          placeholder="e.g., family-visa-spouse"
                          value={formData.serviceId}
                          onChange={(e) => handleInputChange('serviceId', e.target.value)}
                          className="mt-3 h-12 text-base border-2 border-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl"
                        />
                        {errors.serviceId && (
                          <p className="text-red-600 text-sm mt-2 font-medium">{errors.serviceId}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="serviceName" className="text-lg font-semibold text-foreground">
                          Service Name
                        </Label>
                        <Input
                          id="serviceName"
                          placeholder="e.g., Spouse Family Visa"
                          value={formData.serviceName}
                          onChange={(e) => handleInputChange('serviceName', e.target.value)}
                          className="mt-3 h-12 text-base border-2 border-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Sponsored Person */}
            {currentStep === 2 && (
              <motion.div variants={cardVariants}>
                <Card className="shadow-xl border-0 bg-background">
                  <CardHeader className="bg-green-50 border-b border-green-100">
                    <CardTitle className="flex items-center text-2xl font-bold text-foreground">
                      <User className="w-7 h-7 mr-4 text-green-600" />
                      Sponsored Person Information
                    </CardTitle>
                    <CardDescription className="text-base text-foreground mt-2">
                      Provide details about the person you are sponsoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="sponsoredFirstName" className="text-lg font-semibold text-foreground">
                          First Name *
                        </Label>
                        <Input
                          id="sponsoredFirstName"
                          placeholder="Enter first name"
                          value={formData.sponsored.firstName}
                          onChange={(e) => handleInputChange('sponsored', e.target.value, 'firstName')}
                          className="mt-3 h-12 text-base border-2 border-border focus:border-green-600 focus:ring-2 focus:ring-green-100 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sponsoredLastName" className="text-lg font-semibold text-foreground">
                          Last Name *
                        </Label>
                        <Input
                          id="sponsoredLastName"
                          placeholder="Enter last name"
                          value={formData.sponsored.lastName}
                          onChange={(e) => handleInputChange('sponsored', e.target.value, 'lastName')}
                          className="mt-3 h-12 text-base border-2 border-border focus:border-green-600 focus:ring-2 focus:ring-green-100 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="sponsoredEmail" className="text-lg font-semibold text-foreground">
                          Email Address *
                        </Label>
                        <Input
                          id="sponsoredEmail"
                          type="email"
                          placeholder="Enter email address"
                          value={formData.sponsored.email}
                          onChange={(e) => handleInputChange('sponsored', e.target.value, 'email')}
                          className="mt-3 h-12 text-base border-2 border-border focus:border-green-600 focus:ring-2 focus:ring-green-100 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sponsoredPhone" className="text-lg font-semibold text-foreground">
                          Phone Number *
                        </Label>
                        <Input
                          id="sponsoredPhone"
                          placeholder="+971 50 123 4567"
                          value={formData.sponsored.phoneNumber}
                          onChange={(e) => handleInputChange('sponsored', e.target.value, 'phoneNumber')}
                          className="mt-3 h-12 text-base border-2 border-border focus:border-green-600 focus:ring-2 focus:ring-green-100 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="sponsoredNationality" className="text-lg font-semibold text-foreground">
                          Nationality
                        </Label>
                        <Select
                          value={formData.sponsored.nationality}
                          onValueChange={(value) => handleInputChange('sponsored', value, 'nationality')}
                        >
                          <SelectTrigger className="mt-3 h-12 text-base border-2 border-border focus:border-green-600 focus:ring-2 focus:ring-green-100 rounded-xl">
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            {NATIONALITIES.map((nationality) => (
                              <SelectItem key={nationality} value={nationality}>
                                {nationality}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="sponsoredRelationship" className="text-lg font-semibold text-foreground">
                          Relationship
                        </Label>
                        <Select
                          value={formData.sponsored.relationship}
                          onValueChange={(value) => handleInputChange('sponsored', value, 'relationship')}
                        >
                          <SelectTrigger className="mt-3 h-12 text-base border-2 border-border focus:border-green-600 focus:ring-2 focus:ring-green-100 rounded-xl">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIPS.map((relationship) => (
                              <SelectItem key={relationship} value={relationship}>
                                {relationship}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="sponsoredPassport" className="text-lg font-semibold text-foreground">
                          Passport Number
                        </Label>
                        <Input
                          id="sponsoredPassport"
                          placeholder="Enter passport number"
                          value={formData.sponsored.passportNumber}
                          onChange={(e) => handleInputChange('sponsored', e.target.value, 'passportNumber')}
                          className="mt-3 h-12 text-base border-2 border-border focus:border-green-600 focus:ring-2 focus:ring-green-100 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sponsoredDOB" className="text-lg font-semibold text-foreground">
                          Date of Birth
                        </Label>
                        <Input
                          id="sponsoredDOB"
                          type="date"
                          value={formData.sponsored.dateOfBirth}
                          onChange={(e) => handleInputChange('sponsored', e.target.value, 'dateOfBirth')}
                          className="mt-3 h-12 text-base border-2 border-border focus:border-green-600 focus:ring-2 focus:ring-green-100 rounded-xl"
                        />
                      </div>
                    </div>

                    {errors.sponsored && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Alert className="border-red-200 bg-red-50">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <AlertDescription className="text-red-800 font-medium">
                            {errors.sponsored}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Personal & Sponsor Information */}
            {currentStep === 3 && (
              <motion.div variants={cardVariants}>
                <Card className="shadow-xl border-0 bg-background">
                  <CardHeader className="bg-purple-50 border-b border-purple-100">
                    <CardTitle className="flex items-center text-2xl font-bold text-foreground">
                      <Building2 className="w-7 h-7 mr-4 text-purple-600" />
                      Personal & Sponsor Information
                    </CardTitle>
                    <CardDescription className="text-base text-foreground mt-2">
                      Provide your personal details and sponsor information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger 
                          value="personal" 
                          className="data-[state=active]:bg-background data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg font-semibold"
                        >
                          Personal Info
                        </TabsTrigger>
                        <TabsTrigger 
                          value="sponsor" 
                          className="data-[state=active]:bg-background data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg font-semibold"
                        >
                          Sponsor Info
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="personal" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="personalNationality" className="text-lg font-semibold text-foreground">
                              Nationality *
                            </Label>
                            <Select
                              value={formData.metadata.personalInfo.nationality}
                              onValueChange={(value) => handlePersonalInfoChange('nationality', value)}
                            >
                              <SelectTrigger className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl">
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                              <SelectContent>
                                {NATIONALITIES.map((nationality) => (
                                  <SelectItem key={nationality} value={nationality}>
                                    {nationality}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="emiratesId" className="text-lg font-semibold text-foreground">
                              Emirates ID *
                            </Label>
                            <Input
                              id="emiratesId"
                              placeholder="784-1990-1234567-8"
                              value={formData.metadata.personalInfo.emiratesId}
                              onChange={(e) => handlePersonalInfoChange('emiratesId', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="currentVisa" className="text-lg font-semibold text-foreground">
                              Current Visa Status
                            </Label>
                            <Input
                              id="currentVisa"
                              placeholder="e.g., Residence Visa, Visit Visa"
                              value={formData.metadata.personalInfo.currentVisa}
                              onChange={(e) => handlePersonalInfoChange('currentVisa', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="accommodation" className="text-lg font-semibold text-foreground">
                              Accommodation Type
                            </Label>
                            <Input
                              id="accommodation"
                              placeholder="e.g., Own Property, Rental"
                              value={formData.metadata.personalInfo.accommodation}
                              onChange={(e) => handlePersonalInfoChange('accommodation', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="sponsor" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="personalNationality" className="text-lg font-semibold text-foreground">
                              Nationality *
                            </Label>
                            <Select
                              value={formData.metadata.sponsorInfo.nationality}
                              onValueChange={(value) => handleSponsorInfoChange('nationality', value)}
                            >
                              <SelectTrigger className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl">
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                              <SelectContent>
                                {NATIONALITIES.map((nationality) => (
                                  <SelectItem key={nationality} value={nationality}>
                                    {nationality}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="emiratesId" className="text-lg font-semibold text-foreground">
                              Emirates ID
                            </Label>
                            <Input
                              id="emiratesId"
                              placeholder="Enter emirates id"
                              value={formData.metadata.sponsorInfo.emiratesId}
                              onChange={(e) => handleSponsorInfoChange('emiratesId', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="firstName" className="text-lg font-semibold text-foreground">
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              placeholder="Enter first name"
                              value={formData.metadata.sponsorInfo.firstName}
                              onChange={(e) => handleSponsorInfoChange('firstName', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="text-lg font-semibold text-foreground">
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              placeholder="Enter last name"
                              value={formData.metadata.sponsorInfo.lastName}
                              onChange={(e) => handleSponsorInfoChange('lastName', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-lg font-semibold text-foreground">
                              Email
                            </Label>
                            <Input
                              id="email"
                              placeholder="Enter email"
                              value={formData.metadata.sponsorInfo.email}
                              onChange={(e) => handleSponsorInfoChange('email', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phoneNumber" className="text-lg font-semibold text-foreground">
                              Phone Number
                            </Label>
                            <Input
                              id="phoneNumber"
                              placeholder="Enter phone number"
                              value={formData.metadata.sponsorInfo.phoneNumber}
                              onChange={(e) => handleSponsorInfoChange('phoneNumber', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="salary" className="text-lg font-semibold text-foreground">
                              Monthly Salary
                            </Label>
                            <Input
                              id="salary"
                              placeholder="e.g., AED 15,000"
                              value={formData.metadata.sponsorInfo.salary}
                              onChange={(e) => handleSponsorInfoChange('salary', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                      
                          <div>
                            <Label htmlFor="company" className="text-lg font-semibold text-foreground">
                              Company Name
                            </Label>
                            <Input
                              id="company"
                              placeholder="Enter company name"
                              value={formData.metadata.sponsorInfo.company}
                              onChange={(e) => handleSponsorInfoChange('company', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="tradeLicense" className="text-lg font-semibold text-foreground">
                              Trade License Number
                            </Label>
                            <Input
                              id="tradeLicense"
                              placeholder="Enter trade license number"
                              value={formData.metadata.sponsorInfo.tradeLicense}
                              onChange={(e) => handleSponsorInfoChange('tradeLicense', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="establishmentCard" className="text-lg font-semibold text-foreground">
                              Establishment Card
                            </Label>
                            <Input
                              id="establishmentCard"
                              placeholder="Enter establishment card number"
                              value={formData.metadata.sponsorInfo.establishmentCard}
                              onChange={(e) => handleSponsorInfoChange('establishmentCard', e.target.value)}
                              className="mt-3 h-12 text-base border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div>
                      <Label htmlFor="additionalNotes" className="text-lg font-semibold text-foreground">
                        Additional Notes
                      </Label>
                      <Textarea
                        id="additionalNotes"
                        placeholder="Any additional information or special requirements..."
                        value={formData.metadata.additionalNotes}
                        onChange={(e) => handleInputChange('metadata', e.target.value, 'additionalNotes')}
                        className="mt-3 border-2 border-border focus:border-purple-600 focus:ring-2 focus:ring-purple-100 rounded-xl text-base p-4"
                        rows={4}
                      />
                    </div>

                    {errors.metadata && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Alert className="border-red-200 bg-red-50">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <AlertDescription className="text-red-800 font-medium">
                            {errors.metadata}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <motion.div variants={cardVariants}>
                <Card className="shadow-xl border-0 bg-background">
                  <CardHeader className="bg-orange-50 border-b border-orange-100">
                    <CardTitle className="flex items-center text-2xl font-bold text-foreground">
                      <Upload className="w-7 h-7 mr-4 text-orange-600" />
                      Document Upload
                    </CardTitle>
                    <CardDescription className="text-base text-foreground mt-2">
                      Upload required documents for your visa application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <EnhancedAIDocumentUploader
                      serviceName={formData.serviceName || 'Visa Application'}
                      serviceType={formData.applicationType}
                      onUploadComplete={handleUploadComplete}
                      onDocumentsReady={handleDocumentsReady}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className="flex items-center h-12 px-8 text-base font-semibold border-2 border-border hover:border-border hover:bg-slate-50 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-4">
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNextStep}
                className="flex items-center h-12 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting }
                className="flex items-center h-12 px-8 text-base font-semibold bg-green-600 hover:bg-green-700 rounded-xl shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Save Draft Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Button
            variant="ghost"
            onClick={() => toast.info('Draft saved automatically as you type')}
            className="text-text-secondary hover:text-foreground h-12 px-6 text-base font-medium"
          >
            <Save className="w-5 h-5 mr-2" />
            Save as Draft
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default VisaApplicationForm
