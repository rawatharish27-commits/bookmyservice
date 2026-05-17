'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Send,
  FileText,
  Heart,
  MessageSquare,
} from 'lucide-react';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Noida', 'Gurgaon', 'Indore', 'Bhopal', 'Coimbatore',
];

const EXPERIENCE_OPTIONS = [
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5+ years',
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function JoinLocalAdminPage() {
  const { navigate } = useApp();
  const { mutate, loading } = useApiMutation();
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    area: '',
    experience: '',
    motivation: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name || !form.email || !form.phone || !form.city || !form.area || !form.experience || !form.motivation) {
      setFormError('All fields are required');
      return;
    }

    try {
      await mutate('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: 'Local Admin Application',
          message: `Phone: ${form.phone}\nCity: ${form.city}\nArea/Pincode: ${form.area}\nExperience: ${form.experience}\nMotivation: ${form.motivation}\nResume: ${resumeFile?.name || 'Not uploaded'}`,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit application');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('home')} className="cursor-pointer">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-[#2d5a8e]">Join as Local Admin</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e] p-10 sm:p-14"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-white/5" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
        </div>
        <div className="relative text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
          >
            <ShieldCheck className="size-7 text-white" />
          </motion.div>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
            Join as <span className="text-sky-300">Local Admin</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-sky-100">
            Be the bridge between your community and quality services. Oversee local operations, verify providers, and ensure customer satisfaction in your neighborhood.
          </p>
        </div>
      </motion.div>

      {/* Form Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="overflow-hidden rounded-2xl border-0 shadow-lg">
            <div className="h-1.5 bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e]" />
            <div className="bg-white p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-12 text-center"
                  >
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] text-white shadow-lg">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0a1628]">Application Submitted!</h3>
                    <p className="mt-2 text-muted-foreground">
                      Thank you for applying to be a Local Admin. We&apos;ll review your application and get back to you within 48 hours.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 rounded-xl border-[#2d5a8e] text-[#1e3a5f] hover:bg-sky-50"
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: '', email: '', phone: '', city: '', area: '', experience: '', motivation: '' });
                        setResumeFile(null);
                      }}
                    >
                      Submit Another Application
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="mb-6 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[#2d5a8e] hover:bg-sky-50 hover:text-[#1e3a5f]"
                        onClick={() => navigate('home')}
                      >
                        <ArrowLeft className="mr-1 size-4" /> Back
                      </Button>
                    </div>

                    <h2 className="text-xl font-bold text-[#0a1628]">Local Admin Application</h2>
                    <p className="text-sm text-muted-foreground">Fill out the form below to apply for the Local Admin position</p>

                    {/* Full Name & Email */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="la-name" className="text-sm font-medium">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="la-name"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 focus:border-[#2d5a8e] focus:bg-white focus:ring-[#2d5a8e]/30"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="la-email" className="text-sm font-medium">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="la-email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 focus:border-[#2d5a8e] focus:bg-white focus:ring-[#2d5a8e]/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone & City */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="la-phone" className="text-sm font-medium">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="la-phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 focus:border-[#2d5a8e] focus:bg-white focus:ring-[#2d5a8e]/30"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">City</Label>
                        <Select value={form.city} onValueChange={(v) => handleChange('city', v)}>
                          <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-gray-50/50 focus:border-[#2d5a8e] focus:ring-[#2d5a8e]/30">
                            <MapPin className="mr-2 size-4 text-muted-foreground" />
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_CITIES.map((city) => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Area/Pincode & Experience */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="la-area" className="text-sm font-medium">Area / Pincode</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="la-area"
                            placeholder="e.g. Andheri West, 400053"
                            value={form.area}
                            onChange={(e) => handleChange('area', e.target.value)}
                            className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 focus:border-[#2d5a8e] focus:bg-white focus:ring-[#2d5a8e]/30"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Experience</Label>
                        <Select value={form.experience} onValueChange={(v) => handleChange('experience', v)}>
                          <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-gray-50/50 focus:border-[#2d5a8e] focus:ring-[#2d5a8e]/30">
                            <Briefcase className="mr-2 size-4 text-muted-foreground" />
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPERIENCE_OPTIONS.map((exp) => (
                              <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Motivation Textarea */}
                    <div className="space-y-2">
                      <Label htmlFor="la-motivation" className="text-sm font-medium">Why do you want to be a Local Admin?</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Textarea
                          id="la-motivation"
                          placeholder="Tell us about your motivation, community involvement, and what makes you a great fit for this role..."
                          rows={4}
                          value={form.motivation}
                          onChange={(e) => handleChange('motivation', e.target.value)}
                          className="rounded-xl border-gray-200 bg-gray-50/50 pl-10 focus:border-[#2d5a8e] focus:bg-white focus:ring-[#2d5a8e]/30"
                        />
                      </div>
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Upload Resume / Documents</Label>
                      <div className="relative flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 transition-colors hover:border-[#2d5a8e]/50 hover:bg-sky-50/30">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                        <div className="text-center">
                          <Upload className="mx-auto size-8 text-[#2d5a8e]/60" />
                          <p className="mt-2 text-sm font-medium text-[#0a1628]">
                            {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, JPG up to 5MB</p>
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600"
                      >
                        <span className="flex size-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold">!</span>
                        {formError}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e] text-base font-medium text-white shadow-lg shadow-[#1e3a5f]/25 hover:from-[#0a1628] hover:via-[#1e3a5f] hover:to-[#2d5a8e]"
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                      <Send className="ml-2 size-4" />
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Benefits Card */}
          <div className="overflow-hidden rounded-2xl border-0 shadow-lg">
            <div className="h-1.5 bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e]" />
            <div className="bg-white p-6">
              <h3 className="mb-5 text-lg font-bold text-[#0a1628]">Why Become a Local Admin?</h3>
              <div className="space-y-4">
                {[
                  { icon: <ShieldCheck className="size-5" />, title: 'Community Leader', desc: 'Be the go-to person for local service quality', gradient: 'from-[#0a1628] to-[#1e3a5f]' },
                  { icon: <Heart className="size-5" />, title: 'Help Your Neighbors', desc: 'Ensure reliable services reach your community', gradient: 'from-[#1e3a5f] to-[#2d5a8e]' },
                  { icon: <Briefcase className="size-5" />, title: 'Earn Income', desc: 'Steady income from local booking commissions', gradient: 'from-[#2d5a8e] to-sky-500' },
                  { icon: <FileText className="size-5" />, title: 'Verify Providers', desc: 'Ensure only trusted providers serve your area', gradient: 'from-sky-500 to-sky-400' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-md`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0a1628]">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Requirements Card */}
          <div className="overflow-hidden rounded-2xl border-0 shadow-lg">
            <div className="bg-white p-6">
              <h3 className="mb-4 text-lg font-bold text-[#0a1628]">Requirements</h3>
              <ul className="space-y-3">
                {[
                  'Must be 18+ years old',
                  'Active in local community',
                  'Good knowledge of the area',
                  'Problem-solving mindset',
                  'Commitment to service quality',
                ].map((req) => (
                  <li key={req} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#2d5a8e]" />
                    <span className="text-sm text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
