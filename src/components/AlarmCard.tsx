import { Alarm, DAYS } from '@/types/alarm';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const AlarmCard = ({ alarm, onToggle, onEdit, onDelete }: AlarmCardProps) => {
  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:shadow-soft",
      alarm.enabled ? "border-primary/30 shadow-glow" : "opacity-60"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold bg-gradient-sunrise bg-clip-text text-transparent">
              {alarm.time}
            </span>
            {alarm.label && (
              <span className="text-sm text-muted-foreground">{alarm.label}</span>
            )}
            {alarm.streak > 0 && (
              <span className="flex items-center gap-1 text-sm font-medium text-primary">
                <Flame className="h-4 w-4" />
                {alarm.streak}
              </span>
            )}
          </div>
          
          {alarm.days.length > 0 && (
            <div className="flex gap-1 mb-2">
              {DAYS.map((day, index) => (
                <span
                  key={day}
                  className={cn(
                    "text-xs px-2 py-1 rounded-md transition-colors",
                    alarm.days.includes(index)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {day}
                </span>
              ))}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {alarm.sound}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4">
          <Switch
            checked={alarm.enabled}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-primary"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
