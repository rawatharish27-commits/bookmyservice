'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Clock,
  ArrowRight,
  User,
  MoreHorizontal,
  Filter,
  ChevronRight,
  Sparkles,
  Wrench,
  Droplets,
  Home,
  Wind,
} from 'lucide-react'

type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost'

interface Lead {
  id: number
  name: string
  phone: string
  email: string
  service: string
  source: string
  followUpDate: string
  value: string
  notes: string
  stage: LeadStage
}

const stages: { name: LeadStage; color: string; bgColor: string }[] = [
  { name: 'New', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: 'Contacted', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { name: 'Qualified', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { name: 'Converted', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { name: 'Lost', color: 'text-red-600', bgColor: 'bg-red-50' },
]

const initialLeads: Lead[] = [
  { id: 1, name: 'Rahul Verma', phone: '+91 98765 11111', email: 'rahul@gmail.com', service: 'Water Tank Cleaning', source: 'Google', followUpDate: '15 Mar', value: '₹499', notes: 'Interested in weekly water tank cleaning', stage: 'New' },
  { id: 2, name: 'Sneha Patel', phone: '+91 98765 22222', email: 'sneha@gmail.com', service: 'Air Conditioner', source: 'Facebook', followUpDate: '14 Mar', value: '₹499', notes: 'Has 3 ACs, wants AMC', stage: 'New' },
  { id: 3, name: 'Arjun Reddy', phone: '+91 98765 33333', email: 'arjun@gmail.com', service: 'Plumber', source: 'Referral', followUpDate: '13 Mar', value: '₹299', notes: 'Kitchen pipe leakage', stage: 'New' },
  { id: 4, name: 'Priya Sharma', phone: '+91 98765 44444', email: 'priya@gmail.com', service: 'Electrician', source: 'Instagram', followUpDate: '14 Mar', value: '₹499', notes: 'Wiring inspection inquiry', stage: 'Contacted' },
  { id: 5, name: 'Vikram Singh', phone: '+91 98765 55555', email: 'vikram@gmail.com', service: 'Kitchen Appliances', source: 'Google', followUpDate: '12 Mar', value: '₹499', notes: 'Full kitchen appliance check, 3BHK', stage: 'Contacted' },
  { id: 6, name: 'Meera Joshi', phone: '+91 98765 66666', email: 'meera@gmail.com', service: 'Water Purifier', source: 'Website', followUpDate: '11 Mar', value: '₹399', notes: 'Water purifier issue in society flat', stage: 'Contacted' },
  { id: 7, name: 'Karthik Raja', phone: '+91 98765 77777', email: 'karthik@gmail.com', service: 'Air Conditioner', source: 'Referral', followUpDate: '10 Mar', value: '₹499', notes: 'New AC installation, 2 units', stage: 'Qualified' },
  { id: 8, name: 'Ananya Iyer', phone: '+91 98765 88888', email: 'ananya@gmail.com', service: 'Water Tank Cleaning', source: 'Google', followUpDate: '09 Mar', value: '₹499', notes: 'Move-in water tank cleaning, 2BHK', stage: 'Qualified' },
  { id: 9, name: 'Rohan Gupta', phone: '+91 98765 99999', email: 'rohan@gmail.com', service: 'Plumber', source: 'WhatsApp', followUpDate: '-', value: '₹349', notes: 'Booked bathroom repair', stage: 'Converted' },
  { id: 10, name: 'Pooja Nair', phone: '+91 98765 00000', email: 'pooja@gmail.com', service: 'Water Tank Cleaning', source: 'Google', followUpDate: '-', value: '₹499', notes: 'Recurring weekly booking', stage: 'Converted' },
  { id: 11, name: 'Deepak Kumar', phone: '+91 98765 12345', email: 'deepak@gmail.com', service: 'Kitchen Appliances', source: 'Facebook', followUpDate: '-', value: '₹499', notes: 'Went with competitor', stage: 'Lost' },
  { id: 12, name: 'Lakshmi Reddy', phone: '+91 98765 67890', email: 'lakshmi@gmail.com', service: 'Air Conditioner', source: 'Website', followUpDate: '-', value: '₹499', notes: 'Budget mismatch', stage: 'Lost' },
]

const serviceIcons: Record<string, React.ReactNode> = {
  'Water Tank Cleaning': <Home className="size-3.5" />,
  'Air Conditioner': <Wind className="size-3.5" />,
  'Plumber': <Droplets className="size-3.5" />,
  'Kitchen Appliances': <Wrench className="size-3.5" />,
  'Electrician': <Sparkles className="size-3.5" />,
  'Water Purifier': <Droplets className="size-3.5" />,
}

export function LeadManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

  const moveLead = (leadId: number, newStage: LeadStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l))
  }

  const getStageIndex = (stage: LeadStage) => stages.findIndex(s => s.name === stage)

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lead Management</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage sales pipeline</p>
          </div>
          <Button size="sm" className="gap-1 rounded-xl bg-blue-600 hover:bg-blue-700">
            <Plus className="size-4" /> Add Lead
          </Button>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-5 gap-3">
          {stages.map((stage) => {
            const count = leads.filter(l => l.stage === stage.name).length
            return (
              <div key={stage.name} className={`${stage.bgColor} rounded-xl p-3 text-center`}>
                <p className={`text-xl font-bold ${stage.color}`}>{count}</p>
                <p className="text-xs text-slate-600 font-medium">{stage.name}</p>
              </div>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search leads by name, service, email..."
            className="pl-9 rounded-xl bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.name)
            return (
              <div key={stage.name} className="min-w-[280px] flex-1">
                {/* Stage Header */}
                <div className={`${stage.bgColor} rounded-t-xl p-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${stage.bgColor.replace('50', '500')}`} />
                    <span className={`text-sm font-semibold ${stage.color}`}>{stage.name}</span>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] ${stage.bgColor} ${stage.color} border-0`}>
                    {stageLeads.length}
                  </Badge>
                </div>

                {/* Lead Cards */}
                <div className="bg-slate-50/50 rounded-b-xl p-2 space-y-2 min-h-[200px] border border-slate-100 border-t-0">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`flex size-7 items-center justify-center rounded-full ${stage.bgColor}`}>
                              <User className={`size-3.5 ${stage.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                              <p className="text-[10px] text-slate-400">{lead.source}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] bg-slate-50">
                            {lead.value}
                          </Badge>
                        </div>

                        {/* Service */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-blue-500">{serviceIcons[lead.service] || <Wrench className="size-3.5" />}</span>
                          <span className="text-xs text-slate-600">{lead.service}</span>
                        </div>

                        {/* Notes */}
                        <p className="text-[11px] text-slate-500 mb-2 line-clamp-1">{lead.notes}</p>

                        {/* Contact */}
                        <div className="flex items-center gap-3 mb-2">
                          <a href="#" className="text-slate-400 hover:text-blue-600"><Phone className="size-3" /></a>
                          <a href="#" className="text-slate-400 hover:text-blue-600"><Mail className="size-3" /></a>
                        </div>

                        {/* Follow up + Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          {lead.followUpDate !== '-' && (
                            <div className="flex items-center gap-1">
                              <Clock className="size-3 text-slate-400" />
                              <span className="text-[10px] text-slate-500">{lead.followUpDate}</span>
                            </div>
                          )}
                          <div className="flex gap-1 ml-auto">
                            {getStageIndex(lead.stage) > 0 && getStageIndex(lead.stage) < 4 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                                onClick={() => {
                                  const prevStage = stages[getStageIndex(lead.stage) - 1]
                                  if (prevStage) moveLead(lead.id, prevStage.name)
                                }}
                              >
                                ←
                              </Button>
                            )}
                            {getStageIndex(lead.stage) < 3 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-emerald-500"
                                onClick={() => {
                                  const nextStage = stages[getStageIndex(lead.stage) + 1]
                                  if (nextStage) moveLead(lead.id, nextStage.name)
                                }}
                              >
                                →
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-slate-300">
                      <p className="text-xs">No leads</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
