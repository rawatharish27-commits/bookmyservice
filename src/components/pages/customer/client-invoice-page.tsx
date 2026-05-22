'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Download, FileText, Calendar, Building2, Hash } from 'lucide-react'

export function ClientInvoicePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Invoice</h1>
          <Button className="gap-1 bg-blue-600 hover:bg-blue-700 rounded-xl"><Download className="size-4" /> Download</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1"><FileText className="size-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">Invoice</h2></div>
                <p className="text-xs text-slate-400">#INV-2025-001</p>
              </div>
              <div className="text-right text-sm text-slate-500">
                <div className="flex items-center gap-1 justify-end"><Calendar className="size-3.5" />15 May 2025</div>
                <div className="flex items-center gap-1 justify-end mt-1"><Building2 className="size-3.5" />MyService Pvt. Ltd.</div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Bill To</h3>
              <p className="text-sm text-slate-600">Rahul Kumar</p>
              <p className="text-sm text-slate-500">42, Rajouri Garden, New Delhi - 110027</p>
              <p className="text-sm text-slate-500">rahul.kumar@email.com</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Service Details</h3>
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 text-xs font-semibold text-slate-600">
                  <span className="col-span-2">Description</span><span className="text-center">Qty</span><span className="text-right">Amount</span>
                </div>
                <div className="grid grid-cols-4 gap-2 p-2.5 text-sm text-slate-700 border-t border-slate-50">
                  <span className="col-span-2">AC Service & Repair</span><span className="text-center">1</span><span className="text-right">₹1,000</span>
                </div>
                <div className="grid grid-cols-4 gap-2 p-2.5 text-sm text-slate-700 border-t border-slate-50">
                  <span className="col-span-2">Parts & Materials</span><span className="text-center">1</span><span className="text-right">₹150</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { label: 'Subtotal', value: '₹1,150' },
                { label: 'CGST (9%)', value: '₹103.50' },
                { label: 'SGST (9%)', value: '₹103.50' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm"><span className="text-slate-500">{item.label}</span><span className="text-slate-700">{item.value}</span></div>
              ))}
              <Separator />
              <div className="flex justify-between text-base font-bold"><span className="text-slate-900">Total</span><span className="text-blue-600">₹1,357.00</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
