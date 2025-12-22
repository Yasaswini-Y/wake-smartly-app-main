import { useEffect, useState } from 'react';
import { Alarm } from '@/types/alarm';

export const useAlarmChecker = (alarms: Alarm[]) => {
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const [triggeredAlarmsToday, setTriggeredAlarmsToday] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();
      const currentTimestamp = now.getTime();

      const triggeredAlarm = alarms.find(alarm => {
        if (!alarm.enabled) return false;
        
        // Check if alarm is snoozed
        if (alarm.snoozedUntil && currentTimestamp >= alarm.snoozedUntil) {
          return true;
        }
        
        // Skip if already triggered this minute
        const alarmKey = `${alarm.id}-${currentTime}`;
        if (triggeredAlarmsToday.has(alarmKey)) {
          return false;
        }
        
        if (alarm.time !== currentTime) return false;
        
        // If no days selected, alarm rings every day
        if (alarm.days.length === 0) return true;
        
        // Check if current day is in selected days
        return alarm.days.includes(currentDay);
      });

      if (triggeredAlarm && !ringingAlarm) {
        const alarmKey = `${triggeredAlarm.id}-${currentTime}`;
        setTriggeredAlarmsToday(prev => new Set(prev).add(alarmKey));
        setRingingAlarm(triggeredAlarm);
      }
    };

    // Check every second
    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, ringingAlarm, triggeredAlarmsToday]);

  const dismissAlarm = () => {
    setRingingAlarm(null);
  };

  return { ringingAlarm, dismissAlarm };
};
