import { useState, useEffect } from 'react';
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
import { Shield, ArrowLeft, Upload, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { apiUrl } from '@/lib/api-url';

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
  const [frontUrl, setFrontUrl] = useState('');
  const [backUrl, setBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [message, setMessage] = useState('');

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

  const handleSubmit = async () => {
    if (!docType || !docNumber || !frontUrl || !selfieUrl) {
      setMessage('Please fill in all required fields');
      return;
    }
    try {
      const result = await mutate('/api/kyc/submit', {
        method: 'POST',
        body: JSON.stringify({
          documentType: docType,
          documentNumber: docNumber,
          documentFrontUrl: frontUrl,
          documentBackUrl: backUrl || undefined,
          selfieUrl,
        }),
      });
      setKycStatus({ verificationStatus: 'PENDING', ...result });
      setMessage('KYC submitted successfully');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Submission failed');
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
        <Button variant="ghost" size="icon" onClick={() => navigate('provider-profile')} className="rounded-xl hover:bg-emerald-50">
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
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
            effectiveStatus === 'APPROVED' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
            effectiveStatus === 'PENDING' ? 'bg-gradient-to-r from-cyan-400 to-blue-500' :
            effectiveStatus === 'REJECTED' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
            'bg-gradient-to-r from-sky-400 to-sky-500'
          }`} />
          <CardContent className="flex items-center gap-4 p-6">
            {effectiveStatus === 'APPROVED' && (
              <>
                <div className="flex size-14 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle2 className="size-7 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-700">Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Your identity has been verified{kycStatus?.verifiedAt ? ` on ${new Date(kycStatus.verifiedAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </>
            )}
            {effectiveStatus === 'PENDING' && (
              <>
                <div className="flex size-14 items-center justify-center rounded-xl bg-sky-100">
                  <Clock className="size-7 text-sky-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-sky-700">Under Review</h3>
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
                <div className="flex size-14 items-center justify-center rounded-xl bg-sky-100">
                  <Shield className="size-7 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-700">Not Submitted</h3>
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
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
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

              <div className="space-y-2">
                <Label>Document Front Image URL *</Label>
                <Input placeholder="Paste image URL for front of document" value={frontUrl} onChange={(e) => setFrontUrl(e.target.value)} className="rounded-xl h-11" />
                <p className="text-xs text-muted-foreground">Provide a URL to the front side of your document</p>
              </div>

              <div className="space-y-2">
                <Label>Document Back Image URL</Label>
                <Input placeholder="Paste image URL for back of document (optional)" value={backUrl} onChange={(e) => setBackUrl(e.target.value)} className="rounded-xl h-11" />
              </div>

              <div className="space-y-2">
                <Label>Selfie URL *</Label>
                <Input placeholder="Paste image URL for your selfie holding the document" value={selfieUrl} onChange={(e) => setSelfieUrl(e.target.value)} className="rounded-xl h-11" />
                <p className="text-xs text-muted-foreground">A clear selfie holding your document</p>
              </div>

              <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-center">
                <Upload className="mx-auto size-6 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  File upload will be available in a future update. For now, please provide image URLs.
                </p>
              </div>

              <Button
                className="shimmer w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 h-11 rounded-xl"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 size-4 animate-spin" />
                    Submitting...
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
