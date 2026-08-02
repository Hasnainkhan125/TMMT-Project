import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/layout/Layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressStepper } from '@/components/ui/progress-stepper';

const QualificationAgreements = () => {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState({
    agreement1: false,
    agreement2: false,
    agreement3: false
  });

  const steps = [
    { title: 'Agreements', completed: false, current: true },
    { title: 'Main information', completed: false, current: false },
    { title: 'Wallet address', completed: false, current: false },
    { title: 'Upload documents', completed: false, current: false }
  ];

  const handleAgreementChange = (key: string, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: checked }));
  };

  const allAgreed = Object.values(agreements).every(Boolean);

  const handleNext = () => {
    navigate('/qualification/personal-info');
  };

  const handleBack = () => {
    navigate('/qualification/start-step');
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
              If the Issuer has configured any mandatory Agreement points, they will be displayed here. Please review them.
            </h3>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm">23 of 51</span>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">←</Button>
                <Button variant="secondary" size="sm">→</Button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-foreground mb-6">
              To begin, please review and accept the outlined agreements.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-3 p-4 border border-purple-300 rounded-lg bg-purple-50">
                <Checkbox
                  id="agreement1"
                  checked={agreements.agreement1}
                  onCheckedChange={(checked) => handleAgreementChange('agreement1', checked as boolean)}
                />
                <div className="text-sm">
                  <p className="font-medium mb-2">
                    Example agreement with bulleted list: I hereby confirm that the following information is exact and consent to receiving the KID without undue delay after subscribing to the Offering:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary">
                    <li>I confirm that I subscribed to the Class A Notes using a means of distance communication;</li>
                    <li>I acknowledge that it is not possible on the date of my subscription to the Class A Notes;</li>
                    <li>I am aware of my right to withdraw from my subscription to the Class A Notes and that I may delay the subscription to the Class A Notes in order to receive and review the key information document in relation to the Class A Notes.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border border-purple-300 rounded-lg bg-purple-50">
                <Checkbox
                  id="agreement2"
                  checked={agreements.agreement2}
                  onCheckedChange={(checked) => handleAgreementChange('agreement2', checked as boolean)}
                />
                <div className="text-sm">
                  <p>
                    Example agreement for simple aspects: I hereby confirm that I have communicated on this website/platform is true, complete and accurate in all aspects.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border border-purple-300 rounded-lg bg-purple-50">
                <Checkbox
                  id="agreement3"
                  checked={agreements.agreement3}
                  onCheckedChange={(checked) => handleAgreementChange('agreement3', checked as boolean)}
                />
                <div className="text-sm">
                  <p>
                    Example agreement with the link: I have read, understood, and fully and irrevocably acknowledge and accept the{' '}
                    <a href="#" className="text-blue-600 underline">Terms and Conditions of the Security Tokens</a>
                  </p>
                  <p className="text-text-secondary mt-1">Terms and Conditions of the Security Tokens</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button 
              onClick={handleNext}
              disabled={!allAgreed}
              className="px-8"
            >
              Next: Main information →
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QualificationAgreements;
