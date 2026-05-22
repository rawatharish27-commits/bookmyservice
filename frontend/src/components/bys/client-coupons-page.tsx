'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Ticket,
  Copy,
  CheckCircle2,
  Percent,
  IndianRupee,
  Clock,
  ShoppingCart,
  Loader2,
  Tag,
  Gift,
  Sparkles,
  XCircle,
  Check,
} from 'lucide-react';

/* ---------- animation variants ---------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

/* ---------- types ---------- */
interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  applicableType: string;
  usageLimit?: number;
  usedCount?: number;
  description?: string;
}

interface ValidationResult {
  valid: boolean;
  discountAmount: number;
  discountType: string;
  discountValue: number;
  message: string;
  couponCode: string;
  minOrderAmount?: number;
  maxDiscount?: number;
}

/* ---------- applicable type config ---------- */
const TYPE_CONFIG: Record<string, { gradient: string; bg: string; label: string }> = {
  ALL: { gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'All Services' },
  AIR_CONDITIONER: { gradient: 'from-teal-400 to-emerald-500', bg: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Air Conditioner' },
  REFRIGERATOR: { gradient: 'from-sky-400 to-blue-500', bg: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Refrigerator' },
  WASHING_MACHINE: { gradient: 'from-indigo-400 to-violet-500', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Washing Machine' },
  KITCHEN_APPLIANCES: { gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Kitchen Appliances' },
  TV_REPAIR: { gradient: 'from-rose-400 to-pink-500', bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'TV Repair' },
  WATER_PURIFIER: { gradient: 'from-cyan-400 to-teal-500', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Water Purifier' },
  GEYSER: { gradient: 'from-red-400 to-orange-500', bg: 'bg-red-50 text-red-700 border-red-200', label: 'Geyser' },
  PLUMBING: { gradient: 'from-blue-400 to-cyan-500', bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Plumber' },
  ELECTRICAL: { gradient: 'from-cyan-400 to-yellow-500', bg: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Electrician' },
  WATER_TANK_CLEANING: { gradient: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Water Tank Cleaning' },
  MOVERS_AND_PACKERS: { gradient: 'from-emerald-400 to-lime-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Movers and Packers' },
  HVAC: { gradient: 'from-teal-400 to-emerald-500', bg: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Air Conditioner' },
  APPLIANCE: { gradient: 'from-rose-400 to-pink-500', bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Appliance' },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] || { gradient: 'from-gray-400 to-gray-500', bg: 'bg-gray-50 text-gray-700 border-gray-200', label: type };
}

/* ==================== MAIN COMPONENT ==================== */
export function ClientCouponsPage() {
  const { user } = useAuth();
  const { data: couponsData, loading: couponsLoading, refetch } = useApi<{ coupons: Coupon[] }>('/api/coupons');
  const { mutate, loading: validating } = useApiMutation();

  const [couponCode, setCouponCode] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = couponsData?.coupons || [];

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Fallback - do nothing
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidationResult(null);
    setValidationError(null);
    try {
      const result = await mutate('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      setValidationResult(result as ValidationResult);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Invalid coupon code');
    }
  };

  const handleApplyFromCard = (code: string) => {
    setCouponCode(code);
    setValidationResult(null);
    setValidationError(null);
    // Auto-scroll to apply section
    document.getElementById('apply-coupon-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isExpired = (validUntil: string) => new Date(validUntil) < new Date();
  const isUpcoming = (validFrom: string) => new Date(validFrom) > new Date();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Coupons & Offers</h1>
        <p className="text-sm text-muted-foreground">Browse available coupons and save on your bookings</p>
      </motion.div>

      {/* Hero Banner */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4 }}
        className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 shadow-xl shadow-emerald-500/20"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-100">
              <Sparkles className="size-5" />
              <span className="text-sm font-medium">Exclusive Savings</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              Save More on Every Booking
            </h2>
            <p className="mt-1 text-emerald-100/80">
              Apply coupons at checkout and enjoy instant discounts on your favorite services
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white">{coupons.length}</span>
              <span className="text-xs text-emerald-200">Coupons</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Available Coupons Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available Coupons</h2>
          {coupons.length > 0 && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              {coupons.length} Available
            </Badge>
          )}
        </div>

        {couponsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 py-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50">
              <Ticket className="size-8 text-emerald-300" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No Coupons Available</h3>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Check back soon for new coupons and exclusive offers!
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {coupons.map((coupon) => {
              const typeConf = getTypeConfig(coupon.applicableType);
              const expired = isExpired(coupon.validUntil);
              const upcoming = isUpcoming(coupon.validFrom);
              const isCopied = copiedCode === coupon.code;

              return (
                <motion.div key={coupon.id} variants={fadeUp}>
                  <Card className={`group relative overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-md ${
                    expired ? 'opacity-60' : ''
                  }`}>
                    {/* Top gradient bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${typeConf.gradient}`} />

                    {/* Dashed side decoration */}
                    <div className="absolute left-0 top-8 -translate-x-1/2 size-4 rounded-full bg-background" />
                    <div className="absolute right-0 top-8 translate-x-1/2 size-4 rounded-full bg-background" />

                    <CardContent className="p-5">
                      {/* Discount badge & applicable type */}
                      <div className="flex items-start justify-between">
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${typeConf.gradient} shadow-lg`}>
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <Percent className="size-6 text-white" />
                          ) : (
                            <IndianRupee className="size-6 text-white" />
                          )}
                        </div>
                        <Badge variant="outline" className={`gap-1 text-[10px] font-semibold ${typeConf.bg}`}>
                          {typeConf.label}
                        </Badge>
                      </div>

                      {/* Discount value */}
                      <div className="mt-4">
                        {coupon.discountType === 'PERCENTAGE' ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-emerald-600">{coupon.discountValue}</span>
                            <span className="text-lg font-semibold text-emerald-600">% OFF</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <IndianRupee className="size-5 text-emerald-600" />
                            <span className="text-3xl font-bold text-emerald-600">{coupon.discountValue}</span>
                            <span className="text-lg font-semibold text-emerald-600">OFF</span>
                          </div>
                        )}
                      </div>

                      {/* Coupon code */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/60 px-3 py-2">
                          <p className="text-center font-mono text-sm font-bold tracking-wider text-emerald-700">
                            {coupon.code}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className={`shrink-0 rounded-lg size-9 transition-all ${
                            isCopied
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                              : 'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                          onClick={() => handleCopyCode(coupon.code)}
                        >
                          {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </Button>
                      </div>

                      {/* Min order & max discount */}
                      <div className="mt-3 space-y-1.5">
                        {coupon.minOrderAmount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ShoppingCart className="size-3.5" />
                            <span>Min order: ₹{coupon.minOrderAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {coupon.maxDiscount && coupon.discountType === 'PERCENTAGE' && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <IndianRupee className="size-3.5" />
                            <span>Max discount: ₹{coupon.maxDiscount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      <Separator className="my-3" />

                      {/* Validity & status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          <span>
                            {upcoming
                              ? `Starts ${formatDate(coupon.validFrom)}`
                              : `Valid till ${formatDate(coupon.validUntil)}`}
                          </span>
                        </div>
                        {expired ? (
                          <Badge variant="outline" className="gap-1 text-[10px] font-semibold border-gray-200 bg-gray-50 text-gray-500">
                            <XCircle className="size-2.5" />
                            Expired
                          </Badge>
                        ) : upcoming ? (
                          <Badge variant="outline" className="gap-1 text-[10px] font-semibold border-sky-200 bg-sky-50 text-sky-700">
                            <Clock className="size-2.5" />
                            Upcoming
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-[10px] font-semibold border-emerald-200 bg-emerald-50 text-emerald-700">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            Active
                          </Badge>
                        )}
                      </div>

                      {/* Apply button */}
                      {!expired && !upcoming && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleApplyFromCard(coupon.code)}
                        >
                          <Tag className="mr-1.5 size-3.5" />
                          Apply This Coupon
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Apply Coupon Section */}
      <motion.div
        id="apply-coupon-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Ticket className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Apply Coupon</h2>
                <p className="text-xs text-muted-foreground">Enter a coupon code to check your discount</p>
              </div>
            </div>
          </div>

          <CardContent className="p-5">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setValidationResult(null);
                    setValidationError(null);
                  }}
                  className="pl-9 rounded-xl font-mono uppercase tracking-wider"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleValidateCoupon();
                  }}
                />
              </div>
              <Button
                onClick={handleValidateCoupon}
                disabled={!couponCode.trim() || validating}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 px-6"
              >
                {validating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Validate
                  </>
                )}
              </Button>
            </div>

            {/* Validation Result */}
            <AnimatePresence mode="wait">
              {validationResult && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-5">
                    <div className="flex items-start gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100"
                      >
                        <CheckCircle2 className="size-5 text-emerald-600" />
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-bold text-emerald-800">Coupon Applied Successfully!</h4>
                        <p className="mt-1 text-sm text-emerald-700">{validationResult.message}</p>

                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          <div className="rounded-lg bg-white/60 p-3">
                            <p className="text-xs text-emerald-600/70">Coupon Code</p>
                            <p className="mt-0.5 font-mono text-sm font-bold text-emerald-800">
                              {validationResult.couponCode}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/60 p-3">
                            <p className="text-xs text-emerald-600/70">Discount</p>
                            <p className="mt-0.5 text-sm font-bold text-emerald-800">
                              {validationResult.discountType === 'PERCENTAGE'
                                ? `${validationResult.discountValue}% OFF`
                                : `₹${validationResult.discountValue} OFF`}
                            </p>
                          </div>
                          <div className="col-span-2 rounded-lg bg-white/60 p-3 sm:col-span-1">
                            <p className="text-xs text-emerald-600/70">You Save</p>
                            <p className="mt-0.5 text-lg font-bold text-emerald-800">
                              ₹{validationResult.discountAmount?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {validationResult.minOrderAmount && validationResult.minOrderAmount > 0 && (
                          <p className="mt-2 text-xs text-emerald-600/70">
                            * Minimum order amount: ₹{validationResult.minOrderAmount.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {validationError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-5">
                    <div className="flex items-start gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100"
                      >
                        <XCircle className="size-5 text-red-600" />
                      </motion.div>
                      <div>
                        <h4 className="font-bold text-red-800">Invalid Coupon</h4>
                        <p className="mt-1 text-sm text-red-700">{validationError}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
