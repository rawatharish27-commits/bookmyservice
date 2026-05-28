'use client';

import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  Calendar,
  MapPin,
  Building2,
  User,
  Mail,
  Phone,
  Hash,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

/* ---------- types ---------- */
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  client: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
  };
  provider: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
  };
  lineItems: LineItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  discount: number;
  total: number;
  paidAmount?: number;
  bookingNumber?: string;
  serviceTitle?: string;
  notes?: string;
}

/* ---------- status config ---------- */
const STATUS_CONFIG: Record<string, { className: string; gradient: string; icon: typeof CheckCircle2; label: string }> = {
  PAID: {
    className: 'bg-[#1D63FF]/5 text-[#0D3B7A] border-[#1D63FF]/20',
    gradient: 'from-[#7DB0FF] to-[#4D8AFF]',
    icon: CheckCircle2,
    label: 'Paid',
  },
  PENDING: {
    className: 'bg-[#1D63FF]/5 text-[#0D3B7A] border-[#1D63FF]/20',
    gradient: 'from-[#FFE066] to-[#4D8AFF]',
    icon: Clock,
    label: 'Pending',
  },
  OVERDUE: {
    className: 'bg-red-50 text-red-700 border-red-200',
    gradient: 'from-red-400 to-rose-500',
    icon: AlertCircle,
    label: 'Overdue',
  },
  CANCELLED: {
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    gradient: 'from-gray-400 to-gray-500',
    icon: AlertCircle,
    label: 'Cancelled',
  },
};

/* ---------- animation ---------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ==================== MAIN COMPONENT ==================== */
export function ClientInvoiceDetailPage() {
  const { nav, goBack } = useApp();
  const invoiceId = nav.params?.id;
  const { data, loading } = useApi<InvoiceDetail>(invoiceId ? `/api/invoices/${invoiceId}` : null);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-4 h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const invoice = data;
  if (!invoice) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D63FF]/10 to-[#1D63FF]/5">
            <FileText className="size-10 text-[#9DC2FF]" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-muted-foreground">Invoice not found</h3>
          <Button className="mt-4 bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white" onClick={goBack}>
            <ArrowLeft className="mr-2 size-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConf.icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0 rounded-xl">
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">View your invoice details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 size-4" />
            Print
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg shadow-[#4D8AFF]/25"
            onClick={() => {
              // Placeholder for PDF download
              alert('PDF download will be available soon');
            }}
          >
            <Download className="mr-2 size-4" />
            Download PDF
          </Button>
        </div>
      </motion.div>

      {/* Invoice Card */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          {/* Status Banner */}
          <div className={`h-2 bg-gradient-to-r ${statusConf.gradient}`} />

          <CardHeader className="bg-gradient-to-r from-[#1D63FF]/5 to-[#1D63FF]/5 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${statusConf.gradient} shadow-md`}>
                  <Receipt className="size-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{invoice.invoiceNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">{invoice.serviceTitle || 'Service Invoice'}</p>
                </div>
              </div>
              <Badge variant="outline" className={`${statusConf.className} gap-1.5 px-3 py-1.5 text-sm font-semibold self-start`}>
                <StatusIcon className="size-4" />
                {statusConf.label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Hash className="size-3" />
                  Invoice No.
                </div>
                <p className="text-sm font-semibold">{invoice.invoiceNumber}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  Invoice Date
                </div>
                <p className="text-sm font-semibold">
                  {new Date(invoice.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  Due Date
                </div>
                <p className="text-sm font-semibold">
                  {invoice.dueDate
                    ? new Date(invoice.dueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'On Receipt'}
                </p>
              </div>
              {invoice.bookingNumber && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Hash className="size-3" />
                    Booking No.
                  </div>
                  <p className="text-sm font-semibold">{invoice.bookingNumber}</p>
                </div>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Client & Provider Info */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
              {/* Billed To */}
              <div className="rounded-xl bg-gray-50/80 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="size-4 text-[#1D63FF]" />
                  <span className="text-sm font-semibold text-[#0D3B7A]">Billed To</span>
                </div>
                <p className="text-sm font-bold">{invoice.client.name}</p>
                {invoice.client.email && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="size-3" />
                    {invoice.client.email}
                  </div>
                )}
                {invoice.client.phone && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="size-3" />
                    {invoice.client.phone}
                  </div>
                )}
                {invoice.client.address && (
                  <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3 mt-0.5 shrink-0" />
                    {invoice.client.address}
                  </div>
                )}
                {invoice.client.gstNumber && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#1D63FF]/10 px-2 py-0.5 text-xs font-medium text-[#0D3B7A]">
                    GST: {invoice.client.gstNumber}
                  </div>
                )}
              </div>

              {/* From */}
              <div className="rounded-xl bg-gray-50/80 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="size-4 text-[#1D63FF]" />
                  <span className="text-sm font-semibold text-[#0D3B7A]">From</span>
                </div>
                <p className="text-sm font-bold">{invoice.provider?.name || 'Unknown Provider'}</p>
                {invoice.provider?.email && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="size-3" />
                    {invoice.provider.email}
                  </div>
                )}
                {invoice.provider?.phone && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="size-3" />
                    {invoice.provider.phone}
                  </div>
                )}
                {invoice.provider?.address && (
                  <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3 mt-0.5 shrink-0" />
                    {invoice.provider.address}
                  </div>
                )}
                {invoice.provider?.gstNumber && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#1D63FF]/10 px-2 py-0.5 text-xs font-medium text-[#0D3B7A]">
                    GST: {invoice.provider.gstNumber}
                  </div>
                )}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Line Items Table */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Line Items</h3>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#1D63FF]/5 to-[#1D63FF]/5">
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Qty</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Unit Price</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems?.map((item, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{item.description}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          ₹{item.unitPrice?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ₹{item.total?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                    {(!invoice.lineItems || invoice.lineItems.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                          No line items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{invoice.subtotal?.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    GST ({invoice.gstRate || 18}%)
                  </span>
                  <span className="font-medium">₹{invoice.gstAmount?.toLocaleString('en-IN')}</span>
                </div>

                {invoice.discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#1D63FF]">Discount</span>
                    <span className="font-medium text-[#1D63FF]">
                      -₹{invoice.discount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">Total</span>
                  <span className="bg-gradient-to-r from-[#1D63FF] to-[#1D63FF] bg-clip-text text-xl font-bold text-transparent">
                    ₹{invoice.total?.toLocaleString('en-IN')}
                  </span>
                </div>

                {invoice.paidAmount !== undefined && invoice.paidAmount > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#1D63FF]">Paid</span>
                      <span className="font-medium text-[#1D63FF]">
                        ₹{invoice.paidAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {invoice.total - invoice.paidAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#1D63FF]">Balance Due</span>
                        <span className="font-bold text-[#1D63FF]">
                          ₹{(invoice.total - invoice.paidAmount)?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <>
                <Separator className="mt-6 mb-4" />
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{invoice.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between"
      >
        <Button variant="outline" onClick={goBack} className="rounded-xl">
          <ArrowLeft className="mr-2 size-4" /> Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 size-4" />
            Print Invoice
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-[#4D8AFF] to-[#1D63FF] text-white shadow-lg shadow-[#4D8AFF]/25"
            onClick={() => alert('PDF download will be available soon')}
          >
            <Download className="mr-2 size-4" />
            Download PDF
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
