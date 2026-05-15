import React, { useState } from 'react';
import { useApp, type Page } from '@/contexts/app-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Wrench,
  Globe,
  Rss,
  Camera,
  Link2,
  Mail,
  Phone,
  MapPin,
  Wind,
  Snowflake,
  Shirt,
  ChefHat,
  Tv,
  Droplets,
  Flame,
  Zap,
  Droplet,
  Truck,
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

// All 11 service categories with their icons
const serviceLinks: { label: string; page: Page; icon: React.ReactNode }[] = [
  { label: 'Air Conditioner', page: 'categories', icon: <Wind className="size-3.5" /> },
  { label: 'Refrigerator', page: 'categories', icon: <Snowflake className="size-3.5" /> },
  { label: 'Washing Machine', page: 'categories', icon: <Shirt className="size-3.5" /> },
  { label: 'Kitchen Appliances', page: 'categories', icon: <ChefHat className="size-3.5" /> },
  { label: 'TV Repair', page: 'categories', icon: <Tv className="size-3.5" /> },
  { label: 'Water Purifier', page: 'categories', icon: <Droplets className="size-3.5" /> },
  { label: 'Geyser', page: 'categories', icon: <Flame className="size-3.5" /> },
  { label: 'Plumber', page: 'categories', icon: <Wrench className="size-3.5" /> },
  { label: 'Electrician', page: 'categories', icon: <Zap className="size-3.5" /> },
  { label: 'Water Tank Cleaning', page: 'categories', icon: <Droplet className="size-3.5" /> },
  { label: 'Movers and Packers', page: 'categories', icon: <Truck className="size-3.5" /> },
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
  { icon: <Globe className="size-4" />, label: 'Facebook', href: '#' },
  { icon: <Rss className="size-4" />, label: 'Twitter', href: '#' },
  { icon: <Camera className="size-4" />, label: 'Instagram', href: '#' },
  { icon: <Link2 className="size-4" />, label: 'LinkedIn', href: '#' },
];

// ─── Section Header with Gradient Dot ────────────────────────────────────────

function SectionHeader({ children, dotFrom, dotTo }: { children: React.ReactNode; dotFrom: string; dotTo: string }) {
  return (
    <h3 className="mb-5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-foreground">
      <span className={`size-2 rounded-full bg-gradient-to-r ${dotFrom} ${dotTo} shadow-sm`} />
      {children}
    </h3>
  );
}

// ─── Footer Link with Animated Underline ─────────────────────────────────────

