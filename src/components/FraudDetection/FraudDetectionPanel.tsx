import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  Upload,
  FileText,
  UserCheck,
  Ban,
  Gavel,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DocumentAnalysis {
  id: string;
  filename: string;
  type: 'emirates_id' | 'passport' | 'visa' | 'other';
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  issues: string[];
  recommendations: string[];
  analysisDate: string;
}

interface FraudDetectionPanelProps {
  applicationId: string;
  documents: Array<{
    path: string;
    filename: string;
    type: string;
    verificationStatus: string;
    fraudScore?: number;
  }>;
  onFraudDetected: (documentId: string, fraudData: any) => void;
}

const FraudDetectionPanel: React.FC<FraudDetectionPanelProps> = ({
  applicationId,
  documents,
  onFraudDetected
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<DocumentAnalysis[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentAnalysis | null>(null);

  const analyzeDocument = async (document: any) => {
    setAnalyzing(true);
    
    // Simulate AI-powered document analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAnalysis: DocumentAnalysis = {
      id: document.path,
      filename: document.filename,
      type: document.type as any,
      fraudScore: Math.floor(Math.random() * 100),
      riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      issues: Math.random() > 0.6 ? ['Suspicious formatting', 'Inconsistent data'] : [],
      recommendations: ['Verify with issuing authority', 'Request additional documentation'],
      analysisDate: new Date().toISOString()
    };
    
    setAnalysisResults(prev => [...prev, mockAnalysis]);
    setAnalyzing(false);
    
    if (mockAnalysis.riskLevel === 'high' || mockAnalysis.riskLevel === 'critical') {
      onFraudDetected(document.path, mockAnalysis);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Fraud Detection Header */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Shield className="w-5 h-5" />
            AI-Powered Fraud Detection System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {documents.length}
              </div>
              <div className="text-sm text-text-secondary">Documents to Analyze</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analysisResults.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length}
              </div>
              <div className="text-sm text-text-secondary">High Risk Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysisResults.filter(r => r.riskLevel === 'low').length}
              </div>
              <div className="text-sm text-text-secondary">Verified Documents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Document Analysis Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => {
              const analysis = analysisResults.find(r => r.id === doc.path);
              return (
                <Card key={doc.path} className="border-l-4 border-l-blue-400">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            Type: {doc.type.replace('_', ' ')} • Status: {doc.verificationStatus}
                          </p>
                          {analysis && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getRiskColor(analysis.riskLevel)}>
                                  {getRiskIcon(analysis.riskLevel)}
                                  {analysis.riskLevel} Risk
                                </Badge>
                                <span className="text-sm text-text-secondary">
                                  Score: {analysis.fraudScore}/100
                                </span>
                              </div>
                              {analysis.issues.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-red-600">Issues Detected:</p>
                                  <div className="flex gap-2 mt-1">
                                    {analysis.issues.map((issue, index) => (
                                      <Badge key={index} variant="outline" className="text-xs text-red-600">
                                        {issue}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!analysis ? (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => analyzeDocument(doc)}
                            disabled={analyzing}
                          >
                            {analyzing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              <Zap className="w-4 h-4 mr-2" />
                            )}
                            Analyze
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Document Analysis - {analysis.filename}</DialogTitle>
                                <DialogDescription>
                                  Detailed fraud detection analysis results
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-text-secondary">Risk Level</p>
                                    <Badge className={getRiskColor(analysis.riskLevel)}>
                                      {analysis.riskLevel}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-text-secondary">Fraud Score</p>
                                    <div className="flex items-center gap-2">
                                      <Progress value={analysis.fraudScore} className="flex-1" />
                                      <span className="text-sm font-medium">{analysis.fraudScore}/100</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {analysis.issues.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-red-600 mb-2">Issues Detected</p>
                                    <div className="space-y-2">
                                      {analysis.issues.map((issue, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                          <XCircle className="w-4 h-4 text-red-500" />
                                          {issue}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <p className="text-sm font-medium text-text-secondary mb-2">Recommendations</p>
                                  <div className="space-y-2">
                                    {analysis.recommendations.map((rec, index) => (
                                      <div key={index} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        {rec}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">
                                    Analyzed: {new Date(analysis.analysisDate).toLocaleString()}
                                  </span>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <Download className="w-4 h-4 mr-2" />
                                      Export Report
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => onFraudDetected(doc.path, analysis)}
                                    >
                                      <Gavel className="w-4 h-4 mr-2" />
                                      Issue Penalty
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudDetectionPanel;
