import React, { useState } from 'react';
import { useApp, type Page } from '@/contexts/app-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Wrench,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Droplets,
  Zap,
  Wind,
  Send,
  ArrowUpRight,
  Heart,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface FooterLink {
  label: string;
  page: Page;
}

const aboutLinks: FooterLink[] = [
  { label: 'About Us', page: 'about' },
  { label: 'How It Works', page: 'how-it-works' },
  { label: 'FAQ', page: 'faq' },
  { label: 'Contact Us', page: 'contact' },
];

const quickLinks: FooterLink[] = [
  { label: 'Home', page: 'home' },
  { label: 'Categories', page: 'categories' },
  { label: 'Find Services', page: 'search' },
  { label: 'Become a Provider', page: 'register' },
];

const serviceLinks: { label: string; page: Page; icon: React.ReactNode }[] = [
  { label: 'Plumbing', page: 'categories', icon: <Droplets className="size-3.5" /> },
  { label: 'Electrical', page: 'categories', icon: <Zap className="size-3.5" /> },
  { label: 'AC & HVAC', page: 'categories', icon: <Wind className="size-3.5" /> },
];

const legalLinks: { label: string; page: Page }[] = [
  { label: 'Terms of Service', page: 'terms' },
  { label: 'Privacy Policy', page: 'privacy' },
  { label: 'Refund Policy', page: 'refund-policy' },
  { label: 'AUP', page: 'aup' },
  { label: 'Provider Agreement', page: 'provider-agreement' },
  { label: 'Community Guidelines', page: 'community-guidelines' },
  { label: 'Cookie Policy', page: 'cookie-policy' },
];

// ─── Social Icons Config ─────────────────────────────────────────────────────

const socialLinks = [
  { icon: <Facebook className="size-4" />, label: 'Facebook', href: '#' },
  { icon: <Twitter className="size-4" />, label: 'Twitter', href: '#' },
  { icon: <Instagram className="size-4" />, label: 'Instagram', href: '#' },
  { icon: <Linkedin className="size-4" />, label: 'LinkedIn', href: '#' },
];

// ─── Footer Link with Animated Underline ─────────────────────────────────────

function FooterLinkButton({ link, onNavigate }: { link: FooterLink; onNavigate: (page: Page) => void }) {
  return (
    <motion.button
      onClick={() => onNavigate(link.page)}
      className="group relative inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-emerald-600"
      whileHover={{ x: 3 }}
      transition={{ duration: 0.2 }}
    >
      <span className="relative">
        {link.label}
        <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 group-hover:w-full" />
      </span>
    </motion.button>
  );
}

// ─── Service Link with Icon ──────────────────────────────────────────────────

function ServiceLinkButton({
  link,
  onNavigate,
}: {
  link: { label: string; page: Page; icon: React.ReactNode };
  onNavigate: (page: Page) => void;
}) {
  return (
    <motion.button
      onClick={() => onNavigate(link.page)}
      className="group flex items-center gap-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-emerald-600"
      whileHover={{ x: 3 }}
      transition={{ duration: 0.2 }}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-cyan-50 text-emerald-600 transition-all duration-200 group-hover:from-emerald-100 group-hover:to-cyan-100 group-hover:text-emerald-700 group-hover:shadow-sm">
        {link.icon}
      </span>
      <span className="relative">
        {link.label}
        <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 group-hover:w-full" />
      </span>
    </motion.button>
  );
}

// ─── Main Footer Component ───────────────────────────────────────────────────

export function Footer() {
  const { navigate } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNavigate = (page: Page) => {
    navigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="mt-auto">
      {/* Gradient top border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 via-40% to-teal-500 via-70% to-amber-400" />

      {/* Main footer content */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* About Column (spans 2 on lg) */}
            <div className="lg:col-span-2">
              <motion.button
                onClick={() => handleNavigate('home')}
                className="group mb-5 flex items-center gap-2.5 transition-opacity hover:opacity-90"
                aria-label="Go to home page"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-500 shadow-md shadow-emerald-500/25">
                  <Wrench className="size-4 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                </div>
                <span className="text-xl font-extrabold tracking-tight">
                  <span className="text-gradient">BookYour</span>
                  <span className="text-foreground">Service</span>
                </span>
              </motion.button>
              <p className="mb-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Your trusted marketplace for professional home maintenance &amp; repair
                services. Find skilled providers, book with confidence, and get the job done right.
              </p>

              {/* Social Media Links */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="group flex size-9 items-center justify-center rounded-xl bg-white text-muted-foreground shadow-sm transition-all duration-300 hover:bg-gradient-to-br hover:from-emerald-600 hover:via-teal-500 hover:to-cyan-500 hover:text-white hover:shadow-lg hover:shadow-teal-500/30"
                    aria-label={social.label}
                    onClick={(e) => e.preventDefault()}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links Column */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                <span className="size-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLinkButton link={link} onNavigate={handleNavigate} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Column with Icons */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                <span className="size-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400" />
                Services
              </h3>
              <ul className="space-y-3">
                {serviceLinks.map((link) => (
                  <li key={link.label}>
                    <ServiceLinkButton link={link} onNavigate={handleNavigate} />
                  </li>
                ))}
              </ul>

              {/* Company links */}
              <div className="mt-6">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                  <span className="size-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
                  Company
                </h4>
                <ul className="space-y-3">
                  {aboutLinks.map((link) => (
                    <li key={link.label}>
                      <FooterLinkButton link={link} onNavigate={handleNavigate} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter + Contact Column */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                <span className="size-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400" />
                Stay Updated
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Get the latest offers and service updates delivered to your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="mb-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 rounded-lg border-amber-300/60 bg-gradient-to-r from-amber-50/50 to-orange-50/30 pl-9 text-sm focus-visible:ring-amber-500"
                      required
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-3 text-white shadow-sm hover:from-amber-600 hover:via-orange-600 hover:to-rose-600"
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </motion.div>
                </div>
                {subscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Subscribed successfully!
                  </motion.div>
                )}
              </form>

              {/* Contact Info */}
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                <span className="size-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                Contact Us
              </h4>
              <ul className="space-y-3">
                <li>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600">
                      <MapPin className="size-3.5" />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      BookYourService Technologies Pvt. Ltd.
                      <br />
                      123 Service Street, Fort
                      <br />
                      Mumbai 400001, India
                    </span>
                  </div>
                </li>
                <li>
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-emerald-600"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-600 transition-colors duration-200 group-hover:bg-teal-100">
                      <Phone className="size-3.5" />
                    </span>
                    +91 98765 43210
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@bookyourservice.co.in"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-emerald-600"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600">
                      <Mail className="size-3.5" />
                    </span>
                    support@bookyourservice.co.in
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Gradient Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 via-50% to-transparent" />
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-gray-100/50 via-emerald-50/20 to-gray-100/50 px-4 py-3 sm:flex-row">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              &copy; 2025{' '}
              <span className="font-semibold text-foreground">BookYourService</span>
              . Made with{' '}
              <Heart className="inline size-3 fill-emerald-500 text-emerald-500 drop-shadow-sm" />{' '}
              in India. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {legalLinks.map((link, idx) => (
                <React.Fragment key={link.label}>
                  {idx > 0 && (
                    <span className="size-1 rounded-full bg-muted-foreground/30" />
                  )}
                  <motion.button
                    onClick={() => handleNavigate(link.page)}
                    className="text-xs text-muted-foreground transition-colors duration-200 hover:text-emerald-600"
                    whileHover={{ y: -1 }}
                  >
                    {link.label}
                  </motion.button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
