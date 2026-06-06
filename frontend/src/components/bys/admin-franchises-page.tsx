'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  Plus,
  Eye,
  Search,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

interface Franchise {
  id: string;
  name: string;
  slug: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  city: string;
  commissionRate: number;
  totalRevenue: number;
  totalProviders: number;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

interface FranchisesResponse {
  franchises: Franchise[];
  pagination: { page: number; total: number; totalPages: number };
}

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

function FranchiseStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/20',
    ACTIVE: 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/20',
    SUSPENDED: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return (
    <Badge variant="outline" className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString()}`;
}

export function AdminFranchisesPage() {
  const { navigate } = useApp();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formOwnerName, setFormOwnerName] = useState('');
  const [formOwnerEmail, setFormOwnerEmail] = useState('');
  const [formCommission, setFormCommission] = useState('10');
  const [creating, setCreating] = useState(false);

  const buildUrl = () => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
    if (search) params.set('search', search);
    return `/api/franchises?${params.toString()}`;
  };

  const { data, loading, refetch } = useApi<FranchisesResponse>(buildUrl());
  const { mutate } = useApiMutation();

  const franchises = data?.franchises || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 0 };

  const totalRevenue = franchises.reduce((sum, f) => sum + (f.totalRevenue || 0), 0);
  const totalProviders = franchises.reduce((sum, f) => sum + (f.totalProviders || 0), 0);
  const activeCount = franchises.filter((f) => f.status === 'ACTIVE').length;
  const pendingCount = franchises.filter((f) => f.status === 'PENDING').length;

  const resetForm = () => {
    setFormName('');
    setFormCity('');
    setFormOwnerName('');
    setFormOwnerEmail('');
    setFormCommission('10');
  };

  const handleCreate = async () => {
    if (!formName || !formCity || !formOwnerName || !formOwnerEmail) return;
    setCreating(true);
    try {
      await mutate('/api/franchises', {
        method: 'POST',
        body: JSON.stringify({
          name: formName,
          city: formCity,
          ownerName: formOwnerName,
          ownerEmail: formOwnerEmail,
          commissionRate: parseFloat(formCommission),
        }),
      });
      setShowCreate(false);
      resetForm();
      refetch();
    } catch {
      // handled
    } finally {
      setCreating(false);
    }
  };

  const statCards = [
    {
      label: 'Total Franchises',
      value: franchises.length.toString(),
      icon: Building2,
      bgLight: 'bg-[#FFD54F]/5',
      textColor: 'text-[#132D5E]',
      borderColor: 'border-l-[#E0B84C]',
    },
    {
      label: 'Active',
      value: activeCount.toString(),
      icon: TrendingUp,
      bgLight: 'bg-[#FFD54F]/5',
      textColor: 'text-[#132D5E]',
      borderColor: 'border-l-[#E0B84C]',
    },
    {
      label: 'Pending',
      value: pendingCount.toString(),
      icon: Users,
      bgLight: 'bg-[#FFD54F]/5',
      textColor: 'text-[#132D5E]',
      borderColor: 'border-l-[#FFD54F]',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      bgLight: 'bg-[#FFD54F]/5',
      textColor: 'text-[#132D5E]',
      borderColor: 'border-l-[#E0B84C]',
    },
  ];

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0B84C] to-[#FFD54F]">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Franchises</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage franchise partners and locations
            </p>
          </div>
        </div>
        <Button
          className="bg-[#FFD54F] text-[#0A1F44] hover:bg-[#132D5E] hover:text-white"
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Create Franchise
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {statCards.map((card) => {
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
                      <p className={`mt-1 text-xl font-bold ${card.textColor}`}>{card.value}</p>
                    </div>
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${card.bgLight}`}>
                      <Icon className={`size-4 ${card.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="mb-6 mt-6">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search franchises..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      {/* Franchise Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : franchises.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
                <Building2 className="mb-4 size-12 opacity-50" />
                <p className="text-lg font-medium">No franchises found</p>
                <p className="mt-1 text-sm">Create your first franchise to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Franchise</TableHead>
                      <TableHead className="hidden sm:table-cell">Owner</TableHead>
                      <TableHead className="hidden md:table-cell">City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Revenue</TableHead>
                      <TableHead className="hidden lg:table-cell">Providers</TableHead>
                      <TableHead className="hidden xl:table-cell">Commission</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {franchises.map((franchise, index) => (
                      <motion.tr
                        key={franchise.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD54F]/10 to-[#FFD54F]/10">
                              <Building2 className="size-4 text-[#132D5E]" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{franchise.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {franchise.owner?.name}
                              </p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {franchise.city}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          <div>
                            <p>{franchise.owner?.name}</p>
                            <p className="text-xs text-muted-foreground">{franchise.owner?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="size-3 text-muted-foreground" />
                            {franchise.city}
                          </div>
                        </TableCell>
                        <TableCell>
                          <FranchiseStatusBadge status={franchise.status} />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm font-medium">
                          {formatCurrency(franchise.totalRevenue || 0)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="size-3 text-muted-foreground" />
                            {franchise.totalProviders || 0}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">
                          <Badge variant="secondary" className="bg-[#FFD54F]/5 text-[#132D5E]">
                            {franchise.commissionRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8"
                            onClick={() =>
                              navigate('admin-franchise-detail', { franchiseId: franchise.id })
                            }
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
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
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Franchise Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#E0B84C] to-[#FFD54F]">
                <Building2 className="size-4 text-[#0A1F44]" />
              </div>
              Create Franchise
            </DialogTitle>
            <DialogDescription>
              Add a new franchise partner to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Franchise Name *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. BookYourService Mumbai"
              />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Input
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                placeholder="e.g. Mumbai"
              />
            </div>
            <Separator />
            <p className="text-sm font-medium text-muted-foreground">Owner Details</p>
            <div className="space-y-2">
              <Label>Owner Name *</Label>
              <Input
                value={formOwnerName}
                onChange={(e) => setFormOwnerName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Owner Email *</Label>
              <Input
                type="email"
                value={formOwnerEmail}
                onChange={(e) => setFormOwnerEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formCommission}
                onChange={(e) => setFormCommission(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-[#FFD54F] text-[#0A1F44] hover:bg-[#132D5E] hover:text-white"
              onClick={handleCreate}
              disabled={creating || !formName || !formCity || !formOwnerName || !formOwnerEmail}
            >
              {creating ? (
                'Creating...'
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  Create Franchise
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
