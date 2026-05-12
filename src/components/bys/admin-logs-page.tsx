'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Search, Clock } from 'lucide-react';

interface AdminLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  createdAt: string;
  admin: { id: string; name: string; email: string };
}

interface LogsResponse {
  logs: AdminLog[];
  pagination: { page: number; total: number; totalPages: number };
}

export function AdminLogsPage() {
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchAdmin, setSearchAdmin] = useState('');
  const [page, setPage] = useState(1);

  const buildUrl = () => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (actionFilter && actionFilter !== 'ALL') params.set('action', actionFilter);
    return `/api/admin/logs?${params.toString()}`;
  };

  const { data, loading } = useApi<LogsResponse>(buildUrl());
  const logs = data?.logs || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track all admin actions on the platform</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by admin..."
              value={searchAdmin}
              onChange={(e) => setSearchAdmin(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              <SelectItem value="CREATE_CATEGORY">Create Category</SelectItem>
              <SelectItem value="UPDATE_CATEGORY">Update Category</SelectItem>
              <SelectItem value="CREATE_FAQ">Create FAQ</SelectItem>
              <SelectItem value="UPDATE_FAQ">Update FAQ</SelectItem>
              <SelectItem value="DELETE_FAQ">Delete FAQ</SelectItem>
              <SelectItem value="BLOCK_USER">Block User</SelectItem>
              <SelectItem value="APPROVE_SERVICE">Approve Service</SelectItem>
              <SelectItem value="REJECT_SERVICE">Reject Service</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
              <Clock className="mb-4 size-12 opacity-50" />
              <p>No activity logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">Target</TableHead>
                    <TableHead className="hidden lg:table-cell">Details</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        <div>
                          <p className="font-medium">{log.admin?.name}</p>
                          <p className="text-xs text-muted-foreground">{log.admin?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-mono">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        <div>
                          <p>{log.targetType}</p>
                          <p className="text-xs text-muted-foreground">#{log.targetId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-48 truncate">
                        {log.details || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString()}
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
