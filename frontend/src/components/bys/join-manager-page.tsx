'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { useRazorpay } from '@/hooks/use-razorpay';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Shield,
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
  AlertTriangle,
  Scale,
  CreditCard,
  Clock,
  HelpCircle,
  ChevronRight,
  Eye,
  IndianRupee,
} from 'lucide-react';

const APPLICATION_FEE = 100; // ₹100 for Area Manager

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

const FAQ_ITEMS = [
  {
    question: 'What is the Area Manager role?',
    answer: 'An Area Manager oversees all service operations in a designated city or area. You manage service providers, ensure quality standards, handle customer escalations, and drive business growth in your territory. You earn commissions on every booking completed in your area.',
  },
  {
    question: 'How much is the application fee?',
    answer: `The application fee for the Area Manager position is ₹${APPLICATION_FEE}. This fee covers the administrative cost of processing your application, background verification, and onboarding setup.`,
  },
  {
    question: 'Is the application fee refundable?',
    answer: 'No. The application fee is strictly non-refundable under all circumstances, whether your application is approved, rejected, or withdrawn. This is clearly stated in our Terms & Conditions and is in compliance with the Indian Contract Act, 1872.',
  },
  {
    question: 'What does the selection process involve?',
    answer: 'The selection process involves evaluation of live tasks and performance assessment. We review your application, conduct background checks, assess your local network and communication skills, and evaluate your performance on assigned tasks. The process is competitive and merit-based.',
  },
  {
    question: 'How long does the selection process take?',
    answer: 'The selection process typically takes 7-14 business days from the date of application submission. However, this timeline may vary depending on the number of applications and the complexity of verification. You will be notified via email about the status of your application.',
  },
  {
    question: 'What if I\'m not selected?',
    answer: 'If you are not selected, you will be notified via email. The application fee will NOT be refunded. However, you are welcome to re-apply after 90 days if you believe your circumstances or qualifications have improved.',
  },
  {
    question: 'Can I apply again if not selected?',
    answer: 'Yes, you can re-apply after a waiting period of 90 days from the date of rejection. Each new application requires a fresh application fee payment. Previous application history may be considered during the evaluation process.',
  },
  {
    question: 'Is this a full-time job?',
    answer: 'No. The Area Manager role is an independent contractor arrangement, not an employment relationship. You are free to manage your own schedule, but we expect a minimum commitment of hours to ensure quality service delivery in your area. There is no employer-employee relationship created by this arrangement.',
  },
  {
    question: 'What are the earning opportunities?',
    answer: 'As an Area Manager, you earn a 3% commission on every booking in your designated area. Earnings depend on the volume of bookings in your territory. Top-performing Area Managers can earn substantial monthly income. Additional performance bonuses and incentives may also be available.',
  },
  {
    question: 'What happens after I\'m selected?',
    answer: 'After selection, you will undergo an onboarding process that includes training on our platform, operational guidelines, and quality standards. You will receive access to the Area Manager dashboard, be assigned your territory, and can start onboarding service providers in your area immediately.',
  },
];