function FooterLinkButton({ link, onNavigate }: { link: FooterLink; onNavigate: (page: Page) => void }) {
  return (
    <motion.button
      onClick={() => onNavigate(link.page)}
      className="group relative inline-flex items-center gap-1.5 text-[15px] font-medium text-muted-foreground transition-colors duration-200 hover:text-blue-600"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <ChevronRight className="size-3 opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-60 group-hover:ml-0" />
      <span className="relative">
        {link.label}
        <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 rounded-full bg-gradient-to-r from-blue-800 to-sky-500 transition-all duration-300 group-hover:w-full" />
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
      className="group flex items-center gap-2.5 text-[14px] font-medium text-muted-foreground transition-colors duration-200 hover:text-blue-600"
      whileHover={{ x: 3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-sky-50 text-blue-600 transition-all duration-300 group-hover:from-blue-100 group-hover:to-sky-100 group-hover:text-blue-700 group-hover:shadow-sm group-hover:shadow-blue-200/50">
        {link.icon}
      </span>
      <span className="relative">
        {link.label}
        <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 rounded-full bg-gradient-to-r from-blue-800 to-sky-500 transition-all duration-300 group-hover:w-full" />
      </span>
    </motion.button>
  );
}

// ─── Contact Info Pill ───────────────────────────────────────────────────────

function ContactPill({
  icon,
  gradient,
  children,
  href,
}: {
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
  href?: string;
}) {
  const Wrapper = href ? 'a' : 'div';
  return (
    <Wrapper
      {...(href ? { href } : {})}
      className="flex items-start gap-3 text-[15px] text-muted-foreground transition-colors duration-200 hover:text-blue-600"
    >
      <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
        {icon}
      </span>
      <span className="leading-relaxed">{children}</span>
    </Wrapper>
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
      {/* ── Navy Blue Gradient Top Bar ─────────────────────────────── */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-900 via-blue-700 to-sky-400" />

      {/* ── Main Footer Content ──────────────────────────────────────── */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">

            {/* ── About / Logo Column (spans 2 on lg) ────────────────── */}
            <div className="lg:col-span-2">
              {/* Premium Logo */}
              <motion.button
                onClick={() => handleNavigate('home')}
                className="group mb-6 flex items-center gap-2.5 transition-opacity hover:opacity-90"
                aria-label="Go to home page"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 via-blue-700 to-sky-400 shadow-lg shadow-blue-500/25 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-sky-500/30">
                  <Wrench className="size-4.5 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 via-white/5 to-transparent" />
                </div>
                <span className="text-[22px] font-extrabold tracking-tight">
                  <span className="text-gradient">BookYour</span>
                  <span className="text-foreground">Service</span>
                </span>
              </motion.button>

              {/* Description */}
              <p className="mb-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground/80">
                Your trusted marketplace for professional home maintenance &amp; repair
                services. Find skilled providers, book with confidence, and get the job done right.
              </p>

              {/* Social Media Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="group flex size-10 items-center justify-center rounded-xl bg-gray-50 text-muted-foreground ring-1 ring-gray-200/60 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-900 hover:via-blue-700 hover:to-sky-500 hover:text-white hover:ring-transparent hover:shadow-lg hover:shadow-blue-500/25"
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

            {/* ── Quick Links Column ──────────────────────────────────── */}
            <div>
              <SectionHeader dotFrom="from-blue-900" dotTo="to-sky-400">
                Quick Links
              </SectionHeader>
              <ul className="space-y-3.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLinkButton link={link} onNavigate={handleNavigate} />
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Services Column with Category Icons ─────────────────── */}
            <div>
              <SectionHeader dotFrom="from-blue-700" dotTo="to-sky-400">
                Services
              </SectionHeader>
              <ul className="grid grid-cols-1 gap-2.5">
                {serviceLinks.map((link) => (
                  <li key={link.label}>
                    <ServiceLinkButton link={link} onNavigate={handleNavigate} />
                  </li>
                ))}
              </ul>

              {/* Company links */}
              <div className="mt-8">
                <SectionHeader dotFrom="from-slate-600" dotTo="to-blue-400">
                  Company
                </SectionHeader>
                <ul className="space-y-3.5">
                  {aboutLinks.map((link) => (
                    <li key={link.label}>
                      <FooterLinkButton link={link} onNavigate={handleNavigate} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Newsletter + Contact Column ─────────────────────────── */}
            <div>
              <SectionHeader dotFrom="from-blue-800" dotTo="to-blue-400">
                Stay Updated
              </SectionHeader>
              <p className="mb-4 text-[15px] leading-relaxed text-muted-foreground/80">
                Get the latest offers and service updates delivered to your inbox.
              </p>

              {/* Newsletter Form */}
              <form onSubmit={handleSubscribe} className="mb-8">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-400/60" />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-xl border-blue-200/60 bg-blue-50/30 pl-10 text-sm placeholder:text-blue-400/40 focus:border-blue-400 focus-visible:ring-blue-500/30"
                      required
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-10 rounded-xl bg-gradient-to-r from-blue-900 via-blue-700 to-sky-500 px-4 text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:from-blue-950 hover:via-blue-800 hover:to-sky-600 hover:shadow-lg hover:shadow-blue-500/30"
                    >
                      <Send className="size-4" />
                    </Button>
                  </motion.div>
                </div>
                {subscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-blue-600"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Subscribed successfully!
                  </motion.div>
                )}
              </form>

              {/* Contact Info */}
              <SectionHeader dotFrom="from-blue-800" dotTo="to-sky-400">
                Contact Us
              </SectionHeader>
              <ul className="space-y-4">
                <li>
                  <ContactPill
                    icon={<MapPin className="size-4 text-blue-600" />}
                    gradient="from-blue-50 to-sky-50"
                  >
                    BookYourService Technologies Pvt. Ltd.
                    <br />
                    123 Service Street, Fort
                    <br />
                    Mumbai 400001, India
                  </ContactPill>
                </li>
                <li>
                  <ContactPill
                    icon={<Phone className="size-4 text-blue-600" />}
                    gradient="from-blue-50 to-sky-50"
                    href="tel:+919876543210"
                  >
                    +91 98765 43210
                  </ContactPill>
                </li>
                <li>
                  <ContactPill
                    icon={<Mail className="size-4 text-sky-600" />}
                    gradient="from-sky-50 to-blue-50"
                    href="mailto:support@bookyourservice.co.in"
                  >
                    support@bookyourservice.co.in
                  </ContactPill>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Gradient Divider ──────────────────────────────────────── */}
          <div className="relative my-10">
            <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 via-50% to-transparent" />
            <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-slate-300/20 via-50% to-transparent blur-sm" />
          </div>

          {/* ── Bottom Bar ────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-gray-50 via-blue-50/20 to-gray-50 px-6 py-4 sm:flex-row">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              &copy; 2025{' '}
              <span className="font-bold text-foreground">BookYourService</span>
              . Made with{' '}
              <Heart className="inline size-3.5 fill-blue-600 text-blue-600 drop-shadow-sm" />{' '}
              in India. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              {legalLinks.map((link, idx) => (
                <React.Fragment key={link.label}>
                  {idx > 0 && (
                    <span className="size-1 rounded-full bg-muted-foreground/20" />
                  )}
                  <motion.button
                    onClick={() => handleNavigate(link.page)}
                    className="text-xs font-medium text-muted-foreground/70 transition-colors duration-200 hover:text-blue-600"
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
