import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, Mail } from 'lucide-react';

const QualificationComplete = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="p-8  mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Application Submitted Successfully!</h1>
          <p className="text-text-secondary">
            You submitted your Investor profile for review. Great job! The Issuer will now initiate their KYC/AML verification process.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <Clock className="w-6 h-6 text-orange-500 mt-1" />
              <div>
                <h3 className="font-medium text-foreground mb-2">Under Review</h3>
                <p className="text-text-secondary text-sm">
                  Your application is currently being reviewed by our compliance team. This process typically takes 2-5 business days.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <Mail className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-foreground mb-2">Email Notification</h3>
                <p className="text-text-secondary text-sm">
                  After the Issuer approves your KYC application, its status will be updated, and you will receive a notification via email.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-medium text-green-900 mb-2">Next Steps</h3>
                <p className="text-green-800 text-sm mb-3">
                  Once approved, your ONCHAINID will be deployed and you'll become a qualified investor.
                </p>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Access to invest in Green Brew Bond</li>
                  <li>• Reusable qualification for future offerings</li>
                  <li>• Blockchain-based investment passport</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-purple-500 text-white p-6 rounded-lg mt-8">
          <h4 className="font-medium mb-2">
            Congratulations! Your self-managed blockchain-based and reusable investment passport, ONCHAINID, has been successfully deployed. You are now a qualified investor and can begin investing in the Green Brew Token.
          </h4>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm">50 of 51</span>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">←</Button>
              <Button variant="secondary" size="sm">→</Button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button onClick={handleBackToDashboard} size="lg">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default QualificationComplete;
