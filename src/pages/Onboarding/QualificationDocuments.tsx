import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/layout/Layout';
import { Button } from '@/components/ui/button';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { Card } from '@/components/ui/card';
import {
	Upload,
	FileText,
	CheckCircle,
	X,
	Eye,
	Download,
	AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Uploader from '@/components/ui/uploader';
import { Input } from '@/components/ui/input';

interface UploadedFile {
	id: string;
	name: string;
	size: number;
	type: string;
	url: string;
	uploadedAt: Date;
	documentType: string;
}

const QualificationDocuments = ({ handleFileUpload, setUploadedDocs, setCurrentStep, uploadedDocs }: any) => {
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [uploading, setUploading] = useState<string | null>(null);

	const steps = [
		{ title: 'Agreements', completed: true, current: false },
		{ title: 'Main information', completed: true, current: false },
		{ title: 'Wallet address', completed: true, current: false },
		{ title: 'Upload documents', completed: false, current: true },
	];

	const requiredDocuments = [
		{
			id: 'identity',
			name: 'Identity Document (Passport or ID Card)',
			description: 'Required',
			acceptedTypes: [
				'image/jpeg',
				'image/png',
				'image/jpg',
				'application/pdf',
			],
			maxSize: 10 * 1024 * 1024, // 10MB
		},
		{
			id: 'address',
			name: 'Proof of Address',
			description: 'Required',
			acceptedTypes: [
				'image/jpeg',
				'image/png',
				'image/jpg',
				'application/pdf',
			],
			maxSize: 10 * 1024 * 1024, // 10MB
		},
		{
			id: 'bank',
			name: 'Bank Statement',
			description: 'Required',
			acceptedTypes: [
				'image/jpeg',
				'image/png',
				'image/jpg',
				'application/pdf',
			],
			maxSize: 10 * 1024 * 1024, // 10MB
		},
		{
			id: 'funds',
			name: 'Source of Funds Documentation',
			description: 'Required',
			acceptedTypes: [
				'image/jpeg',
				'image/png',
				'image/jpg',
				'application/pdf',
			],
			maxSize: 10 * 1024 * 1024, // 10MB
		},
	];

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const validateFile = (
		file: File,
		documentType: string
	): { valid: boolean; error?: string } => {
		const doc = requiredDocuments.find(d => d.id === documentType);
		if (!doc) return { valid: false, error: 'Invalid document type' };

		// Check file size
		if (file.size > doc.maxSize) {
			return {
				valid: false,
				error: `File size must be less than ${formatFileSize(doc.maxSize)}`,
			};
		}

		// Check file type
		if (!doc.acceptedTypes.includes(file.type)) {
			return {
				valid: false,
				error: `File type not supported. Accepted types: ${doc.acceptedTypes.join(', ')}`,
			};
		}

		return { valid: true };
	};

	const handleFileUploadLocal = async (documentType: string) => {
		if (fileInputRef.current) {
			fileInputRef.current.setAttribute('data-document-type', documentType);
			fileInputRef.current.click();
      handleFileUpload(documentType)
		}
	};

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		const documentType = event.target.getAttribute('data-document-type');
    handleFileUploadLocal(documentType!)
		if (!file || !documentType) return;

		// Validate file
		const validation = validateFile(file, documentType);
		if (!validation.valid) {
			toast.error(validation.error);
			return;
		}

		// Check if document type already has a file
		const existingFile = uploadedFiles.find(
			f => f.documentType === documentType
		);
		if (existingFile) {
			toast.error(
				'A file for this document type already exists. Please remove it first.'
			);
			return;
		}

		setUploading(documentType);

		try {
			// Simulate file upload (replace with actual upload logic)
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Create file URL for preview
			const fileUrl = URL.createObjectURL(file);

			const uploadedFile: UploadedFile = {
				id: `${documentType}-${Date.now()}`,
				name: file.name,
				size: file.size,
				type: file.type,
				url: fileUrl,
				uploadedAt: new Date(),
				documentType,
			};

			const totalUploaded = uploadedFiles.length + 1;
			setUploadedFiles(prev => [...prev, uploadedFile]);
			// setUploadedDocs((prev:any)=>[...prev, uploadedFile?.documentType]);
			// setCurrentStep(totalUploaded);

			toast.success(`${file.name} uploaded successfully`);
		} catch (error) {
			toast.error('Failed to upload file. Please try again.');
		} finally {
			setUploading(null);
		}

		// Reset input
		event.target.value = '';
	};

	const removeFile = (fileId: string) => {
		const file = uploadedFiles.find(f => f.id === fileId);
		if (file) {
			URL.revokeObjectURL(file.url); // Clean up object URL
			setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
			// setUploadedDocs((prev:any)=>prev.filter((doc:any)=>doc !== file?.documentType));
			toast.success('File removed');
		}
	};

	const previewFile = (file: UploadedFile) => {
		if (file.type.startsWith('image/')) {
			window.open(file.url, '_blank');
		} else {
			// For PDFs, you might want to use a PDF viewer
			window.open(file.url, '_blank');
		}
	};

	const downloadFile = (file: UploadedFile) => {
		const link = document.createElement('a');
		link.href = file.url;
		link.download = file.name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const getFileIcon = (fileType: string) => {
		if (fileType.startsWith('image/')) {
			return '🖼️';
		} else if (fileType === 'application/pdf') {
			return '📄';
		}
		return '📎';
	};
	const handleComplete = () => {
		navigate('/qualification/complete');
	};

	return (
		<div className="mx-auto p-8">
			<div className="mb-8 rounded-lg bg-purple-500 p-6 text-white">
				<h3 className="mb-2 font-medium">
					These are the documents specified by the Issuer as mandatory for your
					investor qualification process. Please proceed to upload the required
					documents.
				</h3>
				<div className="mt-4 flex items-center justify-between">
					<span className="text-sm">43 of 51</span>
					<div className="flex space-x-2">
						<Button variant="secondary" size="sm">
							←
						</Button>
						<Button variant="secondary" size="sm">
							→
						</Button>
					</div>
				</div>
			</div>

			<div className="mb-8 space-y-6">
				<div>
					<h3 className="mb-2 text-lg font-medium text-foreground">
						Required Documents
					</h3>
					<p className="mb-4 text-text-secondary">
						Please upload the following documents to complete your
						qualification. Accepted formats: JPG, PNG, PDF (Max 10MB each)
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-background p-8">
					{requiredDocuments.map(doc => {
						const uploadedFile = uploadedFiles.find(
							f => f.documentType === doc.id
						);
						const isUploading = uploading === doc.id;

						return (
							<Card key={doc.id} className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<FileText className="h-10 w-10 text-gray-400" />
										<div className="flex-1">
											<h4 className="font-medium text-foreground">{doc.name}</h4>
											<p className="text-sm text-gray-500">{doc.description}</p>
											{uploadedFile && (
												<div className="mt-2 flex items-center space-x-2">
													<span className="text-xs text-gray-400">
														{getFileIcon(uploadedFile.type)}{' '}
														{uploadedFile.name.slice(0, 10)}...
													</span>
													<span className="text-xs text-gray-400">
														({formatFileSize(uploadedFile.size)})
													</span>
													<Badge variant="secondary" className="text-xs">
														Uploaded{' '}
														{uploadedFile.uploadedAt.toLocaleDateString()}
													</Badge>
												</div>
											)}
										</div>
									</div>

									<div className="flex items-center space-x-2">
										{uploadedFile ? (
											<>
												<Button
													variant="outline"
													size="sm"
													onClick={() => previewFile(uploadedFile)}
												>
													<Eye className="mr-1 h-4 w-4" />
													Preview
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => downloadFile(uploadedFile)}
												>
													<Download className="mr-1 h-4 w-4" />
													Download
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => removeFile(uploadedFile.id)}
													className="text-red-600 hover:text-red-700"
												>
													<X className="mr-1 h-4 w-4" />
													Remove
												</Button>
											</>
										) : (
											<div className="flex items-center gap-2">

												{isUploading ? (
													<>
														<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-border border-t-blue-600" />
														Uploading...
													</>
												) : (
													<>

													<Input
												ref={fileInputRef}
													type="file"
													id="file"
													data-document-type={doc.id}
													className=""
													onChange={handleFileSelect} 
                          
                          
													accept=".jpg,.jpeg,.png,.pdf"
													/>

														<Upload className="mr-2 h-4 w-4" />
														Upload
													</>
												)}

											</div>
										)}
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Upload Progress Summary */}
			{uploadedFiles.length > 0 && (
				<div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<CheckCircle className="h-5 w-5 text-blue-600" />
							<span className="text-sm font-medium text-blue-900">
								Upload Progress: {uploadedFiles.length} of{' '}
								{requiredDocuments.length} documents uploaded
							</span>
						</div>
						<div className="h-2 w-32 rounded-full bg-blue-200">
							<div
								className="h-2 rounded-full bg-blue-600 transition-all duration-300"
								style={{
									width: `${(uploadedFiles.length / requiredDocuments.length) * 100}%`,
								}}
							/>
						</div>
					</div>
				</div>
			)}

			<div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
				<div className="flex items-start space-x-3">
					<AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
					<div>
						<p className="mb-1 text-sm font-medium text-yellow-800">
							Important Notes:
						</p>
						<ul className="space-y-1 text-sm text-yellow-800">
							<li>• All documents must be clear and legible</li>
							<li>• Identity documents must be valid and not expired</li>
							<li>• Proof of address must be recent (within 3 months)</li>
							<li>• Bank statements should show your name and address</li>
							<li>
								• At this stage, the Issuer can choose to proceed without
								activation or opt to activate one of the integrated third-party
								KYC solutions.
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				className="hidden"
				onChange={handleFileSelect}
				accept=".jpg,.jpeg,.png,.pdf"
			/>
		</div>
	);
};

export default QualificationDocuments;