const LEGAL_SECTIONS = [
  {
    title: '1. Application Fee & Payment Terms',
    content: [
      `The application fee for the Area Manager position is ₹${APPLICATION_FEE} (Indian Rupees One Hundred Only).`,
      'The fee is NON-REFUNDABLE under all circumstances, including but not limited to: application rejection, application withdrawal, or any other reason whatsoever.',
      'Payment of the fee does NOT guarantee selection. The fee is charged solely for administrative processing, background verification, and onboarding setup.',
      'The fee must be paid online through the Razorpay payment gateway at the time of application submission.',
    ],
  },
  {
    title: '2. Selection Process & Criteria',
    content: [
      'Selection is based on live tasks and performance evaluation. The company uses a comprehensive assessment framework.',
      'The company reserves the right to reject any application without assigning any reason whatsoever. No correspondence regarding rejection reasons will be entertained.',
      'The company may change the selection criteria at any time without prior notice to applicants.',
      'If not selected, the fee will NOT be refunded under any circumstances.',
    ],
  },
  {
    title: '3. Independent Contractor Relationship',
    content: [
      'No employment relationship is created by submitting this application or by subsequent selection. The role is strictly an independent contractor arrangement.',
      'The Area Manager is not an employee of the company and is not entitled to any employee benefits including but not limited to: provident fund, ESI, gratuity, leave, or any other statutory benefits.',
      'The Area Manager is solely responsible for their own tax liabilities and compliance with applicable laws.',
    ],
  },
  {
    title: '4. Application Accuracy & Integrity',
    content: [
      'All information provided in the application must be truthful and accurate. Any false, misleading, or fraudulent information will lead to immediate rejection and forfeiture of the application fee.',
      'The company reserves the right to verify all information provided and to reject applications based on discrepancies found during verification.',
    ],
  },
  {
    title: '5. Limitation of Liability',
    content: [
      'The company\'s total liability arising from or related to the application process is limited to the application fee amount (₹100) only.',
      'The company shall NOT be responsible for any civil court cases filed by applicants in connection with the application process, selection, or rejection.',
      'Under no circumstances shall the company be liable for any indirect, incidental, consequential, or punitive damages.',
    ],
  },
  {
    title: '6. Governing Law & Jurisdiction',
    content: [
      'This application and the terms herein are governed by and construed in accordance with the laws of India, including the Indian Contract Act, 1872 and the Consumer Protection Act, 2019.',
      'All disputes arising out of or in connection with this application shall be subject to the exclusive jurisdiction of the courts of Palwal, Haryana, India.',
      'The applicant hereby expressly consents to the jurisdiction of Palwal, Haryana courts for any legal proceedings.',
    ],
  },
  {
    title: '7. Amendments & Modifications',
    content: [
      'The company reserves the right to modify these terms and conditions at any time without prior notice.',
      'Continued engagement with the application process after modifications constitutes acceptance of the revised terms.',
      'It is the applicant\'s responsibility to review the current terms before submitting the application.',
    ],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

type Step = 'form' | 'payment' | 'success';

export function JoinManagerPage() {
  const { navigate } = useApp();
  const { mutate, loading } = useApiMutation();
  const { initiatePayment, isProcessing: isPaymentProcessing, error: paymentError } = useRazorpay();
  const [step, setStep] = useState<Step>('form');
  const [formError, setFormError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    area: '',
    experience: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name || !form.email || !form.phone || !form.city || !form.area || !form.experience) {
      setFormError('All fields are required');
      return;
    }

    if (!agreedToTerms) {
      setFormError('You must agree to the Terms & Conditions to proceed');
      return;
    }

    setStep('payment');
  };

  const handlePayment = async () => {
    try {
      const applicationId = `APP-AM-${Date.now()}`;
      const success = await initiatePayment({
        bookingId: applicationId,
        amount: APPLICATION_FEE * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: form.name,
        email: form.email,
        phone: form.phone,
      });

      if (success) {
        // Payment successful, now submit the application
        try {
          await mutate('/api/contact', {
            method: 'POST',
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              subject: 'Area Manager Application (Paid)',
              message: `Phone: ${form.phone}\nCity: ${form.city}\nArea/Pincode: ${form.area}\nExperience: ${form.experience}\nResume: ${resumeFile?.name || 'Not uploaded'}\nApplication Fee: ₹${APPLICATION_FEE} PAID\nPayment Reference: ${applicationId}`,
            }),
          });
          setStep('success');
        } catch (err) {
          setFormError(err instanceof Error ? err.message : 'Payment was successful but application submission failed. Please contact support.');
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Payment initiation failed. Please try again.');
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
              <BreadcrumbPage className="font-semibold text-[#2d5a8e]">Join as Area Manager</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e] p-10 sm:p-14"
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
            <Shield className="size-7 text-white" />
          </motion.div>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
            Join as <span className="text-sky-300">Area Manager</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-sky-100">
            Lead your city&apos;s service marketplace. Manage providers, drive growth, and earn commissions on every booking in your area.
          </p>
        </div>
      </motion.div>

      {/* Application Fee Notice */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-8 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm"
      >
        <div className="flex items-start gap-4 p-5 sm:p-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle className="size-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-900">Application Fee Required</h3>
            <p className="mt-1 text-sm text-amber-800">
              A non-refundable application fee of <span className="font-bold">₹{APPLICATION_FEE}</span> is required to submit your Area Manager application.
              This fee covers administrative processing, background verification, and onboarding setup.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">
                <IndianRupee className="size-3.5" /> Fee: ₹{APPLICATION_FEE}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                <AlertTriangle className="size-3.5" /> Non-Refundable
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">
                <CreditCard className="size-3.5" /> Online Payment Only
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Legal Terms & Conditions Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e]" />
        <div className="p-5 sm:p-6">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setTermsExpanded(!termsExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] text-white shadow-md">
                <Scale className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0a1628]">Terms & Conditions</h3>
                <p className="text-xs text-muted-foreground">Application terms as per Indian Contract Act 1872 & Consumer Protection Act 2019</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: termsExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="size-5 text-muted-foreground rotate-90" />
            </motion.div>
          </div>

          <AnimatePresence>
            {termsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-5 space-y-5">
                  <div className="rounded-xl bg-amber-50/80 border border-amber-100 p-4">
                    <p className="flex items-start gap-2 text-sm font-medium text-amber-900">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <span>
                        By proceeding with this application, you acknowledge that you have read, understood, and agree to be bound by the following terms and conditions. Please read them carefully before submitting your application.
                      </span>
                    </p>
                  </div>

                  {LEGAL_SECTIONS.map((section) => (
                    <div key={section.title} className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-[#0a1628]">
                        <ChevronRight className="size-4 text-[#2d5a8e]" />
                        {section.title}
                      </h4>
                      <ul className="ml-6 space-y-1.5">
                        {section.content.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#2d5a8e]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className="rounded-xl bg-red-50/80 border border-red-100 p-4">
                    <p className="flex items-start gap-2 text-sm font-semibold text-red-800">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <span>
                        Jurisdiction: All disputes are subject to Palwal, Haryana jurisdiction only. The company shall NOT be responsible for any civil court cases filed by applicants. Company liability is limited to the fee amount (₹{APPLICATION_FEE}) only.
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                {step === 'success' ? (
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
                      Thank you for applying to be an Area Manager. Your application fee of ₹{APPLICATION_FEE} has been received. We&apos;ll review your application and get back to you within 7-14 business days.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 rounded-xl border-[#2d5a8e] text-[#1e3a5f] hover:bg-sky-50"
                      onClick={() => {
                        setStep('form');
                        setForm({ name: '', email: '', phone: '', city: '', area: '', experience: '' });
                        setResumeFile(null);
                        setAgreedToTerms(false);
                      }}
                    >
                      Submit Another Application
                    </Button>
                  </motion.div>
                ) : step === 'payment' ? (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8"
                  >
                    <div className="mb-8 text-center">
                      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] text-white shadow-lg">
                        <CreditCard className="size-7" />
                      </div>
                      <h2 className="text-xl font-bold text-[#0a1628]">Pay Application Fee</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Complete the payment to submit your Area Manager application</p>
                    </div>

                    {/* Application Summary */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-5">
                      <h4 className="mb-3 text-sm font-bold text-[#0a1628]">Application Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name</span>
                          <span className="font-medium text-[#0a1628]">{form.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email</span>
                          <span className="font-medium text-[#0a1628]">{form.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="font-medium text-[#0a1628]">{form.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">City</span>
                          <span className="font-medium text-[#0a1628]">{form.city}</span>
                        </div>
                        <div className="h-px bg-gray-200 my-2" />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Position</span>
                          <span className="font-medium text-[#0a1628]">Area Manager</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-[#0a1628]">Application Fee</span>
                          <span className="text-lg font-bold text-[#2d5a8e]">₹{APPLICATION_FEE}</span>
                        </div>
                      </div>
                    </div>

                    {/* Non-refundable reminder */}
                    <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
                      <p className="flex items-start gap-2 text-sm text-amber-800">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <span className="font-medium">
                          This fee of ₹{APPLICATION_FEE} is NON-REFUNDABLE. Payment does not guarantee selection. By proceeding, you agree to the Terms & Conditions.
                        </span>
                      </p>
                    </div>

                    {paymentError && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600"
                      >
                        <span className="flex size-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold">!</span>
                        {paymentError}
                      </motion.p>
                    )}

                    {formError && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600"
                      >
                        <span className="flex size-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold">!</span>
                        {formError}
                      </motion.p>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 flex-1 rounded-xl border-[#2d5a8e] text-[#1e3a5f] hover:bg-sky-50"
                        onClick={() => {
                          setStep('form');
                          setFormError(null);
                        }}
                      >
                        <ArrowLeft className="mr-2 size-4" /> Back to Form
                      </Button>
                      <Button
                        type="button"
                        disabled={isPaymentProcessing}
                        onClick={handlePayment}
                        className="h-12 flex-1 rounded-xl bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e] text-base font-medium text-white shadow-lg shadow-[#1e3a5f]/25 hover:from-[#0a1628] hover:via-[#1e3a5f] hover:to-[#2d5a8e]"
                      >
                        {isPaymentProcessing ? 'Processing...' : `Pay ₹${APPLICATION_FEE}`}
                        <CreditCard className="ml-2 size-4" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleFormSubmit}
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

                    <h2 className="text-xl font-bold text-[#0a1628]">Area Manager Application</h2>
                    <p className="text-sm text-muted-foreground">Fill out the form below to apply for the Area Manager position</p>

                    {/* Full Name & Email */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 focus:border-[#2d5a8e] focus:bg-white focus:ring-[#2d5a8e]/30"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="email"
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
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 89011 72507"
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
                        <Label htmlFor="area" className="text-sm font-medium">Area / Pincode</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="area"
                            placeholder="e.g. Palwal, 121102"
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

                    {/* Terms & Conditions Checkbox */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms-agree"
                          checked={agreedToTerms}
                          onCheckedChange={(checked) => {
                            setAgreedToTerms(checked === true);
                            if (formError) setFormError(null);
                          }}
                          className="mt-0.5 data-[state=checked]:bg-[#2d5a8e] data-[state=checked]:border-[#2d5a8e]"
                        />
                        <div className="space-y-1">
                          <Label htmlFor="terms-agree" className="cursor-pointer text-sm font-medium leading-snug text-[#0a1628]">
                            I agree to the Terms & Conditions and understand the application fee of ₹{APPLICATION_FEE} is non-refundable
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            By checking this box, you confirm that you have read and agree to our Terms & Conditions, including that the application fee is non-refundable under all circumstances, as governed by the Indian Contract Act 1872 and Consumer Protection Act 2019, and disputes are subject to Palwal, Haryana jurisdiction.
                          </p>
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
                      {loading ? 'Processing...' : 'Proceed to Payment'}
                      <CreditCard className="ml-2 size-4" />
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
              <h3 className="mb-5 text-lg font-bold text-[#0a1628]">Why Become an Area Manager?</h3>
              <div className="space-y-4">
                {[
                  { icon: <Shield className="size-5" />, title: 'Lead Your City', desc: 'Manage all service operations in your designated area', gradient: 'from-[#0a1628] to-[#1e3a5f]' },
                  { icon: <Briefcase className="size-5" />, title: 'Earn Commissions', desc: '3% commission on every booking in your area', gradient: 'from-[#1e3a5f] to-[#2d5a8e]' },
                  { icon: <User className="size-5" />, title: 'Build Your Team', desc: 'Recruit and manage service providers', gradient: 'from-[#2d5a8e] to-sky-500' },
                  { icon: <FileText className="size-5" />, title: 'Flexible Hours', desc: 'Work on your own schedule with full support', gradient: 'from-sky-500 to-sky-400' },
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
                  'Must be 21+ years old',
                  'Strong local network',
                  'Basic smartphone & internet',
                  'Good communication skills',
                  'Passionate about service quality',
                ].map((req) => (
                  <li key={req} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#2d5a8e]" />
                    <span className="text-sm text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Application Process Card */}
          <div className="overflow-hidden rounded-2xl border-0 shadow-lg">
            <div className="bg-white p-6">
              <h3 className="mb-4 text-lg font-bold text-[#0a1628]">Application Process</h3>
              <div className="space-y-3">
                {[
                  { step: '1', label: 'Fill the application form', icon: <FileText className="size-4" /> },
                  { step: '2', label: `Pay ₹${APPLICATION_FEE} application fee`, icon: <CreditCard className="size-4" /> },
                  { step: '3', label: 'Application review & evaluation', icon: <Eye className="size-4" /> },
                  { step: '4', label: 'Selection & onboarding', icon: <CheckCircle2 className="size-4" /> },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2d5a8e]/10 text-[#2d5a8e]">
                      {item.icon}
                    </div>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12"
      >
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-[#0a1628] via-[#1e3a5f] to-[#2d5a8e]" />
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] text-white shadow-md">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0a1628]">Frequently Asked Questions</h3>
                <p className="text-sm text-muted-foreground">Find answers to common questions about the Area Manager role</p>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-sm font-semibold text-[#0a1628] hover:text-[#2d5a8e] hover:no-underline text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
