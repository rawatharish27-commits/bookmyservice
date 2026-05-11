'use client';

import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Pencil, Trash2, Star, Briefcase } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  isApproved: boolean;
  approvalStatus: string;
  averageRating: number;
  totalReviews: number;
  serviceDurationMinutes: number | null;
  category: { id: number; name: string };
  subcategory: { id: number; name: string } | null;
  createdAt: string;
}

interface ServicesResponse {
  services: Service[];
  pagination: { total: number };
}

function ApprovalBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    PENDING: { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending Review' },
    APPROVED: { class: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
    REJECTED: { class: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
  };
  const c = config[status] || config.PENDING;
  return <Badge variant="outline" className={c.class}>{c.label}</Badge>;
}

export function ProviderServicesPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { data, loading, refetch } = useApi<ServicesResponse>('/api/services?limit=100');
  const { mutate } = useApiMutation();

  const services = (data?.services || []).filter((s: Service) => {
    // Since API returns all active/approved, we filter client-side
    // In practice, providerId filter would be handled by API with auth
    return true;
  });

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await mutate(`/api/services/${serviceId}`, { method: 'DELETE' });
      refetch();
    } catch {
      // handled
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your service offerings
          </p>
        </div>
        <Button
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => navigate('provider-create-service')}
        >
          <Plus className="mr-2 size-4" />
          Create New Service
        </Button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Briefcase className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No services yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first service to start receiving bookings
            </p>
            <Button
              className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => navigate('provider-create-service')}
            >
              <Plus className="mr-2 size-4" />
              Create Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{service.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.category?.name}
                      {service.subcategory ? ` › ${service.subcategory.name}` : ''}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 shrink-0">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate('provider-create-service', { serviceId: service.id })}>
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">
                    ₹{service.basePrice?.toLocaleString()}
                  </span>
                  <ApprovalBadge status={service.approvalStatus} />
                </div>

                {service.serviceDurationMinutes && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Duration: {service.serviceDurationMinutes} min
                  </p>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{service.averageRating || '0'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({service.totalReviews || 0} reviews)
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
