'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Download, FileText, Calendar, Building2, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/use-api'

interface InvoiceData {
  invoiceNumber: string
  date: string
  company: string
  billTo: { name: string; address: string; email: string }
  lineItems: { description: string; qty: number; amount: string }[]
  subtotal: string
  cgst: string
  sgst: string
  total: string
}

export function ClientInvoicePage() {
  const { data: invoice, loading, error, refetch } = useApi<InvoiceData>(async () => {
    const res = await fetch('/api/client/invoice')
    if (!res.ok) throw new Error('Failed to load invoice')
    return res.json()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center" role="status" aria-label="Loading invoice">
        <Loader2 className="size-8 text-[#1D63FF] animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500" role="alert">Failed to load invoice</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center">
        <p className="text-slate-500">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Invoice</h1>
          <Button className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-xl" aria-label="Download invoice"><Download className="size-4" /> Download</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1"><FileText className="size-5 text-[#1D63FF]" /><h2 className="text-lg font-bold text-slate-900">Invoice</h2></div>
                <p className="text-xs text-slate-400">#{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right text-sm text-slate-500">
                <div className="flex items-center gap-1 justify-end"><Calendar className="size-3.5" />{invoice.date}</div>
                <div className="flex items-center gap-1 justify-end mt-1"><Building2 className="size-3.5" />{invoice.company}</div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Bill To</h3>
              <p className="text-sm text-slate-600">{invoice.billTo.name}</p>
              <p className="text-sm text-slate-500">{invoice.billTo.address}</p>
              <p className="text-sm text-slate-500">{invoice.billTo.email}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Service Details</h3>
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 text-xs font-semibold text-slate-600">
                  <span className="col-span-2">Description</span><span className="text-center">Qty</span><span className="text-right">Amount</span>
                </div>
                {invoice.lineItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 p-2.5 text-sm text-slate-700 border-t border-slate-50">
                    <span className="col-span-2">{item.description}</span><span className="text-center">{item.qty}</span><span className="text-right">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { label: 'Subtotal', value: invoice.subtotal },
                { label: 'CGST (9%)', value: invoice.cgst },
                { label: 'SGST (9%)', value: invoice.sgst },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm"><span className="text-slate-500">{item.label}</span><span className="text-slate-700">{item.value}</span></div>
              ))}
              <Separator />
              <div className="flex justify-between text-base font-bold"><span className="text-slate-900">Total</span><span className="text-[#1D63FF]">{invoice.total}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
