export interface AlarmHistory {
  date: string;
  completionTime: number; // seconds
  attempts: number;
  snoozesUsed: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: number[];
  sound: string;
  customSoundUrl?: string;
  ttsMessage?: string;
  ttsVoiceId?: string;
  taskTypes: ('math' | 'shake' | 'typing')[];
  taskDifficulty: 'easy' | 'medium' | 'hard';
  streak: number;
  lastCompleted?: string;
  snoozedUntil?: number;
  snoozeDuration: number; // in minutes (3, 5, 10, 15)
  snoozeLimit: number; // 0-3 allowed snoozes
  snoozeCount: number; // current snooze count
  history?: AlarmHistory[];
}

export const ALARM_SOUNDS = [
  {
    id: "default",
    name: "Default Alarm",
    file: "/alarm/default.wav",
  },
  {
    id: "birds",
    name: "Birds Chirping",
    file: "/alarm/birds_alarm.wav",
  },
  {
    id: "crickets",
    name: "Crickets",
    file: "/alarm/crickets.wav",
  },
  {
    id: "rain",
    name: "Rain Sound",
    file: "/alarm/rain.wav",
  },
  {
    id: "piano",
    name: "Piano Melody",
    file: "/alarm/piano.mp3",
  },
];



export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
