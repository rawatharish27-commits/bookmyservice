'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { apiUrl } from '@/lib/api-url';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
type PositionFilter = 'all' | 'area-manager' | 'local-admin';
type StatusFilter = 'ALL' | ApplicationStatus;

interface ParsedMessage {
  phone?: string;
  city?: string;
  area?: string;
  experience?: string;
  position?: string;
  status?: string;
  [key: string]: unknown;
}

interface JobApplication {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  // Parsed helpers
  parsedMessage?: ParsedMessage;
  position: 'area-manager' | 'local-admin';
  applicantPhone?: string;
  applicantCity?: string;
  applicantArea?: string;
  applicantExperience?: string;
  status: ApplicationStatus;
}

interface ApplicationStats {
  total: number;
  areaManager: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
  localAdmin: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
}

interface StatsResponse {
  stats: ApplicationStats;
}

interface ApplicationsResponse {
  applications: JobApplication[];
  total: number;
  page: number;
  limit: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseMessage(raw: string): ParsedMessage {
  try {
    return JSON.parse(raw) as ParsedMessage;
  } catch {
    return {};
  }
}

function derivePosition(subject: string): 'area-manager' | 'local-admin' {
  if (subject?.toLowerCase().includes('local-admin')) return 'local-admin';
  return 'area-manager';
}

function deriveStatus(app: JobApplication): ApplicationStatus {
  // The parsed message may carry a status field; otherwise default to PENDING
  const parsed = parseMessage(app.message);
  const raw = (parsed?.status || 'PENDING').toString().toUpperCase().replace(/ /g, '_') as ApplicationStatus;
  if (['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(raw)) return raw;
  return 'PENDING';
}

function enrichApplication(app: JobApplication): JobApplication {
  const parsed = parseMessage(app.message);
  const position = derivePosition(app.subject);
  const status = deriveStatus(app);
  return {
    ...app,
    parsedMessage: parsed,
    position,
    applicantPhone: parsed.phone,
    applicantCity: parsed.city,
    applicantArea: parsed.area,
    applicantExperience: parsed.experience,
    status,
  };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function positionLabel(pos: 'area-manager' | 'local-admin'): string {
  return pos === 'area-manager' ? 'Area Manager' : 'Local Admin';
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config: Record<ApplicationStatus, { label: string; className: string }> = {
    PENDING: {
      label: 'Pending',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      className: 'bg-[#1D63FF]/10 text-[#0D3B7A] border-[#1D63FF]/20',
    },
    APPROVED: {
      label: 'Approved',
      className: 'bg-[#FFCE32]/10 text-[#0D3B7A] border-[#FFCE32]/30',
    },
    REJECTED: {
      label: 'Rejected',
      className: 'bg-rose-100 text-rose-800 border-rose-200',
    },
  };
  const { label, className } = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${className} font-medium`}>
      {label}
    </Badge>
  );
}

function PositionBadge({ position }: { position: 'area-manager' | 'local-admin' }) {
  return position === 'area-manager' ? (
    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-medium">
      <Shield className="mr-1 size-3" />
      Area Manager
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-[#FFCE32]/10 text-[#0D3B7A] border-[#FFCE32]/30 font-medium">
      <Briefcase className="mr-1 size-3" />
      Local Admin
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AdminJobApplicationsPage() {
  const { token } = useAuth();

  // State
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailApp, setDetailApp] = useState<JobApplication | null>(null);

  // -----------------------------------------------------------------------
  // Fetch helpers
  // -----------------------------------------------------------------------

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(apiUrl('/api/job-applications/stats'), { headers });
      if (!res.ok) throw new Error('Failed to load stats');
      const data: StatsResponse = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (positionFilter !== 'all') params.set('position', positionFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(apiUrl(`/api/job-applications?${params.toString()}`), { headers });
      if (!res.ok) throw new Error('Failed to load applications');
      const data: ApplicationsResponse = await res.json();
      const enriched = (data.applications || []).map(enrichApplication);
      setApplications(enriched);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Applications fetch error:', err);
    } finally {
      setLoadingApps(false);
    }
  }, [token, page, limit, positionFilter, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const handleStatusUpdate = async (appId: string, newStatus: ApplicationStatus) => {
    setActionLoading(appId);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(apiUrl(`/api/job-applications/${appId}/status`), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update status');
      }
      toast.success(
        `Application ${newStatus === 'UNDER_REVIEW' ? 'marked as Under Review' : newStatus === 'APPROVED' ? 'approved' : 'rejected'} successfully`
      );
      // Refresh lists
      await Promise.all([fetchStats(), fetchApplications()]);
      // Update detail panel if open
      if (detailApp?.id === appId) {
        setDetailApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchApplications();
    toast.success('Data refreshed');
  };

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pendingCount = stats
    ? stats.areaManager.pending + stats.localAdmin.pending
    : 0;
  const approvedCount = stats
    ? stats.areaManager.approved + stats.localAdmin.approved
    : 0;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A2463] via-[#0D3B7A] to-[#1D63FF]">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Review and manage Area Manager &amp; Local Admin applications
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-[#1D63FF] text-[#0D3B7A] hover:bg-[#1D63FF]/5"
          onClick={handleRefresh}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      >
        {[
          {
            label: 'Total Applications',
            value: stats?.total ?? 0,
            icon: Users,
            bgLight: 'bg-[#1D63FF]/5',
            textColor: 'text-[#1D63FF]',
            borderColor: 'border-l-[#1D63FF]',
          },
          {
            label: 'Area Manager',
            value: stats?.areaManager.total ?? 0,
            icon: Shield,
            bgLight: 'bg-indigo-50',
            textColor: 'text-indigo-700',
            borderColor: 'border-l-indigo-500',
          },
          {
            label: 'Local Admin',
            value: stats?.localAdmin.total ?? 0,
            icon: Briefcase,
            bgLight: 'bg-[#FFCE32]/10',
            textColor: 'text-[#0D3B7A]',
            borderColor: 'border-l-[#1D63FF]',
          },
          {
            label: 'Pending',
            value: pendingCount,
            icon: Clock,
            bgLight: 'bg-amber-50',
            textColor: 'text-amber-700',
            borderColor: 'border-l-amber-500',
          },
          {
            label: 'Approved',
            value: approvedCount,
            icon: CheckCircle2,
            bgLight: 'bg-[#FFCE32]/10',
            textColor: 'text-[#0D3B7A]',
            borderColor: 'border-l-[#1D63FF]',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <Card className={`border-l-4 ${card.borderColor} transition-shadow hover:shadow-md`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-muted-foreground">
                        {card.label}
                      </p>
                      {loadingStats ? (
                        <Skeleton className="mt-1 h-7 w-16" />
                      ) : (
                        <p className={`mt-1 text-xl font-bold ${card.textColor}`}>
                          {card.value}
                        </p>
                      )}
                    </div>
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${card.bgLight}`}
                    >
                      <Icon className={`size-4 ${card.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Filter & Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-8"
      >
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#0A2463] via-[#0D3B7A] to-[#1D63FF]" />
          <CardContent className="p-0">
            <Tabs
              value={positionFilter}
              onValueChange={(v) => {
                setPositionFilter(v as PositionFilter);
                setPage(1);
              }}
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-3">
                  <TabsTrigger value="all" className="gap-1.5">
                    <Users className="size-3.5" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="area-manager" className="gap-1.5">
                    <Shield className="size-3.5" />
                    Area Manager
                  </TabsTrigger>
                  <TabsTrigger value="local-admin" className="gap-1.5">
                    <Briefcase className="size-3.5" />
                    Local Admin
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="size-4" />
                    Status:
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter(v as StatusFilter);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabs Content – same table for all, the filter drives the data */}
              <TabsContent value={positionFilter} className="m-0">
                {loadingApps ? (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-14" />
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
                    <Briefcase className="mb-4 size-12 opacity-50" />
                    <p className="text-lg font-medium">No applications found</p>
                    <p className="mt-1 text-sm">
                      {statusFilter !== 'ALL'
                        ? 'Try changing the status filter'
                        : 'Applications will appear here when candidates apply'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Applicant</TableHead>
                          <TableHead className="hidden sm:table-cell">Position</TableHead>
                          <TableHead className="hidden md:table-cell">City</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden lg:table-cell">Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {applications.map((app, index) => (
                            <motion.tr
                              key={app.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.25, delay: index * 0.03 }}
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0A2463] to-[#0D3B7A] text-white text-sm font-bold">
                                    {app.name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-sm">
                                      {app.name || 'Unknown'}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {app.email}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground sm:hidden">
                                      {positionLabel(app.position)}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <PositionBadge position={app.position} />
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm">
                                {app.applicantCity || '—'}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={app.status} />
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                {formatDate(app.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    title="View details"
                                    onClick={() => setDetailApp(app)}
                                  >
                                    <Eye className="size-4" />
                                  </Button>

                                  {app.status === 'PENDING' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="size-8 p-0 text-[#1D63FF] hover:bg-[#1D63FF]/5 hover:text-[#1D63FF]"
                                      title="Mark as Under Review"
                                      disabled={actionLoading === app.id}
                                      onClick={() =>
                                        handleStatusUpdate(app.id, 'UNDER_REVIEW')
                                      }
                                    >
                                      <Clock className="size-4" />
                                    </Button>
                                  )}

                                  {app.status !== 'APPROVED' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="size-8 p-0 text-[#1D63FF] hover:bg-[#FFCE32]/10 hover:text-[#0D3B7A]"
                                      title="Approve"
                                      disabled={actionLoading === app.id}
                                      onClick={() =>
                                        handleStatusUpdate(app.id, 'APPROVED')
                                      }
                                    >
                                      <CheckCircle2 className="size-4" />
                                    </Button>
                                  )}

                                  {app.status !== 'REJECTED' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="size-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                      title="Reject"
                                      disabled={actionLoading === app.id}
                                      onClick={() =>
                                        handleStatusUpdate(app.id, 'REJECTED')
                                      }
                                    >
                                      <XCircle className="size-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Detail Drawer / Dialog */}
      <AnimatePresence>
        {detailApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-end bg-black/40"
            onClick={() => setDetailApp(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer header */}
              <div className="relative overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#0A2463] via-[#0D3B7A] to-[#1D63FF]" />
                <div className="bg-gradient-to-br from-[#0A2463] via-[#0D3B7A] to-[#1D63FF] px-6 pb-6 pt-8 text-white">
                  <button
                    onClick={() => setDetailApp(null)}
                    className="absolute right-4 top-4 rounded-lg bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <XCircle className="size-5" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl font-bold backdrop-blur-sm">
                      {detailApp.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold">
                        {detailApp.name || 'Unknown'}
                      </h2>
                      <p className="truncate text-sm text-[#FFE066]">{detailApp.email}</p>
                      <div className="mt-2">
                        <StatusBadge status={detailApp.status} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Position */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Position Applied
                    </h3>
                    <PositionBadge position={detailApp.position} />
                  </div>

                  {/* Contact Details */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Contact Details
                    </h3>
                    <div className="space-y-2 rounded-xl border bg-gray-50/50 p-4">
                      {[
                        { label: 'Email', value: detailApp.email },
                        { label: 'Phone', value: detailApp.applicantPhone },
                        { label: 'City', value: detailApp.applicantCity },
                        { label: 'Area / Pincode', value: detailApp.applicantArea },
                        { label: 'Experience', value: detailApp.applicantExperience },
                        { label: 'Applied On', value: formatDate(detailApp.createdAt) },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-medium text-gray-900">
                            {row.value || '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raw Message (if any extra data) */}
                  {detailApp.message && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Additional Information
                      </h3>
                      <div className="rounded-xl border bg-gray-50/50 p-4">
                        <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground">
                          {(() => {
                            try {
                              return JSON.stringify(JSON.parse(detailApp.message), null, 2);
                            } catch {
                              return detailApp.message;
                            }
                          })()}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer footer — actions */}
              <div className="border-t bg-gray-50 p-4">
                <div className="flex flex-wrap gap-2">
                  {detailApp.status === 'PENDING' && (
                    <Button
                      className="flex-1 gap-2 bg-[#1D63FF] text-white hover:bg-[#0D3B7A]"
                      disabled={actionLoading === detailApp.id}
                      onClick={() =>
                        handleStatusUpdate(detailApp.id, 'UNDER_REVIEW')
                      }
                    >
                      <Clock className="size-4" />
                      Mark Under Review
                    </Button>
                  )}
                  {detailApp.status !== 'APPROVED' && (
                    <Button
                      className="flex-1 gap-2 bg-[#1D63FF] text-white hover:bg-[#0D3B7A]"
                      disabled={actionLoading === detailApp.id}
                      onClick={() =>
                        handleStatusUpdate(detailApp.id, 'APPROVED')
                      }
                    >
                      <CheckCircle2 className="size-4" />
                      Approve
                    </Button>
                  )}
                  {detailApp.status !== 'REJECTED' && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
                      disabled={actionLoading === detailApp.id}
                      onClick={() =>
                        handleStatusUpdate(detailApp.id, 'REJECTED')
                      }
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
