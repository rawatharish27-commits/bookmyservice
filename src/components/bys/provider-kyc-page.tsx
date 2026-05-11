'use client';

import { useState, useEffect } from 'react';
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
        const res = await fetch('/api/kyc/status', {
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
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-48 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('provider-profile')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="mt-1 text-sm text-muted-foreground">Verify your identity to unlock all features</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 rounded-md p-3 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Status Display */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 p-6">
          {effectiveStatus === 'APPROVED' && (
            <>
              <CheckCircle2 className="size-12 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-700">Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Your identity has been verified{kycStatus?.verifiedAt ? ` on ${new Date(kycStatus.verifiedAt).toLocaleDateString()}` : ''}
                </p>
              </div>
            </>
          )}
          {effectiveStatus === 'PENDING' && (
            <>
              <Clock className="size-12 text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-700">Under Review</h3>
                <p className="text-sm text-muted-foreground">
                  We are reviewing your documents. This usually takes 1-2 business days.
                </p>
              </div>
            </>
          )}
          {effectiveStatus === 'REJECTED' && (
            <>
              <AlertCircle className="size-12 text-red-500" />
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
              <Shield className="size-12 text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold text-orange-700">Not Submitted</h3>
                <p className="text-sm text-muted-foreground">Complete KYC verification to unlock full provider features</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Form - show if not approved */}
      {effectiveStatus !== 'APPROVED' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-emerald-600" />
              {effectiveStatus === 'REJECTED' ? 'Resubmit Documents' : 'Submit Documents'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Number *</Label>
                <Input placeholder="Enter document number" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Document Front Image URL *</Label>
              <Input placeholder="Paste image URL for front of document" value={frontUrl} onChange={(e) => setFrontUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">Provide a URL to the front side of your document</p>
            </div>

            <div className="space-y-2">
              <Label>Document Back Image URL</Label>
              <Input placeholder="Paste image URL for back of document (optional)" value={backUrl} onChange={(e) => setBackUrl(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Selfie URL *</Label>
              <Input placeholder="Paste image URL for your selfie holding the document" value={selfieUrl} onChange={(e) => setSelfieUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">A clear selfie holding your document</p>
            </div>

            <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-center">
              <Upload className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                File upload will be available in a future update. For now, please provide image URLs.
              </p>
            </div>

            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
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
      )}
    </div>
  );
}
