'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wallet, Building2, ArrowUpRight, Info } from 'lucide-react'

export function ProviderWithdrawPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Withdraw Funds</h1>

        <Card className="bg-white rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] p-5 text-white">
            <div className="flex items-center gap-2"><Wallet className="size-5" /><span className="text-sm font-medium text-blue-100">Available Balance</span></div>
            <p className="text-3xl font-bold mt-1">₹7,650.00</p>
          </div>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Withdrawal Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Select Bank Account</label>
              <Select defaultValue="hdfc"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hdfc">HDFC Bank ****4532</SelectItem>
                  <SelectItem value="sbi">SBI Bank ****8901</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Amount (₹)</label>
              <Input type="number" placeholder="Enter amount" />
              <div className="flex gap-2 mt-2">
                {['₹1,000', '₹2,000', '₹5,000', 'All'].map((amt) => (
                  <Button key={amt} variant="outline" size="sm" className="text-xs rounded-lg">{amt}</Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200 rounded-xl">
          <CardContent className="p-4">
            <div className="flex gap-3"><Info className="size-4 text-[#1D63FF] shrink-0 mt-0.5" />
              <div className="text-xs text-[#0B3D91]">
                <p className="font-semibold">Withdrawal Info</p>
                <ul className="mt-1 space-y-1 list-disc ml-4">
                  <li>Minimum withdrawal: ₹500</li>
                  <li>Processing time: 1-2 business days</li>
                  <li>No withdrawal fee for amounts above ₹1,000</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1 bg-[#1D63FF] hover:bg-[#0B3D91] gap-1 rounded-xl"><ArrowUpRight className="size-4" /> Withdraw</Button>
          <Button variant="outline" className="rounded-xl">Cancel</Button>
        </div>
      </div>
    </div>
  )
}
