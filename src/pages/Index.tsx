import { useState } from 'react';
import { CurrentTime } from '@/components/CurrentTime';
import { AlarmCard } from '@/components/AlarmCard';
import { AlarmDialog } from '@/components/AlarmDialog';
import { AlarmRinging } from '@/components/AlarmRinging';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAlarms } from '@/hooks/useAlarms';
import { useAlarmChecker } from '@/hooks/useAlarmChecker';
import { usePreSleepReminder } from '@/hooks/usePreSleepReminder';
import { Alarm } from '@/types/alarm';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, completeAlarm, snoozeAlarm } = useAlarms();
  const { ringingAlarm, dismissAlarm } = useAlarmChecker(alarms);
  usePreSleepReminder(alarms);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | undefined>();
  const [completionStats, setCompletionStats] = useState<{ completionTime: number; attempts: number } | null>(null);

  const handleEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAlarm(undefined);
    setDialogOpen(true);
  };

  const handleSave = (alarmData: any) => {
    if ('id' in alarmData) {
      updateAlarm(alarmData.id, alarmData);
    } else {
      addAlarm(alarmData);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingAlarm(undefined);
    }
  };

  const handleDismiss = (stats?: { completionTime: number; attempts: number }) => {
    if (ringingAlarm) {
      completeAlarm(ringingAlarm.id, stats);
      dismissAlarm();
    }
  };

  const handleSnooze = () => {
    if (ringingAlarm) {
      snoozeAlarm(ringingAlarm.id);
      dismissAlarm();
      toast({
        title: "Snooze Activated",
        description: `Alarm will ring again in ${ringingAlarm.snoozeDuration} minutes`,
      });
    }
  };

  return (
    <>
      {ringingAlarm && (
        <AlarmRinging alarm={ringingAlarm} onDismiss={handleDismiss} onSnooze={handleSnooze} />
      )}
      
      <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <CurrentTime />

        <div className="space-y-4 mb-24">
          {alarms.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-2xl font-semibold mb-2 text-foreground">No alarms set</h2>
              <p className="text-muted-foreground mb-6">
                Create your first alarm to get started
              </p>
              <Button
                onClick={handleAdd}
                size="lg"
                className="bg-gradient-sunrise hover:opacity-90 shadow-glow"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Alarm
              </Button>
            </div>
          ) : (
            <>
              {alarms.map((alarm) => (
                <AlarmCard
                  key={alarm.id}
                  alarm={alarm}
                  onToggle={() => toggleAlarm(alarm.id)}
                  onEdit={() => handleEdit(alarm)}
                  onDelete={() => deleteAlarm(alarm.id)}
                />
              ))}
            </>
          )}
        </div>

        {alarms.length > 0 && (
          <div className="fixed bottom-8 right-8">
            <Button
              onClick={handleAdd}
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-sunrise hover:opacity-90 shadow-glow"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}

        <AlarmDialog
          alarm={editingAlarm}
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          onSave={handleSave}
        />
      </div>
    </div>
    </>
  );
};

export default Index;
