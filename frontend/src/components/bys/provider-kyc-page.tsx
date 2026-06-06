import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, ArrowLeft, Upload, CheckCircle2, Clock, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { apiUrl } from '@/lib/api-url';
import { toast } from 'sonner';

interface KycStatus {
  status?: string;
  verificationStatus?: string;
  documentType?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt?: string;
  message?: string;
}

const DOC_TYPES = ['AADHAAR', 'PAN', 'DRIVING_LICENSE', 'PASSPORT'];

const DOC_LABELS: Record<string, string> = {
  AADHAAR: 'Aadhaar Card',
  PAN: 'PAN Card',
  DRIVING_LICENSE: 'Driving License',
  PASSPORT: 'Passport',
};

export function ProviderKycPage() {
  const { navigate } = useApp();
  const { token } = useAuth();
  const { mutate, loading } = useApiMutation();

  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [docType, setDocType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [selfiePreview, setSelfiePreview] = useState<string>('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(apiUrl('/api/kyc/status'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setKycStatus(data);
        }
      } catch {
        // ignore
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, [token]);

  const handleFileChange = (type: 'front' | 'selfie') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'front') {
        setFrontFile(file);
        setFrontPreview(reader.result as string);
      } else {
        setSelfieFile(file);
        setSelfiePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!docType || !docNumber) {
      setMessage('Please fill in document type and number');
      return;
    }
    if (!frontFile && !frontPreview) {
      setMessage('Please upload the front of your document');
      return;
    }
    if (!selfieFile && !selfiePreview) {
      setMessage('Please upload a selfie holding your document');
      return;
    }

    setUploading(true);
    try {
      // Convert files to base64 for upload
      let documentFront = frontPreview;
      let selfie = selfiePreview;

      if (frontFile) {
        documentFront = await fileToBase64(frontFile);
      }
      if (selfieFile) {
        selfie = await fileToBase64(selfieFile);
      }

      // Upload KYC documents via the upload endpoint
      const res = await fetch(apiUrl('/api/upload/kyc'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentFront,
          selfie,
          documentType: docType,
          documentNumber: docNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Also submit KYC status
      await mutate('/api/kyc/submit', {
        method: 'POST',
        body: JSON.stringify({
          documentType: docType,
          documentNumber: docNumber,
          documentFrontUrl: data.documentFrontUrl || '/uploaded',
          selfieUrl: data.selfieUrl || '/uploaded',
        }),
      });

      setKycStatus({ verificationStatus: 'PENDING', ...data });
      setMessage('KYC submitted successfully! Documents are under review.');
      toast.success('KYC documents uploaded successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Submission failed';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const effectiveStatus = kycStatus?.verificationStatus || kycStatus?.status || 'NOT_SUBMITTED';

  if (loadingStatus) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-xl bg-muted/50" />
          <div className="h-48 rounded-2xl bg-muted/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate('provider-profile')} className="rounded-xl hover:bg-[#FFD54F]/5">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="mt-1 text-sm text-muted-foreground">Verify your identity to unlock all features</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 rounded-xl p-3 text-sm border ${
              message.includes('success')
                ? 'bg-[#FFD54F]/5 text-[#132D5E] border-[#FFD54F]/20'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {message.includes('success') && <CheckCircle2 className="mr-2 inline size-4" />}
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6 overflow-hidden rounded-2xl border-0 shadow-sm">
          <div className={`h-1.5 ${
            effectiveStatus === 'APPROVED' ? 'bg-gradient-to-r from-[#FFD54F] to-[#E0B84C]' :
            effectiveStatus === 'PENDING' ? 'bg-gradient-to-r from-[#F2C94C] to-[#E0B84C]' :
            effectiveStatus === 'REJECTED' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
            'bg-gradient-to-r from-[#E0B84C] to-[#FFD54F]'
          }`} />
          <CardContent className="flex items-center gap-4 p-6">
            {effectiveStatus === 'APPROVED' && (
              <>
                <div className="flex size-14 items-center justify-center rounded-xl bg-[#FFD54F]/10">
                  <CheckCircle2 className="size-7 text-[#E0B84C]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#132D5E]">Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Your identity has been verified{kycStatus?.verifiedAt ? ` on ${new Date(kycStatus.verifiedAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </>
            )}
            {effectiveStatus === 'PENDING' && (
              <>
                <div className="flex size-14 items-center justify-center rounded-xl bg-[#FFD54F]/10">
                  <Clock className="size-7 text-[#FFD54F]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#132D5E]">Under Review</h3>
                  <p className="text-sm text-muted-foreground">
                    We are reviewing your documents. This usually takes 1-2 business days.
                  </p>
                </div>
              </>
            )}
            {effectiveStatus === 'REJECTED' && (
              <>
                <div className="flex size-14 items-center justify-center rounded-xl bg-red-100">
                  <AlertCircle className="size-7 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700">Rejected</h3>
                  <p className="text-sm text-muted-foreground">
                    {kycStatus?.rejectionReason || 'Your documents were not accepted. Please resubmit.'}
                  </p>
                </div>
              </>
            )}
            {effectiveStatus === 'NOT_SUBMITTED' && (
              <>
                <div className="flex size-14 items-center justify-center rounded-xl bg-[#FFD54F]/10">
                  <Shield className="size-7 text-[#E0B84C]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#FFD54F]">Not Submitted</h3>
                  <p className="text-sm text-muted-foreground">Complete KYC verification to unlock full provider features</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Form */}
      {effectiveStatus !== 'APPROVED' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-[#FFD54F] via-[#E0B84C] to-[#FFD54F]" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F] to-[#E0B84C]">
                  <Shield className="size-4 text-white" />
                </div>
                {effectiveStatus === 'REJECTED' ? 'Resubmit Documents' : 'Submit Documents'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Document Type *</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {DOC_LABELS[t] || t.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Document Number *</Label>
                  <Input placeholder="Enter document number" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="rounded-xl h-11" />
                </div>
              </div>

              <Separator />

              {/* Document Front Image Upload */}
              <div className="space-y-2">
                <Label>Document Front Image *</Label>
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange('front')}
                />
                {frontPreview ? (
                  <div className="relative rounded-xl border-2 border-[#FFD54F]/20 overflow-hidden">
                    <img src={frontPreview} alt="Document front" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => { setFrontFile(null); setFrontPreview(''); }}
                      className="absolute top-2 right-2 rounded-lg bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => frontInputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#FFD54F]/20 bg-[#FFD54F]/5 p-6 transition-all hover:border-[#FFD54F] hover:bg-[#FFD54F]/5"
                  >
                    <Upload className="size-8 text-[#FFD54F]" />
                    <span className="text-sm font-medium text-[#132D5E]">Click to upload document front</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                  </button>
                )}
              </div>

              {/* Selfie Upload */}
              <div className="space-y-2">
                <Label>Selfie Holding Document *</Label>
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange('selfie')}
                />
                {selfiePreview ? (
                  <div className="relative rounded-xl border-2 border-[#FFD54F]/20 overflow-hidden">
                    <img src={selfiePreview} alt="Selfie with document" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => { setSelfieFile(null); setSelfiePreview(''); }}
                      className="absolute top-2 right-2 rounded-lg bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => selfieInputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#FFD54F]/20 bg-[#FFD54F]/5 p-6 transition-all hover:border-[#FFD54F] hover:bg-[#FFD54F]/5"
                  >
                    <Upload className="size-8 text-[#FFD54F]" />
                    <span className="text-sm font-medium text-[#132D5E]">Click to upload selfie with document</span>
                    <span className="text-xs text-muted-foreground">A clear selfie holding your document</span>
                  </button>
                )}
              </div>

              <Button
                className="shimmer w-full bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#E0B84C]/25 h-11 rounded-xl"
                onClick={handleSubmit}
                disabled={uploading || loading}
              >
                {uploading || loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 size-4" />
                    Submit KYC
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
