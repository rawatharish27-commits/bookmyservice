'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Wrench,
  MapPin,
  Building2,
  Smartphone,
  Navigation,
  Save,
  Loader2,
  CheckCircle2,
  Shield,
  CircleDollarSign,
  Clock,
  Phone,
  Mail,
  X,
  Plus,
} from 'lucide-react';

/* ---------- types ---------- */
interface TechnicianProfileData {
  id: string;
  skills: string[];
  serviceAreaRadius: number;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  upiId: string;
  isAvailable: boolean;
  currentLocation: {
    lat: number;
    lng: number;
  } | null;
  serviceAreaPincodes: string[];
  specialization: string;
  experienceYears: number;
  rating: number;
  completedJobs: number;
}

/* ---------- animation ---------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

/* ---------- Inner Form Component ---------- */
function ProfileForm({
  data,
  user,
  saving,
  saveSuccess,
  onSave,
  onRefetch,
}: {
  data: TechnicianProfileData;
  user: { name?: string; email?: string; phone?: string } | null;
  saving: boolean;
  saveSuccess: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  onRefetch: () => void;
}) {
  const [isAvailable, setIsAvailable] = useState(data.isAvailable ?? false);
  const [skills, setSkills] = useState<string[]>(data.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [serviceAreaRadius, setServiceAreaRadius] = useState(String(data.serviceAreaRadius || 10));
  const [upiId, setUpiId] = useState(data.upiId || '');
  const [bankName, setBankName] = useState(data.bankDetails?.bankName || '');
  const [accountName, setAccountName] = useState(data.bankDetails?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(data.bankDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(data.bankDetails?.ifscCode || '');
  const [pincodes, setPincodes] = useState((data.serviceAreaPincodes || []).join(', '));
  const [newPincode, setNewPincode] = useState('');
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const { mutate } = useApiMutation();

  const handleSave = useCallback(async () => {
    await onSave({
      isAvailable,
      skills,
      serviceAreaRadius: parseInt(serviceAreaRadius),
      upiId,
      bankDetails: { bankName, accountName, accountNumber, ifscCode },
      serviceAreaPincodes: pincodes.split(',').map((p) => p.trim()).filter(Boolean),
    });
  }, [isAvailable, skills, serviceAreaRadius, upiId, bankName, accountName, accountNumber, ifscCode, pincodes, onSave]);

  const handleUpdateLocation = useCallback(() => {
    setUpdatingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await mutate('/api/technician/profile', {
              method: 'PATCH',
              body: JSON.stringify({
                currentLocation: { lat: position.coords.latitude, lng: position.coords.longitude },
              }),
            });
            onRefetch();
          } catch {
            // Error handled by useApiMutation
          } finally {
            setUpdatingLocation(false);
          }
        },
        () => {
          setUpdatingLocation(false);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setUpdatingLocation(false);
      alert('Geolocation is not supported by your browser.');
    }
  }, [mutate, onRefetch]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addPincode = () => {
    const trimmed = newPincode.trim();
    if (trimmed && /^\d{6}$/.test(trimmed)) {
      const currentPincodes = pincodes.split(',').map((p) => p.trim()).filter(Boolean);
      if (!currentPincodes.includes(trimmed)) {
        setPincodes([...currentPincodes, trimmed].join(', '));
        setNewPincode('');
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your technician profile and preferences</p>
        </div>
        <Button
          className="self-start rounded-xl bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#E0B84C]/25"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle2 className="mr-2 size-4" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {saveSuccess ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </motion.div>

      {/* Profile Overview Card */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm mb-6">
          <div className="h-2 bg-gradient-to-r from-[#FFD54F] via-[#E0B84C] to-[#FFD54F]" />
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#E0B84C] shadow-lg shadow-[#E0B84C]/25">
                  <User className="size-8 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{user?.name || 'Technician'}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="border-[#FFD54F]/20 bg-[#FFD54F]/5 text-[#132D5E] text-xs">
                      {data?.specialization || 'Technician'}
                    </Badge>
                    {data?.rating ? (
                      <Badge variant="outline" className="border-[#FFD54F]/20 bg-[#FFD54F]/5 text-[#132D5E] text-xs gap-1">
                        ⭐ {data.rating.toFixed(1)}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              {/* Availability Toggle */}
              <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                <div className={`flex size-8 items-center justify-center rounded-lg ${
                  isAvailable ? 'bg-[#FFD54F]/10 text-[#FFD54F]' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Clock className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Availability</span>
                  <span className={`text-sm font-semibold ${isAvailable ? 'text-[#FFD54F]' : 'text-gray-500'}`}>
                    {isAvailable ? 'Available' : 'Offline'}
                  </span>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                  className="data-[state=checked]:bg-[#E0B84C]"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#FFD54F]/5 p-3 text-center">
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="mt-1 text-lg font-bold text-[#132D5E]">{data?.experienceYears || 0} yrs</p>
              </div>
              <div className="rounded-xl bg-[#FFD54F]/5 p-3 text-center">
                <p className="text-xs text-muted-foreground">Jobs Done</p>
                <p className="mt-1 text-lg font-bold text-[#132D5E]">{data?.completedJobs || 0}</p>
              </div>
              <div className="rounded-xl bg-[#FFD54F]/5 p-3 text-center">
                <p className="text-xs text-muted-foreground">Service Radius</p>
                <p className="mt-1 text-lg font-bold text-[#D4A017]">{serviceAreaRadius} km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Sections */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        {/* Skills Section */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#FFD54F]/5 to-[#FFD54F]/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Wrench className="size-5 text-[#FFD54F]" />
                Skills & Specializations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill) => (
                  <Badge key={skill} className="bg-[#FFD54F]/5 text-[#132D5E] border-[#FFD54F]/20 gap-1.5 px-3 py-1.5 text-sm">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 rounded-full p-0.5 hover:bg-[#FFD54F]/20 transition-colors">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet</p>}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., Air Conditioner, Plumber)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="rounded-xl flex-1"
                />
                <Button variant="outline" onClick={addSkill} disabled={!newSkill.trim()} className="rounded-xl border-[#FFD54F]/20 text-[#132D5E] hover:bg-[#FFD54F]/5">
                  <Plus className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Service Area Section */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#FFD54F]/5 to-[#FFD54F]/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <MapPin className="size-5 text-[#FFD54F]" />
                Service Area
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Service Area Radius (km)</Label>
                <div className="flex items-center gap-3">
                  <Input type="number" value={serviceAreaRadius} onChange={(e) => setServiceAreaRadius(e.target.value)} className="rounded-xl max-w-32" min={1} max={100} />
                  <span className="text-sm text-muted-foreground">kilometers from your location</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Location</Label>
                <div className="flex items-center gap-3">
                  {data?.currentLocation ? (
                    <div className="flex-1 rounded-xl bg-[#FFD54F]/5 p-3">
                      <p className="text-sm text-[#132D5E] font-medium">
                        📍 {data.currentLocation.lat.toFixed(4)}, {data.currentLocation.lng.toFixed(4)}
                      </p>
                      <p className="text-xs text-[#FFD54F]/70 mt-0.5">Location is active</p>
                    </div>
                  ) : (
                    <div className="flex-1 rounded-xl bg-[#FFD54F]/5 p-3">
                      <p className="text-sm text-[#132D5E] font-medium">Location not set</p>
                      <p className="text-xs text-[#FFD54F]/70 mt-0.5">Update your location to receive nearby jobs</p>
                    </div>
                  )}
                  <Button variant="outline" onClick={handleUpdateLocation} disabled={updatingLocation} className="rounded-xl shrink-0 border-[#FFD54F]/20 text-[#132D5E] hover:bg-[#FFD54F]/5">
                    {updatingLocation ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Navigation className="mr-2 size-4" />}
                    {updatingLocation ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Service Area Pincodes</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit pincode"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPincode())}
                    className="rounded-xl max-w-40"
                  />
                  <Button variant="outline" onClick={addPincode} disabled={!/^\d{6}$/.test(newPincode)} className="rounded-xl border-[#FFD54F]/20 text-[#132D5E] hover:bg-[#FFD54F]/5">
                    <Plus className="size-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Comma-separated pincodes (e.g., 110001, 110002, 110003)"
                  value={pincodes}
                  onChange={(e) => setPincodes(e.target.value)}
                  className="rounded-xl mt-2"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">Enter pincodes separated by commas where you provide services</p>
                {pincodes && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {pincodes.split(',').map((p) => p.trim()).filter(Boolean).map((pin, idx) => (
                      <Badge key={idx} variant="outline" className="border-[#FFD54F]/20 bg-[#FFD54F]/5 text-[#132D5E] text-xs">
                        <MapPin className="size-3 mr-1" />{pin}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bank Details Section */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#FFD54F]/5 to-[#FFD54F]/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Building2 className="size-5 text-[#FFD54F]" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5"><Building2 className="size-3.5 text-muted-foreground" />Bank Name</Label>
                  <Input placeholder="Enter bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5"><Shield className="size-3.5 text-muted-foreground" />Account Holder Name</Label>
                  <Input placeholder="Enter account holder name" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5"><CircleDollarSign className="size-3.5 text-muted-foreground" />Account Number</Label>
                  <Input placeholder="Enter account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5"><Shield className="size-3.5 text-muted-foreground" />IFSC Code</Label>
                  <Input placeholder="Enter IFSC code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} className="rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* UPI Section */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#FFD54F]/5 to-[#FFD54F]/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Smartphone className="size-5 text-[#FFD54F]" />
                UPI Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2 max-w-md">
                <Label className="text-sm font-medium">UPI ID</Label>
                <Input placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="rounded-xl" />
                <p className="text-xs text-muted-foreground">Enter your UPI ID to receive instant payouts</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Info (Read-only) */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#FFD54F]/5 to-[#FFD54F]/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Phone className="size-5 text-[#FFD54F]" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                  <Mail className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
                  <Phone className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{user?.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Save Button (Bottom) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onRefetch} className="rounded-xl">Reset</Button>
        <Button className="rounded-xl bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#E0B84C]/25" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="mr-2 size-4" /> : <Save className="mr-2 size-4" />}
          {saveSuccess ? 'Saved!' : saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </motion.div>
    </div>
  );
}

/* ==================== MAIN COMPONENT ==================== */
export function TechnicianProfilePage() {
  const { user } = useAuth();
  const { data, loading, refetch } = useApi<TechnicianProfileData>('/api/technician/profile');
  const { mutate, loading: saving } = useApiMutation();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = useCallback(async (payload: Record<string, unknown>) => {
    try {
      await mutate('/api/technician/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      refetch();
    } catch {
      // Error handled by useApiMutation
    }
  }, [mutate, refetch]);

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProfileForm
      key={data.id}
      data={data}
      user={user}
      saving={saving}
      saveSuccess={saveSuccess}
      onSave={handleSave}
      onRefetch={refetch}
    />
  );
}
