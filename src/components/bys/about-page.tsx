'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Wrench,
  Users,
  CalendarCheck,
  Star,
  Target,
  Eye,
  Heart,
  Shield,
  Lightbulb,
  ArrowRight,
  Droplets,
  Zap,
  Wind,
  Globe,
  Award,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

const teamMembers = [
  { name: 'Anil Verma', role: 'Founder & CEO', initials: 'AV', color: 'from-emerald-700 to-teal-600' },
  { name: 'Sneha Patel', role: 'Chief Technology Officer', initials: 'SP', color: 'from-teal-600 to-cyan-600' },
  { name: 'Rahul Singh', role: 'Head of Operations', initials: 'RS', color: 'from-emerald-700 to-emerald-500' },
  { name: 'Meera Joshi', role: 'Customer Experience Lead', initials: 'MJ', color: 'from-cyan-600 to-emerald-600' },
];

const values = [
  {
    icon: <Shield className="size-6" />,
    title: 'Trust & Safety',
    description: 'Every provider is KYC-verified and background-checked to ensure your safety and peace of mind.',
    gradient: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: <Star className="size-6" />,
    title: 'Quality First',
    description: 'We maintain high standards through reviews, ratings, and continuous quality monitoring.',
    gradient: 'from-amber-600 to-orange-600',
    bg: 'bg-amber-50',
  },
  {
    icon: <Heart className="size-6" />,
    title: 'Customer Centric',
    description: 'Every decision we make starts with the question: "How does this help our customers?"',
    gradient: 'from-rose-600 to-pink-600',
    bg: 'bg-rose-50',
  },
  {
    icon: <Lightbulb className="size-6" />,
    title: 'Innovation',
    description: 'We constantly improve our platform to make finding and booking services easier than ever.',
    gradient: 'from-violet-600 to-purple-600',
    bg: 'bg-violet-50',
  },
  {
    icon: <Users className="size-6" />,
    title: 'Community',
    description: 'We build connections between customers and service providers, creating lasting relationships.',
    gradient: 'from-blue-600 to-cyan-600',
    bg: 'bg-blue-50',
  },
  {
    icon: <Wrench className="size-6" />,
    title: 'Empowerment',
    description: 'We empower service professionals to grow their business and reach new customers.',
    gradient: 'from-teal-600 to-emerald-600',
    bg: 'bg-teal-50',
  },
];

const stats = [
  { label: 'Bookings Completed', value: 10000, suffix: '+', icon: <CalendarCheck className="size-6" /> },
  { label: 'Service Providers', value: 5000, suffix: '+', icon: <Users className="size-6" /> },
  { label: 'Customer Rating', value: 4.8, suffix: '/5', icon: <Star className="size-6" /> },
  { label: 'Cities Served', value: 50, suffix: '+', icon: <Globe className="size-6" /> },
];

