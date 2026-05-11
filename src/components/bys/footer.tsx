'use client';

import React from 'react';
import { useApp, type Page } from '@/contexts/app-context';
import { Separator } from '@/components/ui/separator';
import {
  Wrench,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
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

const serviceLinks: FooterLink[] = [
  { label: 'Plumbing', page: 'categories' },
  { label: 'Electrical', page: 'categories' },
  { label: 'AC & HVAC', page: 'categories' },
];

const legalLinks: { label: string; page: Page }[] = [
  { label: 'Terms of Service', page: 'terms' },
  { label: 'Privacy Policy', page: 'privacy' },
  { label: 'Refund Policy', page: 'refund-policy' },
];

export function Footer() {
  const { navigate } = useApp();

  const handleNavigate = (page: Page) => {
    navigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About Column */}
          <div>
            <button
              onClick={() => handleNavigate('home')}
              className="mb-4 flex items-center gap-2 transition-opacity hover:opacity-80"
              aria-label="Go to home page"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Wrench className="size-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Book<span className="text-emerald-600">Your</span>Service
              </span>
            </button>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Your trusted marketplace for professional home maintenance &amp; repair
              services. Find skilled providers, book with confidence, and get the job done right.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-muted-foreground transition-colors hover:bg-emerald-100 hover:text-emerald-600"
                aria-label="Facebook"
                onClick={(e) => e.preventDefault()}
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-muted-foreground transition-colors hover:bg-emerald-100 hover:text-emerald-600"
                aria-label="Twitter"
                onClick={(e) => e.preventDefault()}
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-muted-foreground transition-colors hover:bg-emerald-100 hover:text-emerald-600"
                aria-label="Instagram"
                onClick={(e) => e.preventDefault()}
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-muted-foreground transition-colors hover:bg-emerald-100 hover:text-emerald-600"
                aria-label="LinkedIn"
                onClick={(e) => e.preventDefault()}
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavigate(link.page)}
                    className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Services
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavigate(link.page)}
                    className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span className="text-sm text-muted-foreground">
                  BookYourService Technologies Pvt. Ltd.
                  <br />
                  123 Service Street, Fort
                  <br />
                  Mumbai 400001, India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-emerald-600" />
                <a
                  href="tel:+919876543210"
                  className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-emerald-600" />
                <a
                  href="mailto:support@bookyourservice.co.in"
                  className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                >
                  support@bookyourservice.co.in
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold text-foreground">Company</h4>
              <ul className="space-y-2.5">
                {aboutLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNavigate(link.page)}
                      className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 BookYourService. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavigate(link.page)}
                className="text-xs text-muted-foreground transition-colors hover:text-emerald-600"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
