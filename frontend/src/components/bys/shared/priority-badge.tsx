import { Badge } from '@/components/ui/badge';

interface PriorityBadgeProps {
  priority: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-[#FFD54F]/10 text-[#132D5E]',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
  URGENT: 'bg-red-100 text-red-800',
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colorClass = PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800';
  return (
    <Badge className={`${colorClass} text-xs px-2 py-0.5 font-medium border-0`}>
      {priority}
    </Badge>
  );
}
