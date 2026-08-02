import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const KYCReviewStatus = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-8 mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              GBB
            </div>
            <span className="text-text-secondary">Green Brew Bond</span>
            <span className="text-gray-400">› KYC Status</span>
          </div>
        </div>

        <div className="bg-background rounded-lg border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              KYC Application Submitted
            </h1>
            <p className="text-text-secondary">
              Your investor profile has been submitted for review. The issuer will now initiate their KYC/AML verification process.
            </p>
          </div>

          <Card className="p-6 mb-8">
            <h3 className="font-medium text-foreground mb-4">Application Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Personal Information</span>
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Document Upload</span>
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Wallet Connection</span>
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">KYC Review</span>
                <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">ONCHAINID Deployment</span>
                <Badge className="bg-surface text-text-secondary">Pending</Badge>
              </div>
            </div>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• The issuer will review your submitted documents and information</li>
              <li>• You will receive an email notification once the review is complete</li>
              <li>• If approved, your ONCHAINID will be deployed automatically</li>
              <li>• You can then proceed to invest in qualified projects</li>
            </ul>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
            <Button>
              View Project Details
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KYCReviewStatus;
