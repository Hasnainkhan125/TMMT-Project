import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/layout/Layout';
import { Button } from '@/components/ui/button';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { useAppKit } from '@reown/appkit/react';
import TokenizationForm from '@/components/TokenCard/TokenizationForm';

const QualificationWallet = () => {
  const navigate = useNavigate();
  const [walletConnected, setWalletConnected] = useState(false);
  const { open } = useAppKit();
  const steps = [
    { title: 'Agreements', completed: true, current: false },
    { title: 'Main information', completed: true, current: false },
    { title: 'Wallet address', completed: false, current: true },
    { title: 'Upload documents', completed: false, current: false }
  ];

  const handleWalletConnect = () => {
    open({
      view: 'Account'
    });
    setWalletConnected(true);
  };

  const handleNext = () => {
    navigate('/qualification/documents');
  };

  const handleBack = () => {
    navigate('/qualification/personal-info');
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
              Connect your wallet to proceed with the qualification process. This will be used for your ONCHAINID deployment.
            </h3>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm">35 of 51</span>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">←</Button>
                <Button variant="secondary" size="sm">→</Button>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-lg font-medium text-foreground mb-4">Wallet Connection</h3>
            <p className="text-text-secondary mb-6">
              Please connect your wallet to continue with the qualification process.
            </p>
            <Button onClick={handleWalletConnect} size="lg" className="mb-4">
              Connect Wallet
            </Button>
            <TokenizationForm/>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button 
              onClick={handleNext}
              disabled={!walletConnected}
              className="px-8"
            >
              Next: Upload documents →
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QualificationWallet;
