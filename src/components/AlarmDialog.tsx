import { useState, useEffect, useRef } from 'react';
import { Alarm, ALARM_SOUNDS, DAYS } from '@/types/alarm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateAlarmCountdown } from '@/lib/alarmUtils';
import { AlarmPreview } from './AlarmPreview';
import { toast } from '@/hooks/use-toast';

interface AlarmDialogProps {
  alarm?: Alarm;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (alarm: Omit<Alarm, 'id'> | { id: string } & Partial<Alarm>) => void;
}

export const AlarmDialog = ({ alarm, open, onOpenChange, onSave }: AlarmDialogProps) => {
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [sound, setSound] = useState(ALARM_SOUNDS[0].id);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [soundType, setSoundType] = useState<'default' | 'upload' | 'tts'>('default');
  const [customSoundUrl, setCustomSoundUrl] = useState('');
  const [ttsMessage, setTtsMessage] = useState('');
  const [ttsVoiceId, setTtsVoiceId] = useState('9BWtsMINqrJLrRacOk9x'); // Aria
  const [selectedTasks, setSelectedTasks] = useState<('math' | 'shake' | 'typing')[]>(['math']);
  const [taskDifficulty, setTaskDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [snoozeDuration, setSnoozeDuration] = useState(5);
  const [snoozeLimit, setSnoozeLimit] = useState(3);
  const [countdown, setCountdown] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (alarm) {
      setTime(alarm.time);
      setLabel(alarm.label);
      setSound(alarm.sound);
      setSelectedDays(alarm.days);
      setSelectedTasks(alarm.taskTypes);
      setTaskDifficulty(alarm.taskDifficulty);
      setCustomSoundUrl(alarm.customSoundUrl || '');
      setTtsMessage(alarm.ttsMessage || '');
      setTtsVoiceId(alarm.ttsVoiceId || '9BWtsMINqrJLrRacOk9x');
      setSnoozeDuration(alarm.snoozeDuration);
      setSnoozeLimit(alarm.snoozeLimit);
      
      if (alarm.customSoundUrl) setSoundType('upload');
      else if (alarm.ttsMessage) setSoundType('tts');
      else setSoundType('default');
    } else {
      setTime('07:00');
      setLabel('');
      setSound(ALARM_SOUNDS[0].id);
      setSelectedDays([]);
      setSoundType('default');
      setCustomSoundUrl('');
      setTtsMessage('');
      setTtsVoiceId('9BWtsMINqrJLrRacOk9x');
      setSelectedTasks(['math']);
      setTaskDifficulty('medium');
      setSnoozeDuration(5);
      setSnoozeLimit(3);
    }
  }, [alarm, open]);

  // Update countdown every second
  useEffect(() => {
    if (open && time) {
      const updateCountdown = () => {
        setCountdown(calculateAlarmCountdown(time, selectedDays));
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [open, time, selectedDays]);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const toggleTask = (task: 'math' | 'shake' | 'typing') => {
    setSelectedTasks(prev => {
      if (prev.includes(task)) {
        return prev.length > 1 ? prev.filter(t => t !== task) : prev;
      }
      return prev.length < 3 ? [...prev, task] : prev;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomSoundUrl(url);
    }
  };

  const handleSave = () => {
    const baseAlarm = {
      time,
      label,
      sound: soundType === 'default' ? sound : 'custom',
      days: selectedDays,
      taskTypes: selectedTasks,
      taskDifficulty,
      customSoundUrl: soundType === 'upload' ? customSoundUrl : undefined,
      ttsMessage: soundType === 'tts' ? ttsMessage : undefined,
      ttsVoiceId: soundType === 'tts' ? ttsVoiceId : undefined,
      snoozeDuration,
      snoozeLimit,
      snoozeCount: 0,
    };

    if (alarm) {
      onSave({
        id: alarm.id,
        streak: alarm.streak,
        ...baseAlarm,
      });
      toast({
        title: "Alarm Updated",
        description: `Alarm set for ${time}`,
      });
    } else {
      onSave({
        ...baseAlarm,
        enabled: true,
        streak: 0,
      });
      toast({
        title: "Alarm Saved",
        description: `Alarm set for ${time}`,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="bg-gradient-sunrise bg-clip-text text-transparent">
            {alarm ? 'Edit Alarm' : 'New Alarm'}
          </DialogTitle>
          <DialogDescription>
            Set up your alarm preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-2xl font-bold"
            />
            {countdown && (
              <p className="text-sm text-primary font-medium animate-fade-in">
                ⏰ {countdown}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label (optional)</Label>
            <Input
              id="label"
              placeholder="Wake up"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Repeat</Label>
            <div className="flex gap-2">
              {DAYS.map((day, index) => (
                <Button
                  key={day}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDay(index)}
                  className={cn(
                    "flex-1 transition-all",
                    selectedDays.includes(index) &&
                      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alarm Sound</Label>
            <Tabs value={soundType} onValueChange={(v) => setSoundType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="default">Default</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="tts">Text-to-Speech</TabsTrigger>
              </TabsList>
              
              <TabsContent value="default" className="space-y-2">
                <Select value={sound} onValueChange={setSound}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALARM_SOUNDS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {customSoundUrl ? 'Change Audio File' : 'Upload Audio File'}
                </Button>
                {customSoundUrl && (
                  <p className="text-xs text-muted-foreground">Audio file selected</p>
                )}
              </TabsContent>
              
              <TabsContent value="tts" className="space-y-3">
                <div>
                  <Label htmlFor="tts-message">Wake-up Message</Label>
                  <Textarea
                    id="tts-message"
                    value={ttsMessage}
                    onChange={(e) => setTtsMessage(e.target.value)}
                    placeholder="Good morning! Time to wake up and seize the day!"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="tts-voice">Voice</Label>
                  <Select value={ttsVoiceId} onValueChange={setTtsVoiceId}>
                    <SelectTrigger id="tts-voice">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9BWtsMINqrJLrRacOk9x">Aria (Female)</SelectItem>
                      <SelectItem value="EXAVITQu4vr4xnSDxMaL">Sarah (Female)</SelectItem>
                      <SelectItem value="XB0fDUnXU5powFXDhCwa">Charlotte (Female)</SelectItem>
                      <SelectItem value="CwhRBWXzGAHq8TQ4Fs17">Roger (Male)</SelectItem>
                      <SelectItem value="TX3LPaxmHKxFdv7VOQHJ">Liam (Male)</SelectItem>
                      <SelectItem value="onwK4e9ZLuTAKqWW03F9">Daniel (Male)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label>Wake-up Tasks (Select 1-3)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleTask('math')}
                className={cn(
                  "flex-1 transition-all",
                  selectedTasks.includes('math') &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
              >
                🔢 Math
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleTask('shake')}
                className={cn(
                  "flex-1 transition-all",
                  selectedTasks.includes('shake') &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
              >
                📱 Shake
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleTask('typing')}
                className={cn(
                  "flex-1 transition-all",
                  selectedTasks.includes('typing') &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                )}
              >
                ⌨️ Type
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-difficulty">Task Difficulty</Label>
            <Select value={taskDifficulty} onValueChange={(v) => setTaskDifficulty(v as any)}>
              <SelectTrigger id="task-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium text-sm">Snooze Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="snooze-duration">Snooze Duration</Label>
              <Select value={snoozeDuration.toString()} onValueChange={(v) => setSnoozeDuration(Number(v))}>
                <SelectTrigger id="snooze-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="snooze-limit">Max Snoozes Allowed</Label>
              <Select value={snoozeLimit.toString()} onValueChange={(v) => setSnoozeLimit(Number(v))}>
                <SelectTrigger id="snooze-limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No snooze allowed</SelectItem>
                  <SelectItem value="1">1 snooze</SelectItem>
                  <SelectItem value="2">2 snoozes</SelectItem>
                  <SelectItem value="3">3 snoozes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Preview Alarm
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-sunrise hover:opacity-90"
          >
            Save
          </Button>
        </div>
      </DialogContent>
      
      <AlarmPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        taskTypes={selectedTasks}
        taskDifficulty={taskDifficulty}
      />
    </Dialog>
    

  );
 

};
