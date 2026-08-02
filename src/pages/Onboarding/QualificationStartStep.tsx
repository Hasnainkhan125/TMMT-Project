import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/layout/Layout';
import { Button } from '@/components/ui/button';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { InvestorTypeSelector } from '@/components/Onboarding/InvestorTypeSelector';
import { CountrySelector } from '@/components/Onboarding/CountrySelector';
import { Checkbox } from '@/components/ui/checkbox';
import { PersonalInfoForm } from '@/components/Onboarding/PersonalInfoForm';
import { Card } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, Plus, Copy, ExternalLink, Wallet, Eye, Download, X } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import TokenizationForm from '@/components/TokenCard/TokenizationForm';
import { useAccount } from 'wagmi';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Uploader from '@/components/ui/uploader';
import QualificationDocuments from './QualificationDocuments';
import axios from 'axios';



interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  documentType: string;
}



const QualificationStartStep = () => {
  const navigate = useNavigate();
  const { open } = useAppKit();
  const { address } = useAccount();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [investorType, setInvestorType] = useState('individual');
  const [country, setCountry] = useState('');
  const [agreements, setAgreements] = useState({
    agreement1: false,
    agreement2: false,
    agreement3: false,
  });
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: 'Novacek',
    nationality: '',
    birthPlace: '',
    idExpiration: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '32523',
    sourceOfWealth: 'employment',
    sourceOfFunds: 'property-sale',
    taxId: '03297023975039',
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const [walletAccounts, setWalletAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountAddress, setNewAccountAddress] = useState('');
  const [showAccountList, setShowAccountList] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getSteps = () => [
    { 
      title: 'Investor Type & Country', 
      completed: completedSteps.includes(0), 
      current: currentStep === 0,
    },
    { 
      title: 'Agreements', 
      completed: completedSteps.includes(1), 
      current: currentStep === 1,
    },
    { 
      title: 'Personal Information', 
      completed: completedSteps.includes(2), 
      current: currentStep === 2,
    },
    { 
      title: 'Wallet Connection', 
      completed: completedSteps.includes(3), 
      current: currentStep === 3,
    },
    { 
      title: 'Document Upload', 
      completed: completedSteps.includes(4), 
      current: currentStep === 4,
    },
    { 
      title: 'Complete', 
      completed: completedSteps.includes(5), 
      current: currentStep === 5,
    },
  ];


  const requiredDocuments = [
    {
      id: 'identity',
      name: 'Identity Document (Passport or ID Card)',
      description: 'Required',
      acceptedTypes: [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    {
      id: 'address',
      name: 'Proof of Address',
      description: 'Required',
      acceptedTypes: [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    {
      id: 'bank',
      name: 'Bank Statement',
      description: 'Required',
      acceptedTypes: [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    {
      id: 'funds',
      name: 'Source of Funds Documentation',
      description: 'Required',
      acceptedTypes: [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStepClick = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex) || stepIndex === currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }else{
      handleSubmitKYC();
    }
  };

  const handleSubmitKYC = async () => {
    console.log('submit kyc');

    try{
      const response = await axios.post('http://localhost:3000/api/kyc', {
        investorType,
        country,
        agreements,
        personalData,
        walletAccounts,
        uploadedFiles,
      });
    }catch(error){
      console.error(error);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAgreementChange = (key: string, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: checked }));
  };

  const handlePersonalDataChange = (data: Partial<typeof personalData>) => {
    setPersonalData(prev => ({ ...prev, ...data }));
  };

  const handleWalletConnect = () => {
    open({
      view: 'Account',
    });
    setWalletConnected(true);
  };

  const handleFileUpload = (docType: string) => {
    if (!uploadedDocs.includes(docType)) {
      setUploadedDocs(prev => [...prev, docType]);
    }
  };
  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      URL.revokeObjectURL(file.url); 
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      setUploadedDocs((prev:any)=>prev.filter((doc:any)=>doc !== file?.documentType));
      toast.success('File removed');
    }
  };

  const previewFile = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      window.open(file.url, '_blank');
    } else {
      window.open(file.url, '_blank');
    }
  };

  const downloadFile = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    }
    return '📎';
  };
  const validateFile = (
    file: File,
    documentType: string
  ): { valid: boolean; error?: string } => {
    const doc = requiredDocuments.find(d => d.id === documentType);
    if (!doc) return { valid: false, error: 'Invalid document type' };

    if (file.size > doc.maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${formatFileSize(doc.maxSize)}`,
      };
    }

    if (!doc.acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported. Accepted types: ${doc.acceptedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    const documentType = event.target.getAttribute('data-document-type');

    if (!file || !documentType) return;
    console.log(file, event.target.getAttribute('data-document-type'));

    const validation = validateFile(file, documentType);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const existingFile = uploadedFiles.find(
      f => f.documentType === documentType
    );
    if (existingFile) {
      toast.error(
        'A file for this document type already exists. Please remove it first.'
      );
      return;
    }

    setUploading(documentType);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const fileUrl = URL.createObjectURL(file);

      const uploadedFile: UploadedFile = {
        id: `${documentType}-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        uploadedAt: new Date(),
        documentType,
      };
      
      const totalUploaded = uploadedFiles.length + 1;
      setUploadedFiles(prev => [...prev, uploadedFile]);
      setUploadedDocs((prev:any)=>[...prev, uploadedFile?.documentType]);
      // setCurrentStep(totalUploaded);
      
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploading(null);
    }

    // Reset input
    event.target.value = '';
  };

  const handleComplete = () => {
    navigate('/qualification/kyc-status');
  };

  // Wallet account management functions
  const addCurrentAccount = () => {
    if (address && !walletAccounts.includes(address)) {
      setWalletAccounts(prev => [...prev, address]);
      setSelectedAccount(address);
      setWalletConnected(true);
      toast.success('Current wallet account added to list');
    }
  };

  const addManualAccount = () => {
    if (newAccountAddress && !walletAccounts.includes(newAccountAddress)) {
      setWalletAccounts(prev => [...prev, newAccountAddress]);
      setSelectedAccount(newAccountAddress);
      setNewAccountAddress('');
      setShowAddAccount(false);
      setWalletConnected(true);
      toast.success('Manual account added to list');
    } else if (walletAccounts.includes(newAccountAddress)) {
      toast.error('Account already exists in list');
    }
  };

  const selectAccount = (account: string) => {
    setSelectedAccount(account);
    setWalletConnected(true);
    toast.success('Account selected');
  };

  const removeAccount = (account: string) => {
    setWalletAccounts(prev => prev.filter(acc => acc !== account));
    if (selectedAccount === account) {
      setSelectedAccount('');
      setWalletConnected(false);
    }
    toast.success('Account removed from list');
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const validateAddress = (address: string) => {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Investor Type & Country
        return investorType && country;
      case 1: // Agreements
        return Object.values(agreements).every(Boolean);
      case 2: // Personal Information
        return (
          personalData.firstName &&
          personalData.lastName &&
          personalData.nationality
        );
      case 3: // Wallet Connection
        return walletConnected && selectedAccount;
      case 4: // Document Upload
        return uploadedDocs.length >= requiredDocuments.length;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                Next, select your investor type: 'Individual' or 'Institution.'
                For this demo, we will proceed as 'Individual.'
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">19 of 51</span>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    ←
                  </Button>
                  <Button variant="secondary" size="sm">
                    →
                  </Button>
                </div>
              </div>
            </div>

            <InvestorTypeSelector
              value={investorType}
              onChange={setInvestorType}
            />

            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                Next, select your country of residency from the dropdown list.
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">20 of 51</span>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    ←
                  </Button>
                  <Button variant="secondary" size="sm">
                    →
                  </Button>
                </div>
              </div>
            </div>

            <CountrySelector value={country} onChange={setCountry} />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                If the Issuer has configured any mandatory Agreement points,
                they will be displayed here. Please review them.
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">23 of 51</span>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    ←
                  </Button>
                  <Button variant="secondary" size="sm">
                    →
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-6 text-foreground">
                To begin, please review and accept the outlined agreements.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-3 rounded-lg border border-purple-300 bg-purple-50 p-4">
                  <Checkbox
                    id="agreement1"
                    checked={agreements.agreement1}
                    onCheckedChange={checked =>
                      handleAgreementChange('agreement1', checked as boolean)
                    }
                  />
                  <div className="text-sm">
                    <p className="mb-2 font-medium">
                      Example agreement with bulleted list: I hereby confirm
                      that the following information is exact and consent to
                      receiving the KID without undue delay after subscribing to
                      the Offering:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-text-secondary">
                      <li>
                        I confirm that I subscribed to the Class A Notes using a
                        means of distance communication;
                      </li>
                      <li>
                        I acknowledge that it is not possible on the date of my
                        subscription to the Class A Notes;
                      </li>
                      <li>
                        I am aware of my right to withdraw from my subscription
                        to the Class A Notes and that I may delay the
                        subscription to the Class A Notes in order to receive
                        and review the key information document in relation to
                        the Class A Notes.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border border-purple-300 bg-purple-50 p-4">
                  <Checkbox
                    id="agreement2"
                    checked={agreements.agreement2}
                    onCheckedChange={checked =>
                      handleAgreementChange('agreement2', checked as boolean)
                    }
                  />
                  <div className="text-sm">
                    <p>
                      Example agreement for simple aspects: I hereby confirm
                      that I have communicated on this website/platform is true,
                      complete and accurate in all aspects.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border border-purple-300 bg-purple-50 p-4">
                  <Checkbox
                    id="agreement3"
                    checked={agreements.agreement3}
                    onCheckedChange={checked =>
                      handleAgreementChange('agreement3', checked as boolean)
                    }
                  />
                  <div className="text-sm">
                    <p>
                      Example agreement with the link: I have read, understood,
                      and fully and irrevocably acknowledge and accept the{' '}
                      <a href="#" className="text-blue-600 underline">
                        Terms and Conditions of the Security Tokens
                      </a>
                    </p>
                    <p className="mt-1 text-text-secondary">
                      Terms and Conditions of the Security Tokens
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                Complete the 'Main information' section by providing your
                investor profile and investment-related information. Please note
                that the Issuer may require additional information beyond what
                is currently displayed here.
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">27 of 51</span>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    ←
                  </Button>
                  <Button variant="secondary" size="sm">
                    →
                  </Button>
                </div>
              </div>
            </div>

            <PersonalInfoForm
              data={personalData}
              onChange={handlePersonalDataChange}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                Connect your wallet to proceed with the qualification process.
                This will be used for your ONCHAINID deployment.
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">35 of 51</span>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    ←
                  </Button>
                  <Button variant="secondary" size="sm">
                    →
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Current Wallet Status */}
              {address && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-6 w-6 text-green-500" />
                      <div>
                        <h3 className="font-medium text-foreground">Current Wallet</h3>
                        <p className="text-sm text-text-secondary">{address}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyAddress(address)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={addCurrentAccount}
                        disabled={walletAccounts.includes(address)}
                        size="sm"
                      >
                        {walletAccounts.includes(address) ? 'Added' : 'Add to List'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Account Management */}
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-foreground">Wallet Accounts</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAccountList(!showAccountList)}
                    >
                      {showAccountList ? 'Hide' : 'Show'} Accounts ({walletAccounts.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddAccount(!showAddAccount)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manual
                    </Button>
                  </div>
                </div>
                </Card>

                {/* Manual Account Addition */}
                {showAddAccount && (
                  <div className="mb-4 rounded-lg border border-border bg-surface-light p-4">
                    <h4 className="mb-2 font-medium text-foreground">Add Manual Account</h4>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter wallet address (0x...)"
                        value={newAccountAddress}
                        onChange={(e) => setNewAccountAddress(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={addManualAccount}
                        disabled={!validateAddress(newAccountAddress)}
                        size="sm"
                      >
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddAccount(false);
                          setNewAccountAddress('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {newAccountAddress && !validateAddress(newAccountAddress) && (
                      <p className="mt-1 text-sm text-red-600">
                        Please enter a valid Ethereum address
                      </p>
                    )}
                  </div>
                )}

                {/* Account List */}
                {showAccountList && (
                  <div className="space-y-3">
                    {!address || walletAccounts.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        No accounts added yet. Connect a wallet or add manually.
                      </p>
                    ) : (
                      walletAccounts.map((account, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between rounded-lg border p-3 ${
                            selectedAccount === account
                              ? 'border-green-500 bg-green-50'
                              : 'border-border bg-background'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                              <span className="text-xs font-medium">
                                {account.slice(2, 6).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {account.slice(0, 6)}...{account.slice(-4)}
                              </p>
                              <p className="text-xs text-gray-500">{account}</p>
                            </div>
                            {selectedAccount === account && (
                              <Badge className="bg-green-100 text-green-800">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyAddress(account)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            {selectedAccount !== account && (
                              <Button
                                onClick={() => selectAccount(account)}
                                size="sm"
                              >
                                Select
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAccount(account)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Selected Account Display */}
                {selectedAccount && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-green-900">Selected Account</h4>
                        <p className="text-sm text-green-700">{selectedAccount}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Ready to Proceed
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Connect Wallet Button */}
                {!address && (
                  <div className="mt-4 text-center">
                    <p className="mb-4 text-text-secondary">
                      Connect your wallet to add accounts automatically
                    </p>
                    <Button onClick={()=>open()} size="lg">
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </div>
            </div>
       
        );

      case 4:
        return (
          // <QualificationDocuments handleFileUpload={handleFileUpload} setUploadedDocs={setUploadedDocs} setCurrentStep={setCurrentStep} uploadedFiles={uploadedFiles}/>
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                These are the documents specified by the Issuer as mandatory for
                your investor qualification process. Please proceed to upload
                the required documents.
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">43 of 51</span>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    ←
                  </Button>
                  <Button variant="secondary" size="sm">
                    →
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Required Documents
              </h3>
              <p className="text-text-secondary">
                Please upload the following documents to complete your
                qualification:
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                {requiredDocuments.map((doc, index) => {
                   const uploadedFile = uploadedFiles.find(
                    f => f.documentType === doc.id
                  );
                  const isUploading = uploading === doc.id;
                  console.log(uploadedFile)
                  return(
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className=''>

                      <div className="flex  items-center space-x-3">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium">{doc.name}</h4>
                          <p className="text-xs text-gray-500">Required</p>
                        </div>
                      </div>
                      <div className="flex ml-0 mt-2 items-center space-x-2">
                        {uploadedFile ? (

                          <div>
                            {uploadedFile && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <span className="text-sm text-gray-500">
                                  {getFileIcon(uploadedFile.type)} {uploadedFile.name.slice(0, 10)}...
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className='flex items-center gap-2'>
                          <div className="space-y-2 text-sm">
                          <Input className='hidden' id="file" type="file" placeholder="File"  onChange={(e) => handleFileUpload(e.target.files?.[0] as any ?? null)} />
                        </div>
                       
                          </div>
                        )}
                      </div>
                      </div>



                      <div className="flex items-center space-x-2">
										{uploadedFile ? (
											<>
												<Button
													variant="outline"
													size="sm"
													onClick={() => previewFile(uploadedFile)}
												>
													<Eye className="mr-1 h-4 w-4" />
													Preview
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => downloadFile(uploadedFile)}
												>
													<Download className="mr-1 h-4 w-4" />
													Download
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => removeFile(uploadedFile.id)}
													className="text-red-600 hover:text-red-700"
												>
													<X className="mr-1 h-4 w-4" />
													Remove
												</Button>
											</>
										) : (
											<div className="flex items-center gap-2">

												{isUploading ? (
													<>
														<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-border border-t-blue-600" />
														Uploading...
													</>
												) : (
													<>

                          <div  className='flex items-center gap-2 border border-border rounded-md p-2 bg-slate-100 cursor-pointer'>

													<input
												  // ref={fileInputRef}
													type="file"
													id="file"
													data-document-type={doc.id}
													className=""
													onChange={handleFileSelect} 
                          
													accept=".jpg,.jpeg,.png,.pdf"
													/>

														<Upload  className="mr-2 h-4 w-4 " />
														<span className='text-sm'>Upload</span>
                          </div>

													</>
												)}

											</div>
										)}
									</div>

                    </div>
                  </Card>
                )})}
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> At this stage, the Issuer can choose to
                proceed without activation or opt to activate one of the
                integrated third-party KYC solutions.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                Application Submitted Successfully!
              </h1>
              <p className="text-text-secondary">
                You submitted your Investor profile for review. Great job! The
                Issuer will now initiate their KYC/AML verification process.
              </p>
            </div>

            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h4 className="mb-2 font-medium">
                Congratulations! Your self-managed blockchain-based and reusable
                investment passport, ONCHAINID, has been successfully deployed.
                You are now a qualified investor and can begin investing in the
                Green Brew Token.
              </h4>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">50 of 51</span>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    ←
                  </Button>
                  <Button variant="secondary" size="sm">
                    →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="mx-auto p-8">
        <div className="mb-8">
          <div className="mb-6 flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-sm font-bold text-white">
              GBB
            </div>
            <span className="text-text-secondary">Green Brew Bond</span>
            <span className="text-gray-400">› Qualification</span>
          </div>
          
          <ProgressStepper 
            steps={getSteps()} 
            onStepClick={handleStepClick}
            allowStepNavigation={true}
          />
        </div>

        <div className="rounded-lg border border-border bg-background p-8">
          {renderStepContent()}

          <div className="mt-8 flex justify-between">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {currentStep < 5 ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="px-8"
              >
                {currentStep === 4 ? 'Complete Application' : 'Continue'}
              </Button>
            ) : (
              <Button onClick={handleComplete} className="px-8">
                Return to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QualificationStartStep;
