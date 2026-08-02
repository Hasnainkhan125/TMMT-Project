import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/layout/Layout';
import { Button } from '@/components/ui/button';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { PersonalInfoForm } from '@/components/Onboarding/PersonalInfoForm';

const QualificationPersonalInfo = () => {
  const navigate = useNavigate();
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
    taxId: '03297023975039'
  });

  const steps = [
    { title: 'Agreements', completed: true, current: false },
    { title: 'Main information', completed: false, current: true },
    { title: 'Wallet address', completed: false, current: false },
    { title: 'Upload documents', completed: false, current: false }
  ];

  const handleDataChange = (data: Partial<typeof personalData>) => {
    setPersonalData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    navigate('/qualification/wallet');
  };

  const handleBack = () => {
    navigate('/qualification/agreements');
  };

  return (
    <Layout>
      <div className="p-8  mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              GBB
            </div>
            <span className="text-text-secondary">Green Brew Bond</span>
            <span className="text-gray-400">› Qualification</span>
          </div>
          
          <ProgressStepper steps={steps} />
        </div>

        <div className="bg-background rounded-lg border border-border p-8">
          <div className="bg-purple-500 text-white p-6 rounded-lg mb-8">
            <h3 className="font-medium mb-2">
              Complete the 'Main information' section by providing your investor profile and investment-related information. Please note that the Issuer may require additional information beyond what is currently displayed here.
            </h3>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm">27 of 51</span>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">←</Button>
                <Button variant="secondary" size="sm">→</Button>
              </div>
            </div>
          </div>

          <PersonalInfoForm data={personalData} onChange={handleDataChange} />

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button onClick={handleNext} className="px-8">
              Next: Wallet address →
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QualificationPersonalInfo;