function AnimatedCounter({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const isDecimal = !Number.isInteger(value);
    const stepTime = (duration * 1000) / end;
    const increment = isDecimal ? 0.1 : Math.max(1, Math.floor(end / 100));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {typeof value === 'number' && !Number.isInteger(value) ? count.toFixed(1) : count.toLocaleString()}
      {suffix}
    </span>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function AboutPage() {
  const { navigate } = useApp();

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
              <BreadcrumbPage className="text-gradient-ocean font-semibold">About</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-800 to-cyan-700 p-10 sm:p-16"
      >
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-white/5" />
          <div className="absolute right-1/3 top-1/3 size-40 rounded-full bg-white/5" />
          {/* Floating service icons */}
          <div className="absolute right-10 top-10 float-animation opacity-20">
            <Droplets className="size-16 text-white" />
          </div>
          <div className="absolute left-10 bottom-10 float-animation opacity-20" style={{ animationDelay: '2s' }}>
            <Zap className="size-14 text-white" />
          </div>
          <div className="absolute right-1/4 bottom-8 float-animation opacity-20" style={{ animationDelay: '4s' }}>
            <Wind className="size-12 text-white" />
          </div>
          {/* Dot pattern */}
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
            <Award className="size-7 text-white" />
          </motion.div>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
            About <span className="text-emerald-200">BookYourService</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-emerald-100">
            We are on a mission to make professional home services accessible, reliable, and
            hassle-free for everyone across India.
          </p>
        </div>
      </motion.div>

      {/* Mission & Vision Cards */}
      <div className="mb-16 grid gap-6 sm:grid-cols-2">
        {[
          {
            icon: <Target className="size-7" />,
            title: 'Our Mission',
            description: 'To connect every household with trusted, verified service professionals while empowering providers to build thriving businesses. We believe everyone deserves access to quality home services at fair prices.',
            gradient: 'from-emerald-600 to-teal-600',
            accent: 'emerald',
          },
          {
            icon: <Eye className="size-7" />,
            title: 'Our Vision',
            description: 'To become the most trusted marketplace for home services globally, where quality meets convenience. We envision a world where finding a reliable service professional is as easy as a few taps on your phone.',
            gradient: 'from-teal-600 to-cyan-600',
            accent: 'teal',
          },
        ].map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
          >
            <Card className="group h-full overflow-hidden rounded-2xl border-0 shadow-lg transition-shadow hover:shadow-xl glass-emerald">
              {/* Gradient top bar */}
              <div className={`h-1.5 bg-gradient-to-r ${item.gradient}`} />
              <CardContent className="p-8">
                <div className={`mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                  {item.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100">
                  Learn more <ArrowRight className="size-4" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="mb-16 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-800 to-cyan-700 p-8 sm:p-12"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
        </div>
        <h2 className="relative mb-10 text-center text-3xl font-bold text-white">
          Our <span className="text-emerald-200">Impact</span>
        </h2>
        <div className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <div className="glass-emerald mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl text-white">
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-white sm:text-4xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-emerald-200">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Values */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Our <span className="text-gradient-ocean">Values</span>
          </h2>
          <p className="mt-3 text-muted-foreground">The principles that guide everything we do</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, idx) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
            >
              <Card className="group h-full overflow-hidden rounded-2xl border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 glass-emerald">
                <CardContent className="p-6">
                  <div className={`mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${value.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Our <span className="text-gradient-ocean">Team</span>
          </h2>
          <p className="mt-3 text-muted-foreground">The people behind BookYourService</p>
        </motion.div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <Card className="group overflow-hidden rounded-2xl border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <Avatar className="mx-auto size-20 ring-4 ring-emerald-200/60 transition-all group-hover:ring-emerald-300/80">
                    <AvatarFallback className={`bg-gradient-to-br ${member.color} text-lg font-bold text-white`}>
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 font-semibold text-gray-900">{member.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose <span className="text-gradient-ocean">Us</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Shield className="size-5" />, title: 'KYC Verified', desc: 'Every provider is background-checked' },
            { icon: <TrendingUp className="size-5" />, title: 'Best Prices', desc: 'Transparent and competitive pricing' },
            { icon: <CheckCircle2 className="size-5" />, title: 'Satisfaction', desc: 'Money-back guarantee on services' },
            { icon: <Wrench className="size-5" />, title: 'Expert Pros', desc: 'Skilled and experienced professionals' },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className="glass-emerald rounded-2xl p-5 text-center shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                {item.icon}
              </div>
              <h4 className="font-semibold text-gray-900">{item.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-3xl mesh-bg p-10 text-center sm:p-14">
          {/* Decorative */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-16 size-48 rounded-full bg-emerald-100/50" />
            <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-teal-100/50" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to Get <span className="text-gradient-ocean">Started</span>?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Join thousands of satisfied customers and service providers on our platform
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('categories')}
                className="shimmer rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700"
              >
                Find Services <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('contact')}
                className="rounded-xl border-emerald-300 px-8 text-emerald-700 hover:bg-emerald-50"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
