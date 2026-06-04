import { useState } from 'react';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileWarning, Eye, CheckCircle2 } from 'lucide-react';

interface Dispute {
  id: string;
  disputeType: string;
  description: string;
  status: string;
  evidence?: string;
  resolution?: string;
  createdAt: string;
  booking: {
    id: string;
    bookingNumber: string;
    service: { id: string; title: string };
  };
  raiser: { id: string; name: string; profileImageUrl?: string };
  assignee: { id: string; name: string } | null;
}

interface DisputesResponse {
  disputes: Dispute[];
  pagination: { page: number; total: number; totalPages: number };
}

function DisputeStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-800 border-red-200',
    UNDER_REVIEW: 'bg-[#0A1F44]/10 text-[#0A1F44] border-[#0A1F44]/20',
    RESOLVED: 'bg-green-100 text-green-800 border-green-200',
    CLOSED: 'bg-[#D4A017] text-[#0A1F44]/90 border-gray-200',
  };
  return (
    <Badge variant="outline" className={colors[status] || 'bg-[#D4A017] text-[#0A1F44]/90'}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

export function AdminDisputesPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [outcome, setOutcome] = useState('RESOLVED');
  const [resolving, setResolving] = useState(false);

  const buildUrl = () => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
    return `/api/disputes?${params.toString()}`;
  };

  const { data, loading, refetch } = useApi<DisputesResponse>(buildUrl());
  const { mutate } = useApiMutation();

  const disputes = data?.disputes || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 0 };

  const handleResolve = async () => {
    if (!selectedDispute) return;
    setResolving(true);
    try {
      await mutate(`/api/disputes/${selectedDispute.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: outcome,
          resolution,
        }),
      });
      setSelectedDispute(null);
      setResolution('');
      refetch();
    } catch {
      // handled
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Disputes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and resolve platform disputes</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
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
          ) : disputes.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
              <FileWarning className="mb-4 size-12 opacity-50" />
              <p>No disputes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispute</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Raised By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-medium text-sm">
                        #{dispute.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{dispute.booking?.bookingNumber}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{dispute.disputeType}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {dispute.disputeType}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {dispute.raiser?.name}
                      </TableCell>
                      <TableCell>
                        <DisputeStatusBadge status={dispute.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setSelectedDispute(dispute)}
                        >
                          <Eye className="size-4" />
                        </Button>
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
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-4">
              <div className="rounded-lg bg-[#E0B84C] p-3 text-sm">
                <p><span className="font-medium">Booking:</span> {selectedDispute.booking?.bookingNumber}</p>
                <p><span className="font-medium">Service:</span> {selectedDispute.booking?.service?.title}</p>
                <p><span className="font-medium">Raised By:</span> {selectedDispute.raiser?.name}</p>
                <p><span className="font-medium">Type:</span> {selectedDispute.disputeType}</p>
              </div>
              {selectedDispute.description && (
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm">{selectedDispute.description}</p>
                </div>
              )}
              <Separator />
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Select value={outcome} onValueChange={setOutcome}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resolution Notes</Label>
                  <Textarea
                    placeholder="Describe the resolution..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  className="bg-[#0A1F44] text-[#FFD54F] hover:bg-[#132D5E]"
                  onClick={handleResolve}
                  disabled={resolving || !resolution}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  {resolving ? 'Resolving...' : 'Resolve Dispute'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
