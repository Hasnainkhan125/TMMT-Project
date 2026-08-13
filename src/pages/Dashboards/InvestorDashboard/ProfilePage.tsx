"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { Switch } from "../../../components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { User, Mail, Phone, Shield, Bell, Eye, EyeOff, Save, RefreshCw, Camera, CheckCircle, Settings, Lock, Upload, FileText, CreditCard, Plus, Trash2, Calendar } from 'lucide-react'
import { toast } from "sonner"
import { Layout } from "./Layout"
import { useAuth } from "@/contexts/AuthContext"

interface PersonalDocument {
  id: string
  type: string
  name: string
  uploadedAt: string
  expiresAt?: string
  status: 'valid' | 'expiring' | 'expired'
}

const ProfilePage = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    country: "",
    company: "",
  })

  const [personalDocuments, setPersonalDocuments] = useState<PersonalDocument[]>([])

  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  })

  useEffect(() => {
    loadUserProfile()
  }, [user])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      if (!userId) return
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phoneNumber || '',
          avatar: data.profilePicture?.path || '',
          country: data.country || '',
          company: data.company || '',
        })
        
        if (data.documents && Array.isArray(data.documents)) {
          setPersonalDocuments(data.documents.map((doc: any) => ({
            id: doc._id,
            type: doc.type,
            name: doc.path.split('/').pop() || doc.type,
            uploadedAt: doc.uploadDate,
            expiresAt: doc.expiryDate,
            status: doc.status || 'valid'
          })))
        }

        if (data.compliance?.notificationPreferences) {
          setNotifications({
            email: data.compliance.notificationPreferences.email ?? true,
            sms: data.compliance.notificationPreferences.sms ?? false,
            push: data.compliance.notificationPreferences.push ?? true,
            marketing: false,
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phoneNumber: profileData.phone,
          country: profileData.country,
          company: profileData.company,
        })
      })
      
      if (response.ok) {
        setIsEditing(false)
        toast.success("Profile updated successfully")
        loadUserProfile()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadDocument = (type: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.jpg,.jpeg,.png'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      
      try {
        const token = localStorage.getItem('authToken')
        const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
        
        const formData = new FormData()
        formData.append('document', file)
        formData.append('type', type)
        
        const response = await fetch(`${apiBase}/api/v1/user/${userId}/documents/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        
        if (response.ok) {
          toast.success(`${type} uploaded successfully`)
          loadUserProfile()
        } else {
          toast.error('Failed to upload document')
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload document')
      }
    }
    input.click()
  }

  const handleAddPaymentMethod = () => {
    toast.info('Opening payment method dialog...')
    // In real app, open payment method dialog
  }

  const getDocumentStatus = (doc: PersonalDocument) => {
    if (!doc.expiresAt) return { label: 'No expiry', color: 'bg-gray-100 text-gray-800' }
    const daysUntilExpiry = Math.ceil((new Date(doc.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'bg-red-100 text-red-800' }
    if (daysUntilExpiry < 60) return { label: `Expires in ${daysUntilExpiry} days`, color: 'bg-orange-100 text-orange-800' }
    return { label: 'Valid', color: 'bg-green-100 text-green-800' }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 m-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and personal documents</p>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.avatar} alt="Profile" />
                  <AvatarFallback className="text-lg bg-primary text-black">
                    {profileData.firstName.charAt(0)}
                    {profileData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                    onClick={() => toast.info('Opening image picker...')}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.country}
                      onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Documents</CardTitle>
                <CardDescription>Manage your identity and official documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Document Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Emirates ID', 'Passport', 'Residence Visa', 'Driving License', 'Bank Statement', 'Salary Certificate'].map((docType) => {
                      const doc = personalDocuments.find(d => d.type === docType)
                      const status = doc ? getDocumentStatus(doc) : null

                      return (
                        <Card key={docType} className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-primary" />
                                <div>
                                  <p className="font-medium">{docType}</p>
                                  {doc ? (
                                    <>
                                      <p className="text-xs text-text-secondary">{doc.name}</p>
                                      {status && (
                                        <Badge className={`${status.color} text-xs mt-1`}>
                                          {status.label}
                                        </Badge>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-xs text-text-secondary">Not uploaded</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={doc ? "outline" : "default"}
                                onClick={() => handleUploadDocument(docType)}
                              >
                                {doc ? <RefreshCw className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your credit and debit cards</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                    <Button onClick={handleAddPaymentMethod}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Credit/Debit Card
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-6 h-6 text-primary" />
                          <div>
                            <p className="font-medium">{method.cardType} •••• {method.last4}</p>
                            <p className="text-sm text-text-secondary">Expires {method.expiry}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={handleAddPaymentMethod}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Card
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-muted-foreground">No payments yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Change your account password</p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info('Opening password change dialog...')}>
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Sensitive Data</p>
                    <p className="text-sm text-muted-foreground">Toggle visibility of sensitive information</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                  >
                    {showSensitiveData ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Show
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive urgent alerts via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Browser notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Communications</p>
                    <p className="text-sm text-muted-foreground">Updates about features and offers</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}

export default ProfilePage
