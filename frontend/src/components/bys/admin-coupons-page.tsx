'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tag,
  Plus,
  Search,
  Calendar,
  Users,
  Percent,
  IndianRupee,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Gift,
  BarChart3,
  Settings,
  Trash2,
  ToggleLeft,
} from 'lucide-react';

/* ---------- types ---------- */
interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  description?: string;
  category?: string;
}

interface CouponsResponse {
  coupons: Coupon[];
}

/* ---------- discount type config ---------- */
const DISCOUNT_TYPE_CONFIG: Record<string, { icon: typeof Percent; gradient: string; label: string }> = {
  PERCENTAGE: { icon: Percent, gradient: 'from-emerald-400 to-teal-500', label: 'Percentage' },
  FIXED: { icon: IndianRupee, gradient: 'from-sky-400 to-blue-500', label: 'Fixed Amount' },
};

/* ---------- animation ---------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

/* ==================== MAIN COMPONENT ==================== */
export function AdminCouponsPage() {
  const { data, loading, refetch } = useApi<CouponsResponse>('/api/coupons');
  const { mutate, loading: creating } = useApiMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create form state
  const [formCode, setFormCode] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [formDiscountValue, setFormDiscountValue] = useState('');
  const [formMinOrder, setFormMinOrder] = useState('');
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formValidFrom, setFormValidFrom] = useState('');
  const [formValidUntil, setFormValidUntil] = useState('');
  const [formUsageLimit, setFormUsageLimit] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const coupons = data?.coupons || [];

  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const expiredCoupons = coupons.filter((c) => new Date(c.validUntil) < new Date()).length;
  const totalUsage = coupons.reduce((s, c) => s + c.usageCount, 0);

  const filteredCoupons = coupons.filter((coupon) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      coupon.code.toLowerCase().includes(q) ||
      coupon.description?.toLowerCase().includes(q) ||
      coupon.category?.toLowerCase().includes(q)
    );
  });

  const isExpired = (validUntil: string) => new Date(validUntil) < new Date();
  const isUpcoming = (validFrom: string) => new Date(validFrom) > new Date();

  const handleCreate = async () => {
    try {
      await mutate('/api/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: formCode.toUpperCase(),
          discountType: formDiscountType,
          discountValue: parseFloat(formDiscountValue),
          minOrderAmount: parseFloat(formMinOrder) || 0,
          maxDiscount: parseFloat(formMaxDiscount) || 0,
          validFrom: formValidFrom,
          validUntil: formValidUntil,
          usageLimit: parseInt(formUsageLimit) || 0,
          description: formDescription,
        }),
      });
      setCreateOpen(false);
      resetForm();
      refetch();
    } catch {
      // Error handled by useApiMutation
    }
  };

  const resetForm = () => {
    setFormCode('');
    setFormDiscountType('PERCENTAGE');
    setFormDiscountValue('');
    setFormMinOrder('');
    setFormMaxDiscount('');
    setFormValidFrom('');
    setFormValidUntil('');
    setFormUsageLimit('');
    setFormDescription('');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return 'INACTIVE';
    if (isExpired(coupon.validUntil)) return 'EXPIRED';
    if (isUpcoming(coupon.validFrom)) return 'UPCOMING';
    return 'ACTIVE';
  };

  const STATUS_STYLES: Record<string, { className: string; dotColor: string; icon: typeof CheckCircle2; label: string }> = {
    ACTIVE: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-400', icon: CheckCircle2, label: 'Active' },
    INACTIVE: { className: 'bg-gray-50 text-gray-600 border-gray-200', dotColor: 'bg-gray-400', icon: XCircle, label: 'Inactive' },
    EXPIRED: { className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-400', icon: Clock, label: 'Expired' },
    UPCOMING: { className: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-sky-400', icon: Clock, label: 'Upcoming' },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Coupon Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage promotional coupons</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-muted-foreground/20 focus:border-emerald-400"
            />
          </div>
          <Button
            className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 size-4" />
            Create Coupon
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: 'Total Coupons', value: coupons.length, icon: Tag, gradient: 'from-emerald-400 to-teal-500', bgGlow: 'bg-emerald-500/10' },
          { label: 'Active', value: activeCoupons, icon: CheckCircle2, gradient: 'from-sky-400 to-blue-500', bgGlow: 'bg-sky-500/10' },
          { label: 'Expired', value: expiredCoupons, icon: Clock, gradient: 'from-amber-400 to-blue-500', bgGlow: 'bg-amber-500/10' },
          { label: 'Total Usage', value: totalUsage, icon: BarChart3, gradient: 'from-violet-400 to-purple-500', bgGlow: 'bg-violet-500/10' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <div className="glass group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className={`absolute -right-3 -top-3 size-16 rounded-full ${stat.bgGlow} blur-xl transition-all duration-300 group-hover:scale-150`} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`mt-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-xl sm:text-2xl font-bold text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md`}>
                  <stat.icon className="size-5 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Coupon List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 flex flex-col items-center py-16 text-center"
          >
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50">
              <Gift className="size-10 text-emerald-300" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No coupons found</h3>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {searchQuery ? 'Try a different search term' : 'Create your first coupon to attract customers'}
            </p>
            <Button
              className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="mr-2 size-4" />
              Create Coupon
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 space-y-4"
          >
            {filteredCoupons.map((coupon, idx) => {
              const discountConf = DISCOUNT_TYPE_CONFIG[coupon.discountType] || DISCOUNT_TYPE_CONFIG.PERCENTAGE;
              const status = getCouponStatus(coupon);
              const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.ACTIVE;
              const StatusIcon = statusStyle.icon;
              const usagePercent = coupon.usageLimit > 0 ? (coupon.usageCount / coupon.usageLimit) * 100 : 0;

              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-0">
                      <div className={`h-1 bg-gradient-to-r ${status === 'ACTIVE' ? discountConf.gradient : 'from-gray-300 to-gray-400'}`} />
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6">
                        {/* Icon + Code */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                            status === 'ACTIVE'
                              ? `bg-gradient-to-br ${discountConf.gradient} shadow-md`
                              : 'bg-gradient-to-br from-gray-300 to-gray-400'
                          }`}>
                            <discountConf.icon className="size-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold font-mono tracking-wider">{coupon.code}</p>
                              <button
                                onClick={() => copyCode(coupon.code)}
                                className="rounded-md p-1 hover:bg-emerald-50 transition-colors"
                                title="Copy code"
                              >
                                {copiedCode === coupon.code ? (
                                  <CheckCircle2 className="size-4 text-emerald-500" />
                                ) : (
                                  <Copy className="size-4 text-muted-foreground" />
                                )}
                              </button>
                              <Badge variant="outline" className={`${statusStyle.className} gap-1 text-[10px] font-semibold shrink-0`}>
                                <StatusIcon className="size-2.5" />
                                {statusStyle.label}
                              </Badge>
                            </div>
                            {coupon.description && (
                              <p className="mt-1 text-xs text-muted-foreground truncate">{coupon.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Discount Info */}
                        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Discount</p>
                            <p className="text-lg font-bold text-emerald-600">
                              {coupon.discountType === 'PERCENTAGE'
                                ? `${coupon.discountValue}%`
                                : `₹${coupon.discountValue?.toLocaleString('en-IN')}`}
                            </p>
                          </div>

                          <div className="text-center hidden sm:block">
                            <p className="text-xs text-muted-foreground">Min Order</p>
                            <p className="text-sm font-semibold">₹{coupon.minOrderAmount?.toLocaleString('en-IN') || '0'}</p>
                          </div>

                          <div className="text-center hidden sm:block">
                            <p className="text-xs text-muted-foreground">Max Disc.</p>
                            <p className="text-sm font-semibold">₹{coupon.maxDiscount?.toLocaleString('en-IN') || '∞'}</p>
                          </div>

                          {/* Usage Progress */}
                          <div className="w-28">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Usage</span>
                              <span className="font-medium">{coupon.usageCount}/{coupon.usageLimit || '∞'}</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usagePercent > 80 ? 'bg-red-400' : usagePercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                                }`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Validity */}
                          <div className="text-center hidden lg:block min-w-[80px]">
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                              <Calendar className="size-3" />
                              Valid Until
                            </p>
                            <p className="text-xs font-medium">
                              {new Date(coupon.validUntil).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-emerald-50">
                              <Settings className="size-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-red-50">
                              <Trash2 className="size-4 text-muted-foreground hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Coupon Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) setCreateOpen(false); }}>
        <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="size-5 text-emerald-600" />
              Create New Coupon
            </DialogTitle>
            <DialogDescription>
              Set up a new promotional coupon for your customers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Coupon Code */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Coupon Code</Label>
              <Input
                placeholder="e.g., SUMMER2024"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className="rounded-xl font-mono tracking-wider"
              />
              <p className="text-xs text-muted-foreground">Uppercase letters and numbers only</p>
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Discount Type</Label>
                <Select value={formDiscountType} onValueChange={(v: 'PERCENTAGE' | 'FIXED') => setFormDiscountType(v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">
                      <span className="flex items-center gap-2">
                        <Percent className="size-4" />
                        Percentage (%)
                      </span>
                    </SelectItem>
                    <SelectItem value="FIXED">
                      <span className="flex items-center gap-2">
                        <IndianRupee className="size-4" />
                        Fixed Amount (₹)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Discount Value {formDiscountType === 'PERCENTAGE' ? '(%)' : '(₹)'}
                </Label>
                <Input
                  type="number"
                  placeholder={formDiscountType === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 500'}
                  value={formDiscountValue}
                  onChange={(e) => setFormDiscountValue(e.target.value)}
                  className="rounded-xl"
                  min={1}
                  max={formDiscountType === 'PERCENTAGE' ? 100 : undefined}
                />
              </div>
            </div>

            {/* Min Order & Max Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Min. Order Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 500"
                  value={formMinOrder}
                  onChange={(e) => setFormMinOrder(e.target.value)}
                  className="rounded-xl"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Discount (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 200"
                  value={formMaxDiscount}
                  onChange={(e) => setFormMaxDiscount(e.target.value)}
                  className="rounded-xl"
                  min={0}
                />
              </div>
            </div>

            {/* Validity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Valid From</Label>
                <Input
                  type="date"
                  value={formValidFrom}
                  onChange={(e) => setFormValidFrom(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Valid Until</Label>
                <Input
                  type="date"
                  value={formValidUntil}
                  onChange={(e) => setFormValidUntil(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Usage Limit */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Usage Limit</Label>
              <Input
                type="number"
                placeholder="e.g., 100 (leave 0 for unlimited)"
                value={formUsageLimit}
                onChange={(e) => setFormUsageLimit(e.target.value)}
                className="rounded-xl"
                min={0}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description (optional)</Label>
              <Input
                placeholder="Brief description of the coupon"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Preview */}
            {formCode && formDiscountValue && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4"
              >
                <p className="text-xs font-medium text-emerald-700 mb-2">Coupon Preview</p>
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${DISCOUNT_TYPE_CONFIG[formDiscountType].gradient} shadow-md`}>
                    {formDiscountType === 'PERCENTAGE' ? (
                      <Percent className="size-5 text-white" />
                    ) : (
                      <IndianRupee className="size-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold font-mono">{formCode}</p>
                    <p className="text-sm text-emerald-700">
                      {formDiscountType === 'PERCENTAGE'
                        ? `${formDiscountValue}% off`
                        : `₹${formDiscountValue} off`}
                      {formMinOrder && parseFloat(formMinOrder) > 0
                        ? ` on orders above ₹${parseInt(formMinOrder).toLocaleString('en-IN')}`
                        : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => { setCreateOpen(false); resetForm(); }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !formCode || !formDiscountValue || !formValidUntil}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
            >
              {creating ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              {creating ? 'Creating...' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
