import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, Building, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import QualificationAgreements from '@/pages/Onboarding/QualificationAgreement';
import { Layout } from '@/layout/Layout';
import QualificationStartStep from '@/pages/Onboarding/QualificationStartStep';
import { countries } from '@/lib/utils';
const QualificationStart = () => {
  const navigate = useNavigate();
  const [investorType, setInvestorType] = useState<'individual' | 'institution' | ''>('');
  const [countryOfResidence, setCountryOfResidence] = useState('');
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [acceptedAgreements, setAcceptedAgreements] = useState(false);

  
  const [startQualification,setStartQualification] = useState(false);

  const handleProceed = () => {
    if (investorType && countryOfResidence && acceptedDisclaimer && acceptedAgreements) {
      // navigate('/qualification/kyc', {
      //   state: { investorType, countryOfResidence }
      // });

      setStartQualification(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="mx-auto">
        {!startQualification ? (
        <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Investor Qualification</h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Complete your investor qualification to access premium security token offerings
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Verify Your Identity
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              {/* Investor Type Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-foreground">
                  Select Investor Type *
                </Label>
                <RadioGroup
                  value={investorType}
                  onValueChange={(value) => setInvestorType(value as 'individual' | 'institution')}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center space-x-3 p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      investorType === 'individual' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-border hover:border-border'
                    }`}
                  >
                    <RadioGroupItem value="individual" id="individual" />
                    <div className="flex items-center space-x-3">
                      <User className="h-6 w-6 text-blue-600" />
                      <div>
                        <Label htmlFor="individual" className="text-base font-medium cursor-pointer">
                          Individual
                        </Label>
                        <p className="text-sm text-text-secondary">Personal investment account</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center space-x-3 p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      investorType === 'institution' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-border hover:border-border'
                    }`}
                  >
                    <RadioGroupItem value="institution" id="institution" />
                    <div className="flex items-center space-x-3">
                      <Building className="h-6 w-6 text-blue-600" />
                      <div>
                        <Label htmlFor="institution" className="text-base font-medium cursor-pointer">
                          Institution
                        </Label>
                        <p className="text-sm text-text-secondary">Corporate or institutional account</p>
                      </div>
                    </div>
                  </motion.div>
                </RadioGroup>
              </div>

              {/* Country of Residence */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Country of Residence *
                </Label>
                <Select value={countryOfResidence} onValueChange={setCountryOfResidence}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select your country of residence" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country.toLowerCase().replace(/\s+/g, '-')}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disclaimer */}
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-2">
                    <p className="font-semibold">Important Disclaimer:</p>
                    <ul className="text-sm space-y-1 ml-4 list-disc">
                      <li>Security tokens are subject to regulatory restrictions</li>
                      <li>Investment involves risk of loss of capital</li>
                      <li>Past performance does not guarantee future results</li>
                      <li>You must be an accredited investor in certain jurisdictions</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="disclaimer"
                    checked={acceptedDisclaimer}
                    onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-border rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="disclaimer" className="text-sm text-foreground cursor-pointer">
                    I acknowledge that I have read and understood the disclaimer above and accept the risks associated with investing in security tokens.
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreements"
                    checked={acceptedAgreements}
                    onChange={(e) => setAcceptedAgreements(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-border rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="agreements" className="text-sm text-foreground cursor-pointer">
                    I agree to the Terms of Service, Privacy Policy, and any additional issuer-specific agreements that may apply to my investment.
                  </Label>
                </div>
              </div>

              {/* Third-party Verification Notice */}
              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <p className="font-semibold mb-2">Third-Party Verification Required</p>
                  <p className="text-sm">
                    For regulatory compliance, all investors must complete identity verification through our trusted third-party verification partner. This ensures the highest security standards and regulatory compliance.
                  </p>
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleProceed}
                disabled={!investorType || !countryOfResidence || !acceptedDisclaimer || !acceptedAgreements}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg"
              >
                Proceed to Identity Verification
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        </div>
        ) : (
            <QualificationStartStep />
        )}

      </div>
    </div>
  );
};

export default QualificationStart;