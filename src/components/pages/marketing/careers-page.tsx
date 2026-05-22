'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Heart,
  GraduationCap,
  IndianRupee,
  Users,
  Globe,
  Laptop,
  Utensils,
  Dumbbell,
  Plane,
  Baby,
  Stethoscope,
  Zap,
  ChevronRight,
  Filter,
  Building2,
} from 'lucide-react'

const jobListings = [
  { id: 1, title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'Bengaluru', type: 'Full-Time', experience: '5-8 years', salary: '₹25-40 LPA', posted: '2 days ago', urgent: true },
  { id: 2, title: 'Product Manager — Consumer', department: 'Product', location: 'Bengaluru', type: 'Full-Time', experience: '4-6 years', salary: '₹22-35 LPA', posted: '1 week ago', urgent: false },
  { id: 3, title: 'Data Scientist', department: 'Data & Analytics', location: 'Bengaluru', type: 'Full-Time', experience: '3-5 years', salary: '₹20-32 LPA', posted: '3 days ago', urgent: false },
  { id: 4, title: 'UX Designer', department: 'Design', location: 'Mumbai', type: 'Full-Time', experience: '3-5 years', salary: '₹18-28 LPA', posted: '5 days ago', urgent: false },
  { id: 5, title: 'City Operations Manager', department: 'Operations', location: 'Delhi', type: 'Full-Time', experience: '4-7 years', salary: '₹15-22 LPA', posted: '1 day ago', urgent: true },
  { id: 6, title: 'Business Development Executive', department: 'Sales', location: 'Hyderabad', type: 'Full-Time', experience: '2-4 years', salary: '₹10-18 LPA', posted: '4 days ago', urgent: false },
  { id: 7, title: 'Android Developer', department: 'Engineering', location: 'Bengaluru', type: 'Full-Time', experience: '3-5 years', salary: '₹18-30 LPA', posted: '3 days ago', urgent: false },
  { id: 8, title: 'Customer Success Lead', department: 'Support', location: 'Pune', type: 'Full-Time', experience: '3-6 years', salary: '₹12-20 LPA', posted: '1 week ago', urgent: false },
  { id: 9, title: 'Content Writer', department: 'Marketing', location: 'Remote', type: 'Full-Time', experience: '2-4 years', salary: '₹8-14 LPA', posted: '6 days ago', urgent: false },
  { id: 10, title: 'QA Engineer', department: 'Engineering', location: 'Bengaluru', type: 'Full-Time', experience: '2-4 years', salary: '₹12-20 LPA', posted: '2 days ago', urgent: false },
  { id: 11, title: 'HR Business Partner', department: 'People', location: 'Bengaluru', type: 'Full-Time', experience: '5-8 years', salary: '₹18-28 LPA', posted: '4 days ago', urgent: false },
  { id: 12, title: 'DevOps Engineer', department: 'Engineering', location: 'Bengaluru', type: 'Full-Time', experience: '3-6 years', salary: '₹20-35 LPA', posted: '1 day ago', urgent: true },
]

const cultureValues = [
  { icon: Heart, title: 'People First', description: 'We believe happy teams build great products. Wellness, flexibility, and respect are non-negotiable.' },
  { icon: Zap, title: 'Move Fast', description: 'We ship quickly, learn from data, and iterate. Speed is our competitive advantage.' },
  { icon: Users, title: 'Collaboration', description: 'Cross-functional teams working together towards a shared mission. No silos, no egos.' },
  { icon: Globe, title: 'Impact at Scale', description: 'Every feature we ship affects millions of lives. We take that responsibility seriously.' },
]

const benefits = [
  { icon: IndianRupee, title: 'Competitive Salary', description: 'Top-of-market compensation with ESOPs' },
  { icon: Heart, title: 'Health Insurance', description: 'Comprehensive health cover for you & family' },
  { icon: Laptop, title: 'Flexible Work', description: 'Hybrid work model with remote options' },
  { icon: GraduationCap, title: 'Learning Budget', description: '₹50,000/year for courses & conferences' },
  { icon: Plane, title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
  { icon: Utensils, title: 'Free Meals', description: 'Breakfast, lunch & snacks at office' },
  { icon: Dumbbell, title: 'Gym Membership', description: 'Fully sponsored gym & wellness programs' },
  { icon: Baby, title: 'Parental Leave', description: '6 months maternity, 1 month paternity' },
  { icon: Stethoscope, title: 'Mental Health', description: 'Free counselling & therapy sessions' },
]

const departments = ['All', 'Engineering', 'Product', 'Design', 'Operations', 'Sales', 'Marketing', 'Data & Analytics', 'Support', 'People']

export function CareersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')

  const filteredJobs = jobListings.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = selectedDept === 'All' || job.department === selectedDept
    return matchesSearch && matchesDept
  })

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/30 text-blue-100 border-blue-400/30 mb-4">Careers</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Build the Future of <br />
              <span className="text-blue-200">Home Services in India</span>
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-8">
              Join a team of 500+ passionate people making quality home services accessible
              to every Indian household. Your work here will impact millions of lives.
            </p>
            <div className="flex items-center gap-6">
              <div><p className="text-2xl font-bold">12</p><p className="text-xs text-blue-200">Open Positions</p></div>
              <div className="w-px h-10 bg-blue-400/30" />
              <div><p className="text-2xl font-bold">500+</p><p className="text-xs text-blue-200">Team Members</p></div>
              <div className="w-px h-10 bg-blue-400/30" />
              <div><p className="text-2xl font-bold">5</p><p className="text-xs text-blue-200">Office Locations</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Our Culture</h2>
          <p className="text-slate-500 max-w-xl mx-auto">The values that define how we work, collaborate, and grow together</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cultureValues.map((value) => (
            <Card key={value.title} className="shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="size-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Benefits & Perks</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Because you deserve more than just a paycheck</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="shadow-sm border-0 text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="size-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-xs mb-1">{benefit.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Job Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Open Positions</h2>
          <p className="text-slate-500">Find the role that excites you and apply today</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search by role, department, or city..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="size-4 text-slate-400 shrink-0" />
            {departments.slice(0, 6).map((dept) => (
              <Button
                key={dept}
                variant={selectedDept === dept ? 'default' : 'outline'}
                size="sm"
                className={selectedDept === dept ? 'bg-blue-600 hover:bg-blue-700' : ''}
                onClick={() => setSelectedDept(dept)}
              >
                {dept}
              </Button>
            ))}
          </div>
        </div>

        {/* Job Cards */}
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <Card className="shadow-sm border-0">
              <CardContent className="py-12 text-center">
                <Briefcase className="size-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No positions found</h3>
                <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        {job.urgent && <Badge className="bg-red-50 text-red-600 text-[10px]">Urgent</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Building2 className="size-3" /> {job.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="size-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {job.type}</span>
                        <span className="flex items-center gap-1"><Briefcase className="size-3" /> {job.experience}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600 text-sm">{job.salary}</p>
                        <p className="text-[10px] text-slate-400">{job.posted}</p>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Apply <ChevronRight className="size-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Don&apos;t See the Right Role?</h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            We&apos;re always looking for talented people. Send us your resume and we&apos;ll reach out when there&apos;s a match.
          </p>
          <Button size="lg" variant="secondary">Send Your Resume</Button>
        </div>
      </section>
    </div>
  )
}
