import { useState } from 'react';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { CheckCircle2, XCircle, Eye, Briefcase } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  basePrice: number;
  isActive: boolean;
  isApproved: boolean;
  approvalStatus: string;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  provider: { id: string; name: string; email: string };
  category: { id: number; name: string };
  subcategory: { id: number; name: string } | null;
}

interface ServicesResponse {
  services: Service[];
  pagination: { page: number; total: number; totalPages: number };
}

function ApprovalBadge({ status }: { status: string }) {
  const config: Record<string, { class: string }> = {
    PENDING: { class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    APPROVED: { class: 'bg-green-100 text-green-800 border-green-200' },
    REJECTED: { class: 'bg-red-100 text-red-800 border-red-200' },
  };
  const c = config[status] || config.PENDING;
  return <Badge variant="outline" className={c.class}>{status}</Badge>;
}

export function AdminServicesPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const buildUrl = () => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter && statusFilter !== 'ALL') params.set('approvalStatus', statusFilter);
    return `/api/admin/services?${params.toString()}`;
  };

  const { data, loading, refetch } = useApi<ServicesResponse>(buildUrl());
  const { mutate } = useApiMutation();

  const services = data?.services || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 0 };

  const handleApprove = async (serviceId: string) => {
    try {
      await mutate(`/api/services/${serviceId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ approvalStatus: 'APPROVED' }),
      });
      refetch();
    } catch {
      // handled
    }
  };

  const handleReject = async (serviceId: string) => {
    try {
      await mutate(`/api/services/${serviceId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ approvalStatus: 'REJECTED' }),
      });
      refetch();
    } catch {
      // handled
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and manage all services</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
              <Briefcase className="mb-4 size-12 opacity-50" />
              <p>No services found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Provider</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.title}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {service.provider?.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {service.provider?.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {service.category?.name}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ₹{service.basePrice?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <ApprovalBadge status={service.approvalStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {service.approvalStatus === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-green-600"
                                onClick={() => handleApprove(service.id)}
                                title="Approve"
                              >
                                <CheckCircle2 className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive"
                                onClick={() => handleReject(service.id)}
                                title="Reject"
                              >
                                <XCircle className="size-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
