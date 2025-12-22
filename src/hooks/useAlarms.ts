import { useState, useEffect } from 'react';
import { Alarm } from '@/types/alarm';

const STORAGE_KEY = 'smart-alarms';

export const useAlarms = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAlarms(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading alarms:', error);
      }
    }
  }, []);

  const saveAlarms = (newAlarms: Alarm[]) => {
    setAlarms(newAlarms);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlarms));
  };

  const addAlarm = (alarm: Omit<Alarm, 'id'>) => {
    const newAlarm: Alarm = {
      ...alarm,
      id: crypto.randomUUID(),
      taskTypes: alarm.taskTypes || ['math'],
      taskDifficulty: alarm.taskDifficulty || 'medium',
      snoozeDuration: alarm.snoozeDuration || 5,
      snoozeLimit: alarm.snoozeLimit || 3,
      snoozeCount: 0,
      streak: 0,
    };
    saveAlarms([...alarms, newAlarm]);
  };

  const updateAlarm = (id: string, updates: Partial<Alarm>) => {
    saveAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, ...updates } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    saveAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const toggleAlarm = (id: string) => {
    updateAlarm(id, { 
      enabled: !alarms.find(a => a.id === id)?.enabled 
    });
  };

  const completeAlarm = (id: string, completionStats?: { completionTime: number; attempts: number }) => {
    const alarm = alarms.find(a => a.id === id);
    if (!alarm) return;

    const today = new Date().toDateString();
    const lastCompleted = alarm.lastCompleted;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = alarm.streak || 0;
    
    // Increment streak if completed today or if last completed was yesterday
    if (!lastCompleted || lastCompleted === yesterday) {
      newStreak = (alarm.streak || 0) + 1;
    } else if (lastCompleted !== today) {
      // Reset streak if missed a day
      newStreak = 1;
    }

    // Auto-adjust difficulty based on performance
    let newDifficulty = alarm.taskDifficulty;
    if (completionStats) {
      const { completionTime, attempts } = completionStats;
      
      // If solved quickly (< 20s) with few attempts (≤ 2), increase difficulty
      if (completionTime < 20 && attempts <= 2) {
        if (alarm.taskDifficulty === 'easy') newDifficulty = 'medium';
        else if (alarm.taskDifficulty === 'medium') newDifficulty = 'hard';
      }
      // If took long (> 90s) or many attempts (> 5), decrease difficulty
      else if (completionTime > 90 || attempts > 5) {
        if (alarm.taskDifficulty === 'hard') newDifficulty = 'medium';
        else if (alarm.taskDifficulty === 'medium') newDifficulty = 'easy';
      }
    }

    // Add to history
    const history = alarm.history || [];
    if (completionStats) {
      history.push({
        date: new Date().toISOString(),
        completionTime: completionStats.completionTime,
        attempts: completionStats.attempts,
        snoozesUsed: alarm.snoozeCount || 0,
        difficulty: alarm.taskDifficulty,
      });
    }

    updateAlarm(id, {
      streak: newStreak,
      lastCompleted: today,
      snoozedUntil: undefined,
      snoozeCount: 0,
      history: history.slice(-30), // Keep last 30 entries
      taskDifficulty: newDifficulty,
    });
  };

  const snoozeAlarm = (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (!alarm) return;
    
    const snoozeTime = Date.now() + alarm.snoozeDuration * 60 * 1000;
    updateAlarm(id, {
      snoozedUntil: snoozeTime,
      snoozeCount: (alarm.snoozeCount || 0) + 1,
    });
  };

  return {
    alarms,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    completeAlarm,
    snoozeAlarm,
  };
};
