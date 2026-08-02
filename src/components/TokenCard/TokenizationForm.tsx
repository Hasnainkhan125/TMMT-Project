import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Coins, Settings, CheckCircle, FileText, Shield } from 'lucide-react';

const TokenizationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    description: '',
    assetType: '',
    initialPrice: '',
    minInvestment: ''
  });
  
  const [complianceData, setComplianceData] = useState({
    countries: [] as string[],
    maxMonthlyTransfer: '',
    maxMint: '',
    kycRequired: true,
    accreditedOnly: false,
    transferRestrictions: [] as string[]
  });

  const totalSteps = 3;
  const steps = [
    { id: 1, title: 'Token Details', icon: Coins },
    { id: 2, title: 'Compliance Setup', icon: Settings },
    { id: 3, title: 'Review & Deploy', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTokenDataChange = (field: string, value: string) => {
    setTokenData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplianceChange = (field: string, value: any) => {
    setComplianceData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCountry = (country: string) => {
    setComplianceData(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  const availableCountries = ['US', 'UK', 'CA', 'DE', 'FR', 'AU', 'JP', 'SG'];
  const transferRestrictions = [
    'No transfers to sanctioned entities',
    'Maximum 5 transfers per month',
    'Minimum holding period: 12 months',
    'Accredited investor verification required'
  ];

  const getIcon = (Icon: any) => {
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tokenize Your Assets</h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Create compliant security tokens for your real-world assets with built-in compliance features
            and regulatory controls.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-gray-200 text-text-secondary'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-4 transition-all duration-200 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
                {getIcon(steps[currentStep - 1].icon)}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tokenName">Token Name *</Label>
                    <Input
                      id="tokenName"
                      placeholder="e.g., Real Estate Token"
                      value={tokenData.name}
                      onChange={(e) => handleTokenDataChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Token Symbol *</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., RET"
                      value={tokenData.symbol}
                      onChange={(e) => handleTokenDataChange('symbol', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalSupply">Total Supply *</Label>
                    <Input
                      id="totalSupply"
                      placeholder="e.g., 1000000"
                      value={tokenData.totalSupply}
                      onChange={(e) => handleTokenDataChange('totalSupply', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assetType">Asset Type *</Label>
                    <Select onValueChange={(value) => handleTokenDataChange('assetType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="equity">Private Equity</SelectItem>
                        <SelectItem value="debt">Debt Securities</SelectItem>
                        <SelectItem value="commodity">Commodities</SelectItem>
                        <SelectItem value="art">Art & Collectibles</SelectItem>
                        <SelectItem value="fund">Investment Fund</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="initialPrice">Initial Price (USD) *</Label>
                    <Input
                      id="initialPrice"
                      placeholder="e.g., 100.00"
                      value={tokenData.initialPrice}
                      onChange={(e) => handleTokenDataChange('initialPrice', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minInvestment">Minimum Investment (USD) *</Label>
                    <Input
                      id="minInvestment"
                      placeholder="e.g., 1000.00"
                      value={tokenData.minInvestment}
                      onChange={(e) => handleTokenDataChange('minInvestment', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Asset Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your asset, investment strategy, and expected returns..."
                    value={tokenData.description}
                    onChange={(e) => handleTokenDataChange('description', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Compliance Requirements</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    These settings ensure your token complies with securities regulations and ERC3643 standards.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Allowed Countries *</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableCountries.map(country => (
                        <div key={country} className="flex items-center space-x-2">
                          <Checkbox
                            id={country}
                            checked={complianceData.countries.includes(country)}
                            onCheckedChange={() => toggleCountry(country)}
                          />
                          <Label htmlFor={country} className="text-sm font-medium">{country}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxMonthlyTransfer">Max Monthly Transfer Limit</Label>
                      <Input
                        id="maxMonthlyTransfer"
                        placeholder="e.g., 100000"
                        value={complianceData.maxMonthlyTransfer}
                        onChange={(e) => handleComplianceChange('maxMonthlyTransfer', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxMint">Max Mint Amount</Label>
                      <Input
                        id="maxMint"
                        placeholder="e.g., 50000"
                        value={complianceData.maxMint}
                        onChange={(e) => handleComplianceChange('maxMint', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Required Verifications</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="kycRequired"
                          checked={complianceData.kycRequired}
                          onCheckedChange={(checked) => handleComplianceChange('kycRequired', checked)}
                        />
                        <Label htmlFor="kycRequired" className="text-sm font-medium">
                          KYC Verification Required
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="accreditedOnly"
                          checked={complianceData.accreditedOnly}
                          onCheckedChange={(checked) => handleComplianceChange('accreditedOnly', checked)}
                        />
                        <Label htmlFor="accreditedOnly" className="text-sm font-medium">
                          Accredited Investors Only
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Transfer Restrictions</Label>
                    <div className="space-y-2">
                      {transferRestrictions.map((restriction, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`restriction-${index}`}
                            checked={complianceData.transferRestrictions.includes(restriction)}
                            onCheckedChange={() => {
                              const newRestrictions = complianceData.transferRestrictions.includes(restriction)
                                ? complianceData.transferRestrictions.filter(r => r !== restriction)
                                : [...complianceData.transferRestrictions, restriction];
                              handleComplianceChange('transferRestrictions', newRestrictions);
                            }}
                          />
                          <Label htmlFor={`restriction-${index}`} className="text-sm">
                            {restriction}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-4">Review Your Token Configuration</h3>
                  <p className="text-text-secondary mb-6">
                    Please review all details before deploying your token to the blockchain.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Coins className="w-5 h-5" />
                        Token Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Name:</span>
                        <span className="font-medium">{tokenData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Symbol:</span>
                        <span className="font-medium">{tokenData.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Total Supply:</span>
                        <span className="font-medium">{tokenData.totalSupply}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Asset Type:</span>
                        <span className="font-medium">{tokenData.assetType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Initial Price:</span>
                        <span className="font-medium">${tokenData.initialPrice}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Compliance Setup
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-text-secondary">Allowed Countries:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {complianceData.countries.map(country => (
                            <Badge key={country} variant="secondary" className="text-xs">
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Max Monthly Transfer:</span>
                        <span className="font-medium">${complianceData.maxMonthlyTransfer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">KYC Required:</span>
                        <Badge variant={complianceData.kycRequired ? "default" : "secondary"}>
                          {complianceData.kycRequired ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Accredited Only:</span>
                        <Badge variant={complianceData.accreditedOnly ? "default" : "secondary"}>
                          {complianceData.accreditedOnly ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Deployment Checklist</h4>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Token contract will be deployed with ERC3643 compliance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Compliance rules will be automatically enforced
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      OnChainID integration will be enabled
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Token will be listed on the marketplace
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
          
          <div className="flex justify-between p-8 pt-0">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={currentStep === totalSteps}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {currentStep === totalSteps ? 'Deploy Token' : 'Next Step'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TokenizationForm;
