import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, FileText, Building, Globe, AlertTriangle, Play, Settings } from 'lucide-react';
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
    status: string;
  };
  assetData: {
    name: string;
    type: string;
    location: string;
    status: string;
    documentsVerified: boolean;
  };
  spvData: {
    jurisdiction: string;
    status: string;
    complianceVerified: boolean;
  };
  compliance: {
    kycVerified: boolean;
    amlVerified: boolean;
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
  };
}

interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  deployed: number;
  rejected: number;
}

const BackOffice: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'deployed' | 'all'>('pending');

  // Connect wallet for back office access
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log("Back office wallet connected:", accounts[0]);
        }
      } catch (err) {
        console.error("Failed to connect wallet", err);
        toast.error("Failed to connect wallet");
      }
    } else {
      toast.error("Please install MetaMask");
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/token/applications');
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/backoffice/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Update individual status (Asset, SPV, Token)
  const updateIndividualStatus = async (applicationId: string, statusType: 'asset' | 'spv' | 'token', action: 'approve' | 'reject', notes: string = '') => {
    try {
      setIsLoading(true);
      let updateData: any = {
        notes,
        reviewer: walletAddress
      };

      // Update specific status based on type
      if (statusType === 'asset') {
        updateData.assetStatus = action === 'approve' ? 'DOCUMENTS_VERIFIED' : 'REJECTED';
      } else if (statusType === 'spv') {
        updateData.spvStatus = action === 'approve' ? 'COMPLIANCE_VERIFIED' : 'REJECTED';
      } else if (statusType === 'token') {
        updateData.complianceData = action === 'approve' ? { kycVerified: true, amlVerified: true } : { kycVerified: false, amlVerified: false };
      }

      const response = await axios.put(`http://localhost:8000/api/token/applications/${applicationId}/status`, updateData);

      if (response.data.success) {
        toast.success(`${statusType.toUpperCase()} ${action}d successfully`);
        await fetchApplications();
        await fetchStats();
        
        // Check if all components are approved to enable final approval
        const updatedApp = response.data.data;
        if (updatedApp.assetData.documentsVerified && 
            updatedApp.spvData.complianceVerified && 
            updatedApp.compliance.kycVerified) {
          toast.info('All components approved! Application ready for final approval.');
        }
      }
    } catch (error) {
      console.error(`Error updating ${statusType} status:`, error);
      toast.error(`Failed to update ${statusType} status`);
    } finally {
      setIsLoading(false);
    }
  };

  // Final application approval
  const finalApproval = async (applicationId: string, notes: string = 'Final approval granted') => {
    try {
      setIsLoading(true);
      const response = await axios.put(`http://localhost:8000/api/token/applications/${applicationId}/status`, {
        status: 'APPROVED',
        notes,
        reviewer: walletAddress
      });

      if (response.data.success) {
        toast.success('Application approved! Ready for deployment.');
        await fetchApplications();
        await fetchStats();
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setIsLoading(false);
    }
  };

  // Reject application
  const rejectApplication = async (applicationId: string, notes: string = 'Application rejected') => {
    try {
      setIsLoading(true);
      const response = await axios.put(`http://localhost:8000/api/token/applications/${applicationId}/status`, {
        status: 'REJECTED',
        notes,
        reviewer: walletAddress
      });

      if (response.data.success) {
        toast.success('Application rejected');
        await fetchApplications();
        await fetchStats();
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setIsLoading(false);
    }
  };

  // Deploy token
  const deployToken = async (applicationId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`http://localhost:8000/api/token/applications/${applicationId}/deploy`, {
        reviewer: walletAddress
      });

      if (response.data.success) {
        toast.success('Token deployed successfully!');
        await fetchApplications();
        await fetchStats();
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error deploying token:', error);
      toast.error('Failed to deploy token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    connectWallet();
    fetchApplications();
    fetchStats();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchApplications();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': 
      case 'UNDER_REVIEW': 
      case 'UNDER_REVIEW_ASSET_EVALUATION':
      case 'UNDER_PROCESS': 
        return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED': 
      case 'DOCUMENTS_VERIFIED':
      case 'COMPLIANCE_VERIFIED':
        return 'text-green-600 bg-green-100';
      case 'DEPLOYED': return 'text-blue-600 bg-blue-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'DEPLOYING': return 'text-purple-600 bg-purple-100';
      default: return 'text-text-secondary bg-surface';
    }
  };

  const filteredApplications = applications.filter(app => {
    switch (activeTab) {
      case 'pending': return app.status === 'PENDING_REVIEW';
      case 'approved': return app.status === 'APPROVED';
      case 'deployed': return app.status === 'DEPLOYED';
      default: return true;
    }
  });

  // Check if application is ready for final approval
  const isReadyForApproval = (app: Application) => {
    return app.assetData.documentsVerified && 
           app.spvData.complianceVerified && 
           app.compliance.kycVerified &&
           app.status === 'PENDING_REVIEW';
  };

  return (
    <div className="min-h-screen pt-[5%] bg-gradient-to-br from-slate-50 to-slate-100">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-background rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Back Office Dashboard</h1>
            <p className="text-text-secondary mt-1">Manage token creation applications and deployments</p>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-foreground">{stats.totalApplications}</p>
                <p className="text-text-secondary">Total Applications</p>
              </div>
            </div>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-foreground">{stats.pendingReview}</p>
                <p className="text-text-secondary">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                <p className="text-text-secondary">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-foreground">{stats.deployed}</p>
                <p className="text-text-secondary">Deployed</p>
              </div>
            </div>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
                <p className="text-text-secondary">Rejected</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-background rounded-lg shadow-sm border border-border">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'pending', label: 'Pending Review', count: stats?.pendingReview || 0 },
              { key: 'approved', label: 'Approved', count: stats?.approved || 0 },
              { key: 'deployed', label: 'Deployed', count: stats?.deployed || 0 },
              { key: 'all', label: 'All Applications', count: stats?.totalApplications || 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-foreground hover:border-border'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Applications Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-surface-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr key={app.applicationId} className="hover:bg-surface-light">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-foreground">{app.applicationId}</p>
                      <p className="text-sm text-gray-500">by {app.submittedBy.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-foreground">{app.tokenData.name}</p>
                      <p className="text-sm text-gray-500">{app.tokenData.symbol} • {app.tokenData.type}</p>
                      <p className="text-sm text-gray-500">${app.tokenData.tokenPrice} • Supply: {app.tokenData.totalSupply.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Building className="h-3 w-3" />
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(app.assetData.status)}`}>
                          Asset: {app.assetData.documentsVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-3 w-3" />
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(app.spvData.status)}`}>
                          SPV: {app.spvData.complianceVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Settings className="h-3 w-3" />
                        <span className={`text-xs px-2 py-1 rounded ${app.compliance.kycVerified ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'}`}>
                          KYC: {app.compliance.kycVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    {isReadyForApproval(app) && (
                      <div className="text-xs text-green-600 mt-1">Ready for approval!</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {/* Component-specific approval buttons */}
                    {app.status === 'PENDING_REVIEW' && (
                      <>
                        {!app.assetData.documentsVerified && (
                          <button
                            onClick={() => updateIndividualStatus(app.applicationId, 'asset', 'approve', 'Asset documents verified')}
                            disabled={isLoading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Approve Asset"
                          >
                            <Building className="h-4 w-4" />
                          </button>
                        )}
                        
                        {!app.spvData.complianceVerified && (
                          <button
                            onClick={() => updateIndividualStatus(app.applicationId, 'spv', 'approve', 'SPV compliance verified')}
                            disabled={isLoading}
                            className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                            title="Approve SPV"
                          >
                            <Globe className="h-4 w-4" />
                          </button>
                        )}
                        
                        {!app.compliance.kycVerified && (
                          <button
                            onClick={() => updateIndividualStatus(app.applicationId, 'token', 'approve', 'KYC/AML verification completed')}
                            disabled={isLoading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Approve KYC/AML"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                        )}

                        {/* Final approval button - only show when all components are approved */}
                        {isReadyForApproval(app) && (
                          <button
                            onClick={() => finalApproval(app.applicationId, 'All components verified - final approval granted')}
                            disabled={isLoading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 bg-green-50 px-2 py-1 rounded"
                            title="Final Approval"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => rejectApplication(app.applicationId, 'Application rejected by back office')}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Reject Application"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    
                    {/* Deploy button for approved applications */}
                    {app.status === 'APPROVED' && (
                      <button
                        onClick={() => deployToken(app.applicationId)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50 bg-blue-50 px-2 py-1 rounded flex items-center space-x-1"
                        title="Deploy Token"
                      >
                        <Play className="h-4 w-4" />
                        <span>Deploy</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-background">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">
                  Application Details: {selectedApplication.applicationId}
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-text-secondary"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Token Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Token Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedApplication.tokenData.name}</p>
                    <p><strong>Symbol:</strong> {selectedApplication.tokenData.symbol}</p>
                    <p><strong>Type:</strong> {selectedApplication.tokenData.type}</p>
                    <p><strong>Price:</strong> ${selectedApplication.tokenData.tokenPrice}</p>
                    <p><strong>Supply:</strong> {selectedApplication.tokenData.totalSupply.toLocaleString()}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(selectedApplication.tokenData.status)}`}>
                        {selectedApplication.tokenData.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Asset Details */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Asset Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedApplication.assetData.name}</p>
                    <p><strong>Type:</strong> {selectedApplication.assetData.type}</p>
                    <p><strong>Location:</strong> {selectedApplication.assetData.location}</p>
                    <p><strong>Documents:</strong> 
                      <span className={`ml-2 ${selectedApplication.assetData.documentsVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedApplication.assetData.documentsVerified ? '✓ Verified' : '✗ Pending'}
                      </span>
                    </p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(selectedApplication.assetData.status)}`}>
                        {selectedApplication.assetData.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* SPV Details */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    SPV Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Jurisdiction:</strong> {selectedApplication.spvData.jurisdiction}</p>
                    <p><strong>Compliance:</strong> 
                      <span className={`ml-2 ${selectedApplication.spvData.complianceVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedApplication.spvData.complianceVerified ? '✓ Verified' : '✗ Pending'}
                      </span>
                    </p>
                    <p><strong>KYC:</strong> 
                      <span className={`ml-2 ${selectedApplication.compliance.kycVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedApplication.compliance.kycVerified ? '✓ Verified' : '✗ Pending'}
                      </span>
                    </p>
                    <p><strong>AML:</strong> 
                      <span className={`ml-2 ${selectedApplication.compliance.amlVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedApplication.compliance.amlVerified ? '✓ Verified' : '✗ Pending'}
                      </span>
                    </p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(selectedApplication.spvData.status)}`}>
                        {selectedApplication.spvData.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Review History */}
              <div className="mt-6 bg-surface-light p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Review History</h4>
                <div className="space-y-2">
                  {selectedApplication.reviewHistory.map((review, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{review.action}</span>
                        <span className="text-text-secondary ml-2">{review.notes}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">{review.reviewer}</p>
                        <p className="text-gray-400 text-xs">{new Date(review.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deployment Data */}
              {selectedApplication.deploymentData && (
                <div className="mt-6 bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3">Deployment Information</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>Token Address:</strong> 
                      <code className="ml-2 bg-background px-2 py-1 rounded text-xs">
                        {selectedApplication.deploymentData.tokenAddress}
                      </code>
                    </p>
                    <p><strong>Deployed At:</strong> {new Date(selectedApplication.deploymentData.deployedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                {selectedApplication.status === 'PENDING_REVIEW' && (
                  <>
                    <button
                      onClick={() => rejectApplication(selectedApplication.applicationId, 'Application rejected after review')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => finalApproval(selectedApplication.applicationId, 'Application approved after review')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </>
                )}
                {selectedApplication.status === 'APPROVED' && (
                  <button
                    onClick={() => deployToken(selectedApplication.applicationId)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Deploying...' : 'Deploy Token'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackOffice; 