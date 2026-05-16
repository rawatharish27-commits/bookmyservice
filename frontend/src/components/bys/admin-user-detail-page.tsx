import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, Ban, UserCheck, Trash2, CalendarCheck, Briefcase, Shield } from 'lucide-react';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileImageUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export function AdminUserDetailPage() {
  const { navigate, nav } = useApp();
  const userId = nav.params.userId;
  const { data: user, loading, refetch } = useApi<UserDetail>(userId ? `/api/admin/users/${userId}` : null);
  const { mutate } = useApiMutation();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await mutate(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      refetch();
    } catch {
      // handled
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await mutate(`/api/admin/users/${userId}`, { method: 'DELETE' });
      navigate('admin-users');
    } catch {
      // handled
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-4 h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate('admin-users')}>
          <ArrowLeft className="mr-2 size-4" /> Back
        </Button>
        <p className="mt-8 text-center text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('admin-users')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user?.name || 'Guest'}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge
          variant="outline"
          className={
            user.status === 'ACTIVE'
              ? 'border-green-200 bg-green-100 text-green-800'
              : user.status === 'BLOCKED'
                ? 'border-red-200 bg-red-100 text-red-800'
                : 'border-yellow-200 bg-yellow-100 text-yellow-800'
          }
        >
          {user.status}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Profile Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Role</p>
                <Badge variant="secondary" className="mt-1 capitalize">{user.role?.toLowerCase()}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="mt-1 font-medium">{user.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email Verified</p>
                <Badge variant="outline" className={user.emailVerified ? 'border-green-200 bg-green-100 text-green-800' : 'border-red-200 bg-red-100 text-red-800'}>
                  {user.emailVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Phone Verified</p>
                <Badge variant="outline" className={user.phoneVerified ? 'border-green-200 bg-green-100 text-green-800' : 'border-red-200 bg-red-100 text-red-800'}>
                  {user.phoneVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">City</p>
                <p className="mt-1 font-medium">{user.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">State</p>
                <p className="mt-1 font-medium">{user.state || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Joined</p>
                <p className="mt-1 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Login</p>
                <p className="mt-1 font-medium">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center p-4 text-center">
              <CalendarCheck className="size-5 text-emerald-600" />
              <p className="mt-2 text-lg font-bold">—</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4 text-center">
              <Briefcase className="size-5 text-blue-600" />
              <p className="mt-2 text-lg font-bold">—</p>
              <p className="text-xs text-muted-foreground">Services</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4 text-center">
              <Shield className="size-5 text-purple-600" />
              <p className="mt-2 text-lg font-bold">—</p>
              <p className="text-xs text-muted-foreground">KYC</p>
            </CardContent>
          </Card>
        </div>

        {/* KYC for providers */}
        {user.role === 'PROVIDER' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">KYC Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                KYC document details will be available here
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {user.status === 'ACTIVE' ? (
              <Button variant="outline" className="text-blue-600" onClick={() => handleStatusChange('BLOCKED')}>
                <Ban className="mr-2 size-4" /> Block User
              </Button>
            ) : (
              <Button variant="outline" className="text-green-600" onClick={() => handleStatusChange('ACTIVE')}>
                <UserCheck className="mr-2 size-4" /> Unblock User
              </Button>
            )}
            <Button variant="outline" className="text-destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 size-4" /> Delete User
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
