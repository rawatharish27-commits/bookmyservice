import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Pencil, Trash2, Star, Briefcase, Clock } from 'lucide-react';

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
  const config: Record<string, { class: string; label: string; dotColor: string }> = {
    PENDING: { class: 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/30', label: 'Pending Review', dotColor: 'bg-[#FFD54F]' },
    APPROVED: { class: 'bg-[#FFD54F]/10 text-[#132D5E] border-[#FFD54F]/30', label: 'Approved', dotColor: 'bg-[#FFD54F]' },
    REJECTED: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected', dotColor: 'bg-red-400' },
  };
  const c = config[status] || config.PENDING;
  return (
    <Badge variant="outline" className={`${c.class} gap-1.5 text-xs font-semibold`}>
      <span className={`size-1.5 rounded-full ${c.dotColor}`} />
      {c.label}
    </Badge>
  );
}

export function ProviderServicesPage() {
  const { user } = useAuth();
  const { navigate } = useApp();
  const { data, loading, refetch } = useApi<ServicesResponse>('/api/provider/services?limit=100');
  const { mutate } = useApiMutation();

  const services = (data?.services || []).filter((s: Service) => true);

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
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted/50" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">My Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your service offerings</p>
        </div>
        <Button
          className="shimmer bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25 rounded-xl"
          onClick={() => navigate('provider-create-service')}
        >
          <Plus className="mr-2 size-4" />
          Create New Service
        </Button>
      </motion.div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD54F]/10 to-[#FFD54F]/5">
                <Briefcase className="size-10 text-[#FFD54F]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No services yet</h3>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Create your first service to start receiving bookings
              </p>
              <Button
                className="mt-4 bg-gradient-to-r from-[#E0B84C] to-[#FFD54F] text-[#0A1F44] shadow-lg shadow-[#FFD54F]/25"
                onClick={() => navigate('provider-create-service')}
              >
                <Plus className="mr-2 size-4" />
                Create Service
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className={`h-1 ${service.approvalStatus === 'APPROVED' ? 'bg-gradient-to-r from-[#FFD54F] to-[#E0B84C]' : service.approvalStatus === 'REJECTED' ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-[#FFD54F] to-[#E0B84C]'}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{service.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {service.category?.name}
                        {service.subcategory ? ` › ${service.subcategory?.name || ''}` : ''}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 shrink-0 rounded-lg">
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
                    <span className="text-gradient text-lg font-bold">
                      ₹{service.basePrice?.toLocaleString()}
                    </span>
                    <ApprovalBadge status={service.approvalStatus} />
                  </div>

                  {service.serviceDurationMinutes && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      Duration: {service.serviceDurationMinutes} min
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-[#FFD54F] text-[#FFD54F] drop-shadow-[0_0_2px_rgba(6,182,212,0.4)]" />
                      <span className="text-sm font-medium">{service.averageRating || '0'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({service.totalReviews || 0} reviews)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
