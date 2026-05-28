'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Save, Clock, DollarSign } from 'lucide-react'

export function ProviderEditServicePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Service</h1>
            <p className="text-sm text-slate-500 mt-1">Air Conditioner</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Active</Badge>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Service Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Service Name</label><Input defaultValue="Air Conditioner" /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
              <Select defaultValue="appliance"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="appliance">Kitchen Appliances</SelectItem>
                  <SelectItem value="cleaning">Water Tank Cleaning</SelectItem>
                  <SelectItem value="plumbing">Plumber</SelectItem>
                  <SelectItem value="electrical">Electrician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
              <Textarea defaultValue="Professional AC repair, gas refilling, and annual maintenance service for all brands." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><DollarSign className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Pricing</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Base Price (₹)</label><Input type="number" defaultValue="499" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Pricing Type</label>
                <Select defaultValue="fixed"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Clock className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Duration</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Estimated Duration</label><Input defaultValue="1-2 hours" /></div>
              <div><label className="text-xs font-medium text-slate-500 mb-1 block">Max Bookings/Day</label><Input type="number" defaultValue="5" /></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] gap-1 rounded-xl"><Save className="size-4" /> Update Service</Button>
          <Button variant="outline" className="rounded-xl">Cancel</Button>
        </div>
      </div>
    </div>
  )
}
