import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Globe,
  Rss,
  Camera,
  Link2,
  MessageSquare,
  ArrowRight,
  Headphones,
} from 'lucide-react';
import { COMPANY_INFO } from '@/config/company';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function ContactPage() {
  const { navigate } = useApp();
  const { mutate, loading } = useApiMutation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name || !form.email || !form.subject || !form.message) {
      setFormError('All fields are required');
      return;
    }

    try {
      await mutate('/api/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit');
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
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
              <BreadcrumbPage className="text-gradient-ocean font-semibold">Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1F44] via-[#132D5E] to-[#FFD54F] p-10 sm:p-14"
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
            <MessageSquare className="size-7 text-white" />
          </motion.div>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
            Get in <span className="text-white/80">Touch</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-white/70">
            Have a question or need help? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </motion.div>

      {/* Contact Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            icon: <MapPin className="size-6" />,
            title: 'Visit Us',
            detail: COMPANY_INFO.address,
            gradient: 'from-[#0A1F44] to-[#132D5E]',
            action: null,
          },
          {
            icon: <Phone className="size-6" />,
            title: 'Call Us',
            detail: COMPANY_INFO.phone,
            gradient: 'from-[#0A1F44] to-[#132D5E]',
            action: `tel:${COMPANY_INFO.phone}`,
          },
          {
            icon: <Mail className="size-6" />,
            title: 'Email Us',
            detail: COMPANY_INFO.email,
            gradient: 'from-[#D4A017] to-[#FFD54F]',
            action: `mailto:${COMPANY_INFO.email}`,
          },
          {
            icon: <Headphones className="size-6" />,
            title: 'Support Hours',
            detail: COMPANY_INFO.supportHours,
            gradient: 'from-[#132D5E] to-[#E0B84C]',
            action: null,
          },
        ].map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
          >
            {item.action ? (
              <a href={item.action} className="block">
                <div className="glass-emerald group rounded-2xl p-5 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className={`mb-3 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{item.detail}</p>
                </div>
              </a>
            ) : (
              <div className="glass-emerald group rounded-2xl p-5 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`mb-3 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{item.detail}</p>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content - Form + Info */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="overflow-hidden rounded-2xl border-0 glass-emerald shadow-lg">
            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F]" />

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-12 text-center"
                  >
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A1F44] to-[#132D5E] text-white shadow-lg">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Message Sent!</h3>
                    <p className="mt-2 text-muted-foreground">
                      Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 rounded-xl border-[#FFD54F] text-[#132D5E] hover:bg-[#FFD54F]/5"
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: '', email: '', subject: '', message: '' });
                      }}
                    >
                      Send Another Message
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
                    <h2 className="mb-1 text-xl font-bold text-gray-900">Send us a Message</h2>
                    <p className="mb-6 text-sm text-muted-foreground">Fill out the form below and we&apos;ll get back to you</p>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-[#FFD54F] focus:bg-white focus:ring-[#FFD54F]/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-[#FFD54F] focus:bg-white focus:ring-[#FFD54F]/30"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What is this about?"
                        value={form.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-[#FFD54F] focus:bg-white focus:ring-[#FFD54F]/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us how we can help..."
                        rows={5}
                        value={form.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        className="rounded-xl border-gray-200 bg-gray-50/50 focus:border-[#FFD54F] focus:bg-white focus:ring-[#FFD54F]/30"
                      />
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
                      className="shimmer h-12 w-full rounded-xl bg-gradient-to-r from-[#FFD54F] to-[#E0B84C] text-base font-medium text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 hover:from-[#E0B84C] hover:to-[#FFD54F]"
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                      <Send className="ml-2 size-4" />
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6 lg:col-span-2"
        >
          {/* Contact Details Card */}
          <div className="overflow-hidden rounded-2xl border-0 glass-emerald shadow-lg">
            <div className="h-1.5 bg-gradient-to-r from-[#0A1F44] to-[#132D5E]" />
            <div className="p-6">
              <h3 className="mb-5 text-lg font-bold text-gray-900">Contact Details</h3>
              <div className="space-y-5">
                {[
                  {
                    icon: <MapPin className="size-5" />,
                    label: 'Address',
                    value: COMPANY_INFO.address,
                    gradient: 'from-[#0A1F44] to-[#132D5E]',
                  },
                  {
                    icon: <Phone className="size-5" />,
                    label: 'Phone',
                    value: COMPANY_INFO.phone,
                    href: `tel:${COMPANY_INFO.phone}`,
                    gradient: 'from-[#0A1F44] to-[#132D5E]',
                  },
                  {
                    icon: <Mail className="size-5" />,
                    label: 'Email',
                    value: COMPANY_INFO.email,
                    href: `mailto:${COMPANY_INFO.email}`,
                    gradient: 'from-[#D4A017] to-[#FFD54F]',
                  },
                  {
                    icon: <Clock className="size-5" />,
                    label: 'Business Hours',
                    value: COMPANY_INFO.supportHours,
                    gradient: 'from-[#132D5E] to-[#E0B84C]',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-md`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-[#0A1F44] transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Media Card */}
          <div className="overflow-hidden rounded-2xl border-0 glass-emerald shadow-lg">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Follow Us</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: <Globe className="size-5" />, label: 'Facebook', color: 'hover:bg-[#FFD54F]/5 hover:text-[#0A1F44]' },
                  { icon: <Rss className="size-5" />, label: 'Twitter', color: 'hover:bg-[#FFD54F]/5 hover:text-[#0A1F44]' },
                  { icon: <Camera className="size-5" />, label: 'Instagram', color: 'hover:bg-pink-50 hover:text-pink-600' },
                  { icon: <Link2 className="size-5" />, label: 'LinkedIn', color: 'hover:bg-[#FFD54F]/5 hover:text-[#0A1F44]' },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex size-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all duration-300 ${social.color}`}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="overflow-hidden rounded-2xl border-0 glass-emerald shadow-lg">
            <div className="relative flex aspect-video items-center justify-center bg-white">
              {/* Map grid lines */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
                  linear-gradient(to right, #FFD54F 1px, transparent 1px),
                  linear-gradient(to bottom, #FFD54F 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
              }} />
              <div className="relative text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A1F44] to-[#132D5E] text-white shadow-lg">
                  <MapPin className="size-7" />
                </div>
                <p className="font-semibold text-[#132D5E]">Our Location</p>
                <p className="mt-1 text-xs text-[#132D5E]/70">{COMPANY_INFO.address}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
