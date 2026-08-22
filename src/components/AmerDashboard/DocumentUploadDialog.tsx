import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  FileText, 
  Loader2, 
  Plus, 
  FileCheck, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Paperclip,
  Trash2,
  Sparkles,
  Lock,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  onUploadComplete?: () => void;
  isResultDocument?: boolean;
}

interface DocumentToUpload {
  id: string;
  file: File | null;
  name: string;
  type: string;
  uploadedByRole: string;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  applicationId,
  onUploadComplete,
  isResultDocument = false
}) => {
  const [documents, setDocuments] = useState<DocumentToUpload[]>([
    { id: '1', file: null, name: '', type: 'general', uploadedByRole: 'amer' }
  ]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const addDocumentSlot = () => {
    setDocuments([
      ...documents,
      { id: Date.now().toString(), file: null, name: '', type: 'general', uploadedByRole: 'amer' }
    ]);
  };

  const removeDocumentSlot = (id: string) => {
    if (documents.length > 1) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  const updateDocument = (id: string, field: 'file' | 'name' | 'type' | 'uploadedByRole', value: any) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleFileSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = isResultDocument ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File size must be less than ${isResultDocument ? '20MB' : '10MB'}`);
        return;
      }

      const doc = documents.find(d => d.id === id);
      if (doc && !doc.name) {
        updateDocument(id, 'name', file.name.replace(/\.[^/.]+$/, ''));
      }
      updateDocument(id, 'uploadedByRole', 'amer');
      updateDocument(id, 'file', file);
    }
  };

  const handleDrop = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const maxSize = isResultDocument ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File size must be less than ${isResultDocument ? '20MB' : '10MB'}`);
        return;
      }
      const doc = documents.find(d => d.id === id);
      if (doc && !doc.name) {
        updateDocument(id, 'name', file.name.replace(/\.[^/.]+$/, ''));
      }
      updateDocument(id, 'uploadedByRole', 'amer');
      updateDocument(id, 'file', file);
    }
  };

  const handleUpload = async () => {
    const validDocuments = documents.filter(doc => doc.file && doc.name.trim());
    
    if (validDocuments.length === 0) {
      toast.error('Please add at least one document with a name');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('authToken') || '';
      
      if (!token) {
        toast.error('Please login first');
        setUploading(false);
        return;
      }

      const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001';

      for (const doc of validDocuments) {
        const formData = new FormData();
        formData.append('file', doc.file!);
        formData.append('documentName', doc.name);
        formData.append('documentType', doc.type);
        formData.append('uploadedByRole', 'amer');
        
        // ─── Choose the correct endpoint ──────────────────────────────
        const endpoint = isResultDocument
          ? `${apiBase}/api/v1/visa/${applicationId}/result-documents`
          : `${apiBase}/api/v1/visa/${applicationId}/documents`;

        console.log('📡 Uploading to:', endpoint);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { message: responseText };
        }
        
        console.log('📡 Response:', response.status);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            toast.error('Authentication failed. Please login again.');
            setUploading(false);
            return;
          }
          throw new Error(responseData.message || responseData.error || 'Upload failed');
        }
      }

      toast.success(`${validDocuments.length} document(s) uploaded successfully`);
      
      setDocuments([{ id: '1', file: null, name: '', type: 'general', uploadedByRole: 'amer' }]);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const documentTypes = isResultDocument
    ? [
        { value: 'icp_receipt', label: 'ICP Receipt' },
        { value: 'transaction_paper', label: 'Transaction Paper' },
        { value: 'visa_approval', label: 'Visa Approval' },
        { value: 'visa_result', label: 'Visa Result' },
        { value: 'other_result', label: 'Other Result Document' }
      ]
    : [
        { value: 'passport', label: 'Passport' },
        { value: 'emirates_id', label: 'Emirates ID' },
        { value: 'visa', label: 'Visa' },
        { value: 'sponsor_document', label: 'Sponsor Document' },
        { value: 'other', label: 'Other Document' }
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-white/10 rounded-2xl p-0">
        {/* ─── Premium Header ────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#14235E] to-[#14235E]  px-6 py-5 rounded-t-2xl">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm shadow-lg shadow-black/20">
              {isResultDocument ? (
                <FileCheck className="w-6 h-6 text-white" />
              ) : (
                <Upload className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-white">
                {isResultDocument ? 'Upload Result Documents' : 'Upload Documents'}
              </DialogTitle>
              <DialogDescription className="text-white/60 text-sm mt-0.5">
                {isResultDocument 
                  ? 'Upload ICP receipts, transaction papers, and other result documents'
                  : 'Upload required documents for this application'
                }
              </DialogDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
          </div>
        </div>

        {/* ─── Content ────────────────────────────────────────────────── */}
        <div className="px-6 py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all duration-300',
                  doc.file 
                    ? 'border-emerald-200/80 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/10'
                    : 'border-gray-200/60 dark:border-white/10 bg-gray-50/30 dark:bg-gray-900/30 hover:border-[#14235E]/30 dark:hover:border-white/30'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'p-1.5 rounded-lg transition-all duration-300',
                      doc.file 
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                    )}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-white/80">
                      Document {index + 1}
                    </span>
                    {doc.file && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    )}
                  </div>
                  {documents.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocumentSlot(doc.id)}
                      className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                      Document Type
                    </Label>
                    <select
                      value={doc.type}
                      onChange={(e) => updateDocument(doc.id, 'type', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235E]/20 focus:border-[#14235E] transition-all"
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                      Document Name *
                    </Label>
                    <Input
                      value={doc.name}
                      onChange={(e) => updateDocument(doc.id, 'name', e.target.value)}
                      placeholder="e.g., ICP Receipt - Jan 2024"
                      className="mt-1 text-sm border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235E]/20 focus:border-[#14235E] transition-all"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                    Choose File *
                  </Label>
                  <div 
                    className={cn(
                      'mt-1 relative',
                      dragOver === doc.id && 'ring-2 ring-[#14235E] ring-offset-2'
                    )}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(doc.id); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(doc.id, e)}
                  >
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileSelect(doc.id, e)}
                      className="hidden"
                      id={`file-${doc.id}`}
                    />
                    <label
                      htmlFor={`file-${doc.id}`}
                      className={cn(
                        'flex items-center justify-center w-full px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300',
                        doc.file
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-gray-300 dark:border-white/20 hover:border-[#14235E]/50 dark:hover:border-white/40 hover:bg-[#14235E]/5 dark:hover:bg-white/5'
                      )}
                    >
                      {doc.file ? (
                        <div className="flex items-center gap-3 w-full justify-center">
                          <div className="p-2 rounded-lg bg-emerald-500/10">
                            <FileCheck className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-medium text-gray-900 dark:text-white block">
                              {doc.file.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-white/40">
                              {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                            Selected
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-white/40">
                          <div className="p-3 rounded-xl bg-[#14235E]/10 dark:bg-white/5">
                            <Paperclip className="w-6 h-6 text-[#14235E] dark:text-white/60" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm font-medium">Click to select or drag & drop</span>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-white/30">
                            Supports PDF, JPG, PNG (Max {isResultDocument ? '20MB' : '10MB'})
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button
            variant="outline"
            size="sm"
            onClick={addDocumentSlot}
            className="w-full border-dashed border-2 border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/60 hover:border-[#14235E] hover:text-[#14235E] dark:hover:text-white hover:bg-[#14235E]/5 dark:hover:bg-white/5 rounded-xl py-6 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Document
          </Button>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleUpload}
              disabled={uploading || !documents.some(d => d.file && d.name.trim())}
              className="flex-1 bg-gradient-to-r from-[#14235E] to-[#14235E] dark:from-white dark:to-gray-200 text-white dark:text-[#14235E] hover:shadow-lg hover:shadow-[#14235E]/25 dark:hover:shadow-white/20 border-0 rounded-xl py-6 transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {documents.filter(d => d.file && d.name.trim()).length} Document(s)
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
              className="rounded-xl border-gray-300 dark:border-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-gray-400 dark:text-white/30 pt-2">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Encrypted Storage
            </span>
            <span className="w-px h-3 bg-gray-300 dark:bg-white/10" />
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Secure Upload
            </span>
            <span className="w-px h-3 bg-gray-300 dark:bg-white/10" />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#14235E] dark:text-white/60" />
              All documents are encrypted and securely stored
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;