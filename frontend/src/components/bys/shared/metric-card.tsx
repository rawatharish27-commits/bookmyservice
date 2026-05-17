import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  subtitle?: string;
}

export function MetricCard({ title, value, change, changeType = 'neutral', icon: Icon, subtitle }: MetricCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-500';
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        {(change || subtitle) && (
          <p className={`mt-1 text-xs ${change ? changeColor : 'text-muted-foreground'}`}>
            {change}{subtitle && ` · ${subtitle}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
