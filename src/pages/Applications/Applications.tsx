import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, FileText, Building, Globe, Eye } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

interface Application {
  applicationId: string;
  submittedAt: string;
  submittedBy: string;
  status: string;
  tokenData: {
    name: string;
    symbol: string;
    type: string;
    totalSupply: number;
    tokenPrice: number;
  };
  assetData: {
    name: string;
    type: string;
    location: string;
    status: string;
  };
  spvData: {
    jurisdiction: string;
    status: string;
  };
  reviewHistory: Array<{
    timestamp: string;
    action: string;
    notes: string;
    reviewer: string;
  }>;
  deploymentData?: {
    tokenAddress: string;
    deployedAt: string;
    explorerLink?: string;
  };
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log("Wallet connected:", accounts[0]);
        }
      } catch (err) {
        console.error("Failed to connect wallet", err);
        toast.error("Failed to connect wallet");
      }
    } else {
      toast.error("Please install MetaMask");
    }
  };

  // Fetch user's applications
  const fetchApplications = async () => {
    if (!walletAddress) return;
    
    try {
      setIsLoading(true);
      
      const response = await axios.get('http://localhost:8000/api/token/applications');
      
      if (response.data.success) {
        // Filter applications for the connected wallet
        const userApplications = response.data.data.filter(
          (app: Application) => app.submittedBy.toLowerCase() === walletAddress.toLowerCase()
        );
        setApplications(userApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   connectWallet();
  // }, []);

  // useEffect(() => {
  //   if (walletAddress) {
  //     fetchApplications();
  //   }
  // }, [walletAddress]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'APPROVED': return 'text-green-600 bg-green-100 border-green-200';
      case 'DEPLOYED': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'REJECTED': return 'text-red-600 bg-red-100 border-red-200';
      case 'DEPLOYING': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-text-secondary bg-surface border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return <Clock className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'DEPLOYED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'DEPLOYING': return <Clock className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'submitted', label: 'Application Submitted', completed: true },
      { key: 'review', label: 'Under Review', completed: ['APPROVED', 'DEPLOYED', 'DEPLOYING'].includes(status) },
      { key: 'approved', label: 'Approved', completed: ['APPROVED', 'DEPLOYED', 'DEPLOYING'].includes(status) },
      { key: 'deployed', label: 'Token Deployed', completed: status === 'DEPLOYED' }
    ];
    
    if (status === 'REJECTED') {
      return steps.map((step, index) => ({
        ...step,
        completed: index === 0,
        rejected: index === 1
      }));
    }
    
    return steps;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
            <p className="text-text-secondary mt-1">Track your token creation applications</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Connected Wallet</p>
            <p className="font-mono text-sm">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
                <button onClick={connectWallet} className="text-indigo-600 hover:text-indigo-700">
                  Connect Wallet
                </button>
              }
            </p>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {!walletAddress ? (
        <div className="bg-background rounded-lg shadow-sm border border-border p-12 text-center">
          <p className="text-gray-500 mb-4">Please connect your wallet to view your applications</p>
          <button 
            onClick={connectWallet}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Connect Wallet
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-background rounded-lg shadow-sm border border-border p-12 text-center">
          {isLoading ? (
            <p className="text-gray-500">Loading applications...</p>
          ) : (
            <>
              <p className="text-gray-500 mb-4">No applications found</p>
              <p className="text-gray-400 text-sm">Submit your first token creation application to get started</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.applicationId} className="bg-background rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{app.tokenData.name}</h3>
                  <p className="text-text-secondary">{app.tokenData.symbol} • {app.tokenData.type}</p>
                  <p className="text-sm text-gray-500">Application ID: {app.applicationId}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span className="ml-2">{app.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  {getProgressSteps(app.status).map((step, index) => (
                    <div key={step.key} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        step.completed 
                          ? 'bg-green-100 border-green-500 text-green-600' 
                          : step.rejected
                          ? 'bg-red-100 border-red-500 text-red-600'
                          : 'bg-surface border-border text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : step.rejected ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={`ml-2 text-sm ${
                        step.completed ? 'text-green-600 font-medium' : 
                        step.rejected ? 'text-red-600 font-medium' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                      {index < getProgressSteps(app.status).length - 1 && (
                        <div className={`ml-4 w-8 h-0.5 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Token</p>
                    <p className="text-sm text-blue-700">${app.tokenData.tokenPrice} • {app.tokenData.totalSupply.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Building className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Asset</p>
                    <p className="text-sm text-green-700">{app.assetData.name}</p>
                    <p className="text-xs text-green-600">{app.assetData.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">SPV</p>
                    <p className="text-sm text-purple-700">{app.spvData.jurisdiction}</p>
                  </div>
                </div>
              </div>

              {/* Deployment Info */}
              {app.deploymentData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-green-900 mb-2">Token Deployed Successfully! 🎉</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Token Address:</span>
                      <code className="ml-2 bg-background px-2 py-1 rounded text-xs">
                        {app.deploymentData.tokenAddress}
                      </code>
                    </p>
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Deployed:</span> {new Date(app.deploymentData.deployedAt).toLocaleString()}
                    </p>
                    {app.deploymentData.explorerLink && (
                      <a 
                        href={app.deploymentData.explorerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        View on Block Explorer →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Latest Update */}
              {app.reviewHistory.length > 0 && (
                <div className="bg-surface-light rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Latest Update</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-foreground">{app.reviewHistory[app.reviewHistory.length - 1].notes}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(app.reviewHistory[app.reviewHistory.length - 1].timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setSelectedApplication(app)}
                  className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-background">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">
                  Application Details: {selectedApplication.tokenData.name}
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-text-secondary"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Full Review History */}
              <div className="bg-surface-light p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Review Timeline</h4>
                <div className="space-y-3">
                  {selectedApplication.reviewHistory.map((review, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-background rounded border">
                      <div className="flex-shrink-0 w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{review.action.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-500">{new Date(review.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-text-secondary text-sm mt-1">{review.notes}</p>
                        <p className="text-gray-500 text-xs mt-1">by {review.reviewer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications; 