'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Clock, DollarSign, Tag } from 'lucide-react'

export function ProviderAddServicePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Add New Service</h1>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Service Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Service Name</label><Input placeholder="e.g., Air Conditioner" /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
              <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="appliance">Air Conditioner</SelectItem>
                  <SelectItem value="cleaning">Water Tank Cleaning</SelectItem>
                  <SelectItem value="plumbing">Plumber</SelectItem>
                  <SelectItem value="electrical">Electrician</SelectItem>
                  <SelectItem value="painting">Kitchen Appliances</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Description</label><Textarea placeholder="Describe your service in detail..." rows={3} /></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><DollarSign className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Pricing</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Base Price (₹)</label><Input type="number" placeholder="499" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Pricing Type</label>
                <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                    <SelectItem value="range">Price Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Clock className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Duration & Scheduling</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Estimated Duration</label><Input placeholder="1-2 hours" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Max Bookings/Day</label><Input type="number" placeholder="5" /></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white gap-1 rounded-xl"><Plus className="size-4" /> Add Service</Button>
          <Button variant="outline" className="rounded-xl">Cancel</Button>
        </div>
      </div>
    </div>
  )
}
