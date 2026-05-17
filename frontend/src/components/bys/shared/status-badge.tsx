import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  VERIFIED: 'bg-green-100 text-green-800',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  NOT_SUBMITTED: 'bg-gray-100 text-gray-800',
  APPROVED: 'bg-green-100 text-green-800',
  PAYOUT_PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <Badge className={`${colorClass} ${sizeClass} font-medium border-0`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
