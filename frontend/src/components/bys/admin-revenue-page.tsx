import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { DollarSign, TrendingUp, BarChart3, CheckCircle2, Clock } from 'lucide-react';

interface RevenueStream {
  id: string;
  name: string;
  type: string;
  model: string;
  status: string;
  estimatedMonthlyRevenue: number;
  description?: string;
  createdAt: string;
}

interface RevenueResponse {
  revenueStreams: RevenueStream[];
  totalEstimatedMonthlyRevenue: number;
}

export function AdminRevenuePage() {
  const { data, loading } = useApi<RevenueResponse>('/api/admin/revenue');

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const streams = data?.revenueStreams || [];
  const totalRevenue = data?.totalEstimatedMonthlyRevenue || 0;
  const activeStreams = streams.filter((s) => s.status === 'ACTIVE');
  const plannedStreams = streams.filter((s) => s.status !== 'ACTIVE');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Revenue Streams</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track platform revenue models and earnings</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-[#4D8AFF]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Monthly Revenue</p>
                <p className="mt-1 text-2xl font-bold text-[#1D63FF]">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="size-5 text-[#1D63FF]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#4D8AFF]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Streams</p>
                <p className="mt-1 text-2xl font-bold">{activeStreams.length}</p>
              </div>
              <CheckCircle2 className="size-5 text-[#1D63FF]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#4D8AFF]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planned Streams</p>
                <p className="mt-1 text-2xl font-bold">{plannedStreams.length}</p>
              </div>
              <Clock className="size-5 text-[#1D63FF]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Table */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-4 text-[#1D63FF]" />
            Revenue Streams
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {streams.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <DollarSign className="mx-auto mb-2 size-8 opacity-50" />
              <p>No revenue streams configured</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Est. Monthly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streams.map((stream) => (
                    <TableRow key={stream.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{stream.name}</p>
                          {stream.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{stream.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{stream.type}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{stream.model}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            stream.status === 'ACTIVE'
                              ? 'border-[#1D63FF]/20 bg-[#1D63FF]/10 text-[#0A2463]'
                              : 'border-yellow-200 bg-yellow-100 text-yellow-800'
                          }
                        >
                          {stream.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ₹{(stream.estimatedMonthlyRevenue || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Summary */}
      <Card className="mt-4">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-5 text-[#1D63FF]" />
            <span className="font-medium">Total Estimated Monthly Revenue</span>
          </div>
          <span className="text-xl font-bold text-[#1D63FF]">₹{totalRevenue.toLocaleString()}</span>
        </CardContent>
      </Card>
    </div>
  );
}
