'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  UserCircle,
  PhoneCall,
  Mail,
  Video,
  MessageSquare,
  CalendarClock,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Users,
  Target,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CrmActivity {
  id: string;
  userId: string;
  userName: string;
  type: string;
  status: string;
  description?: string;
  createdAt: string;
}

interface CrmFollowUp {
  id: string;
  userId: string;
  userName: string;
  type: string;
  title: string;
  notes?: string;
  priority: string;
  assignedTo?: { id: string; name: string };
  dueDate: string;
  status: string;
  createdAt: string;
}

interface ActivitiesResponse {
  activities: CrmActivity[];
}

interface FollowUpsResponse {
  followUps: CrmFollowUp[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ActivityTypeIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    CALL: <PhoneCall className="size-4 text-emerald-600" />,
    EMAIL: <Mail className="size-4 text-teal-600" />,
    MEETING: <Video className="size-4 text-cyan-600" />,
    CHAT: <MessageSquare className="size-4 text-sky-600" />,
  };
  return (
    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
      {iconMap[type] || <UserCircle className="size-4 text-gray-600" />}
    </div>
  );
}

function ActivityTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    CALL: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    EMAIL: 'bg-teal-100 text-teal-800 border-teal-200',
    MEETING: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    CHAT: 'bg-sky-100 text-sky-800 border-sky-200',
  };
  return (
    <Badge variant="outline" className={colors[type] || 'bg-gray-100 text-gray-800'}>
      {type}
    </Badge>
  );
}

function ActivityStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return (
    <Badge variant="outline" className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-800 border-red-200',
    MEDIUM: 'bg-sky-100 text-sky-800 border-sky-200',
    LOW: 'bg-green-100 text-green-800 border-green-200',
    URGENT: 'bg-red-200 text-red-900 border-red-300',
  };
  const icons: Record<string, React.ReactNode> = {
    HIGH: <AlertCircle className="mr-1 size-3" />,
    MEDIUM: <Clock className="mr-1 size-3" />,
    LOW: <CheckCircle2 className="mr-1 size-3" />,
    URGENT: <AlertCircle className="mr-1 size-3" />,
  };
  return (
    <Badge variant="outline" className={colors[priority] || 'bg-gray-100 text-gray-800'}>
      {icons[priority]}
      {priority}
    </Badge>
  );
}

function FollowUpStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="size-4 text-green-600" />;
    case 'CANCELLED':
      return <XCircle className="size-4 text-red-500" />;
    case 'OVERDUE':
      return <AlertCircle className="size-4 text-red-600" />;
    default:
      return <Clock className="size-4 text-sky-500" />;
  }
}

function FollowUpStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    OVERDUE: 'bg-red-200 text-red-900 border-red-300',
  };
  return (
    <Badge variant="outline" className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date() ? 'OVERDUE' : null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminCrmPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'CALL',
    title: '',
    notes: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const { data: activitiesData, loading: activitiesLoading } =
    useApi<ActivitiesResponse>('/api/crm/activities');
  const { data: followUpsData, loading: followUpsLoading, refetch: refetchFollowUps } =
    useApi<FollowUpsResponse>('/api/crm/follow-ups');
  const { mutate, loading: creating } = useApiMutation();

  const activities = activitiesData?.activities || [];
  const followUps = followUpsData?.followUps || [];

  const handleCreateFollowUp = async () => {
    if (!formData.userId || !formData.title || !formData.dueDate) return;
    try {
      await mutate('/api/crm/follow-ups', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setCreateOpen(false);
      setFormData({
        userId: '',
        type: 'CALL',
        title: '',
        notes: '',
        priority: 'MEDIUM',
        dueDate: '',
      });
      refetchFollowUps();
    } catch {
      // handled by hook
    }
  };

  const pendingFollowUps = followUps.filter(
    (f) => f.status !== 'COMPLETED' && f.status !== 'CANCELLED'
  ).length;
  const overdueFollowUps = followUps.filter(
    (f) => f.status !== 'COMPLETED' && f.status !== 'CANCELLED' && isOverdue(f.dueDate)
  ).length;

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Customer relationship management tools
            </p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 size-4" />
          Create Follow-up
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Activities</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{activities.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Follow-ups</p>
            <p className="mt-1 text-2xl font-bold text-teal-700">{followUps.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="mt-1 text-2xl font-bold text-sky-700">{pendingFollowUps}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className="mt-1 text-2xl font-bold text-red-700">{overdueFollowUps}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs defaultValue="activities" className="space-y-4">
          <TabsList className="bg-muted/70">
            <TabsTrigger value="activities" className="gap-1.5">
              <UserCircle className="size-4" />
              CRM Activities
            </TabsTrigger>
            <TabsTrigger value="followups" className="gap-1.5">
              <Target className="size-4" />
              Follow-ups
            </TabsTrigger>
          </TabsList>

          {/* ── Activities Tab ──────────────────────────────────────────── */}
          <TabsContent value="activities">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCircle className="size-4 text-emerald-600" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {activitiesLoading ? (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-14" />
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="flex h-52 flex-col items-center justify-center text-muted-foreground">
                    <UserCircle className="mb-2 size-10 opacity-40" />
                    <p className="text-sm">No CRM activities recorded</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[480px]">
                    <div className="divide-y">
                      {activities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50/80"
                        >
                          <ActivityTypeIcon type={activity.type} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium">{activity.userName}</span>
                              <ActivityTypeBadge type={activity.type} />
                            </div>
                            {activity.description && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <ActivityStatusBadge status={activity.status} />
                            <span className="hidden text-xs text-muted-foreground sm:block">
                              {formatDate(activity.createdAt)}
                            </span>
                            <ChevronRight className="size-4 text-gray-300" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Follow-ups Tab ──────────────────────────────────────────── */}
          <TabsContent value="followups">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="size-4 text-teal-600" />
                    Follow-ups
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="mr-1 size-3" /> New
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {followUpsLoading ? (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-14" />
                    ))}
                  </div>
                ) : followUps.length === 0 ? (
                  <div className="flex h-52 flex-col items-center justify-center text-muted-foreground">
                    <CalendarClock className="mb-2 size-10 opacity-40" />
                    <p className="text-sm">No follow-ups scheduled</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden sm:table-cell">Assigned To</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead className="hidden md:table-cell">Due Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {followUps.map((fu, index) => {
                          const effectiveStatus =
                            fu.status === 'PENDING' && isOverdue(fu.dueDate)
                              ? 'OVERDUE'
                              : fu.status;
                          return (
                            <motion.tr
                              key={fu.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.04 }}
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <TableCell>
                                <FollowUpStatusIcon status={effectiveStatus} />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm font-medium">{fu.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {fu.userName} · {fu.type}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm">
                                {fu.assignedTo?.name || '—'}
                              </TableCell>
                              <TableCell>
                                <PriorityBadge priority={fu.priority} />
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                <span
                                  className={
                                    effectiveStatus === 'OVERDUE' ? 'font-medium text-red-600' : ''
                                  }
                                >
                                  {formatDate(fu.dueDate)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <FollowUpStatusBadge status={effectiveStatus} />
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ── Create Follow-up Modal ──────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <Plus className="size-4 text-white" />
              </div>
              Create Follow-up
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="fu-userId">User ID *</Label>
              <Input
                id="fu-userId"
                placeholder="Enter user ID"
                value={formData.userId}
                onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">Call</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="CHAT">Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fu-title">Title *</Label>
              <Input
                id="fu-title"
                placeholder="Follow-up title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fu-notes">Notes</Label>
              <Textarea
                id="fu-notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fu-dueDate">Due Date *</Label>
              <Input
                id="fu-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              onClick={handleCreateFollowUp}
              disabled={creating || !formData.userId || !formData.title || !formData.dueDate}
            >
              {creating ? 'Creating...' : 'Create Follow-up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
