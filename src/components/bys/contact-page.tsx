'use client';

import React, { useState } from 'react';
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
  MessageCircle,
  Share2,
} from 'lucide-react';

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
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('home')} className="cursor-pointer">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contact</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Have a question or need help? We would love to hear from you. Send us a message and
          we will respond as soon as possible.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl">
            <CardContent className="p-6 sm:p-8">
              {submitted ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
                  <h3 className="mt-4 text-xl font-semibold">Message Sent!</h3>
                  <p className="mt-2 text-muted-foreground">
                    Thank you for contacting us. We will get back to you within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', subject: '', message: '' });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What is this about?"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help..."
                      rows={5}
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                    />
                  </div>

                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    size="lg"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                    <Send className="ml-2 size-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          {/* Contact Details */}
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      123 Service Street, Suite 100
                      <br />
                      San Francisco, CA 94102
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a
                      href="tel:+14155551234"
                      className="text-sm text-muted-foreground hover:text-emerald-600"
                    >
                      +1 (415) 555-1234
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a
                      href="mailto:hello@bookyourservice.com"
                      className="text-sm text-muted-foreground hover:text-emerald-600"
                    >
                      hello@bookyourservice.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Business Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Mon-Fri: 9:00 AM - 6:00 PM
                      <br />
                      Sat: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Follow Us</h3>
              <div className="flex gap-3">
                {[
                  { icon: <Globe className="size-4" />, label: 'Website' },
                  { icon: <MessageCircle className="size-4" />, label: 'Social' },
                  { icon: <Share2 className="size-4" />, label: 'Share' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-muted-foreground transition-colors hover:bg-emerald-100 hover:text-emerald-600"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card className="overflow-hidden rounded-xl">
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="text-center">
                <MapPin className="mx-auto size-8 text-emerald-400" />
                <p className="mt-2 text-sm font-medium text-emerald-600">Map View</p>
                <p className="text-xs text-muted-foreground">123 Service Street, SF</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
