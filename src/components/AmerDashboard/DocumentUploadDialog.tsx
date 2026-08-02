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
  Trash2
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
      
      for (const doc of validDocuments) {
        const formData = new FormData();
        formData.append('file', doc.file!);
        formData.append('documentName', doc.name);
        formData.append('documentType', doc.type);
        formData.append('uploadedByRole', doc.uploadedByRole);
        
        if (isResultDocument) {
          formData.append('isResultDocument', 'true');
        }

        const endpoint = isResultDocument
          ? `/api/v1/visa/${applicationId}/result-documents`
          : `/api/v1/visa/${applicationId}/documents`;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl rounded-2xl p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 px-6 py-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#0A3269] to-[#1a4a7a] shadow-lg shadow-[#0A3269]/25">
                {isResultDocument ? (
                  <FileCheck className="w-5 h-5 text-white" />
                ) : (
                  <Upload className="w-5 h-5 text-white" />
                )}
              </div>
              {isResultDocument ? 'Upload Result Documents' : 'Upload Documents'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 mt-1">
              {isResultDocument 
                ? 'Upload ICP receipts, transaction papers, and other result documents for this application.'
                : 'Upload required documents for this application. You can add multiple documents at once.'
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* Document Slots */}
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
                    : 'border-gray-200/80 dark:border-gray-800/80 bg-gray-50/30 dark:bg-gray-900/30 hover:border-[#0A3269]/30'
                )}
              >
                {/* Document Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'p-1.5 rounded-lg transition-all duration-300',
                      doc.file 
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    )}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Document Type */}
                  <div>
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Document Type
                    </Label>
                    <select
                      value={doc.type}
                      onChange={(e) => updateDocument(doc.id, 'type', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0A3269]/20 focus:border-[#0A3269] transition-all"
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Document Name */}
                  <div>
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Document Name *
                    </Label>
                    <Input
                      value={doc.name}
                      onChange={(e) => updateDocument(doc.id, 'name', e.target.value)}
                      placeholder="e.g., ICP Receipt - Jan 2024"
                      className="mt-1 text-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#0A3269]/20 focus:border-[#0A3269] transition-all"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="mt-3">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Choose File *
                  </Label>
                  <div 
                    className={cn(
                      'mt-1 relative',
                      dragOver === doc.id && 'ring-2 ring-[#0A3269] ring-offset-2'
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
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#0A3269]/50 hover:bg-[#0A3269]/5 dark:hover:bg-[#0A3269]/10'
                      )}
                    >
                      {doc.file ? (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10">
                            <FileCheck className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-medium text-gray-900 dark:text-white block">
                              {doc.file.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                            Selected
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Paperclip className="w-6 h-6" />
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Click to select or drag & drop</span>
                          </div>
                          <span className="text-xs text-gray-400">
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

          {/* Add More Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={addDocumentSlot}
            className="w-full border-dashed border-2 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#0A3269] hover:text-[#0A3269] hover:bg-[#0A3269]/5 dark:hover:bg-[#0A3269]/10 rounded-xl py-6 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Document
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleUpload}
              disabled={uploading || !documents.some(d => d.file && d.name.trim())}
              className="flex-1 bg-gradient-to-r from-[#0A3269] to-[#1a4a7a] text-white hover:shadow-lg hover:shadow-[#0A3269]/25 border-0 rounded-xl py-6 transition-all"
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
              className="rounded-xl border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 justify-center pt-2">
            <Shield className="w-3 h-3" />
            <span>All documents are encrypted and securely stored</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;