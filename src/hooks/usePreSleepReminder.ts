import { useEffect } from 'react';
import { Alarm } from '@/types/alarm';
import { toast } from '@/hooks/use-toast';

export const usePreSleepReminder = (alarms: Alarm[]) => {
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      alarms.forEach(alarm => {
        if (!alarm.enabled) return;
        
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const alarmTime = hours * 60 + minutes;
        
        // Calculate 60 minutes before alarm
        const reminderTime = alarmTime - 60;
        
        // Check if current time matches reminder time (within 1 minute)
        if (Math.abs(currentTime - reminderTime) <= 1) {
          const lastReminder = localStorage.getItem(`reminder-${alarm.id}`);
          const today = new Date().toDateString();
          
          // Only show once per day
          if (lastReminder !== today) {
            const sleepHours = 8;
            toast({
              title: "💤 Time to Sleep Soon",
              description: `Sleep now to get ${sleepHours} hours of rest before your ${alarm.time} alarm${alarm.label ? ` - ${alarm.label}` : ''}`,
              duration: 10000,
            });
            localStorage.setItem(`reminder-${alarm.id}`, today);
          }
        }
      });
    };
    
    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Check immediately
    
    return () => clearInterval(interval);
  }, [alarms]);
};
