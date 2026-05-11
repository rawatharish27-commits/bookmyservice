'use client';

import React from 'react';
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
} from 'lucide-react';

const teamMembers = [
  { name: 'Anil Verma', role: 'Founder & CEO', initials: 'AV' },
  { name: 'Sneha Patel', role: 'Chief Technology Officer', initials: 'SP' },
  { name: 'Rahul Singh', role: 'Head of Operations', initials: 'RS' },
  { name: 'Meera Joshi', role: 'Customer Experience Lead', initials: 'MJ' },
];

const values = [
  {
    icon: <Shield className="size-6" />,
    title: 'Trust & Safety',
    description: 'Every provider is KYC-verified and background-checked to ensure your safety and peace of mind.',
  },
  {
    icon: <Star className="size-6" />,
    title: 'Quality First',
    description: 'We maintain high standards through reviews, ratings, and continuous quality monitoring.',
  },
  {
    icon: <Heart className="size-6" />,
    title: 'Customer Centric',
    description: 'Every decision we make starts with the question: "How does this help our customers?"',
  },
  {
    icon: <Lightbulb className="size-6" />,
    title: 'Innovation',
    description: 'We constantly improve our platform to make finding and booking services easier than ever.',
  },
  {
    icon: <Users className="size-6" />,
    title: 'Community',
    description: 'We build connections between customers and service providers, creating lasting relationships.',
  },
  {
    icon: <Wrench className="size-6" />,
    title: 'Empowerment',
    description: 'We empower service professionals to grow their business and reach new customers.',
  },
];

export function AboutPage() {
  const { navigate } = useApp();

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
            <BreadcrumbPage>About</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          About <span className="text-emerald-600">BookYourService</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          We are on a mission to make professional home services accessible, reliable, and
          hassle-free for everyone.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="mb-16 grid gap-8 sm:grid-cols-2">
        <Card className="rounded-xl border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <Target className="size-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold">Our Mission</h2>
            <p className="mt-3 text-muted-foreground">
              To connect every household with trusted, verified service professionals while
              empowering providers to build thriving businesses. We believe everyone deserves
              access to quality home services at fair prices.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-l-4 border-l-teal-500">
          <CardContent className="p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-teal-100">
              <Eye className="size-6 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold">Our Vision</h2>
            <p className="mt-3 text-muted-foreground">
              To become the most trusted marketplace for home services globally, where quality
              meets convenience. We envision a world where finding a reliable service professional
              is as easy as a few taps on your phone.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="mb-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 sm:p-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">Our Impact</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: 'Bookings Completed', value: '10,000+', icon: <CalendarCheck className="size-5" /> },
            { label: 'Service Providers', value: '5,000+', icon: <Users className="size-5" /> },
            { label: 'Customer Rating', value: '4.8/5', icon: <Star className="size-5" /> },
            { label: 'Cities Served', value: '50+', icon: <Wrench className="size-5" /> },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-white/20">
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-emerald-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Our Values</h2>
          <p className="mt-2 text-muted-foreground">The principles that guide everything we do</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title} className="rounded-xl transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  {value.icon}
                </div>
                <h3 className="font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Our Team</h2>
          <p className="mt-2 text-muted-foreground">The people behind BookYourService</p>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {teamMembers.map((member) => (
            <Card key={member.name} className="rounded-xl text-center">
              <CardContent className="p-6">
                <Avatar className="mx-auto size-20">
                  <AvatarFallback className="bg-emerald-100 text-lg font-semibold text-emerald-700">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-sm font-semibold">{member.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gray-50 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Join thousands of satisfied customers and service providers on our platform
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => navigate('categories')}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Find Services <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('contact')}>
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
}
