export const calculateAlarmCountdown = (alarmTime: string, alarmDays: number[]): string => {
  const now = new Date();
  const [hours, minutes] = alarmTime.split(':').map(Number);
  
  const nextAlarm = new Date();
  nextAlarm.setHours(hours, minutes, 0, 0);
  
  // If alarm time has passed today, move to tomorrow or next selected day
  if (nextAlarm <= now) {
    nextAlarm.setDate(nextAlarm.getDate() + 1);
  }
  
  // If specific days are selected, find the next matching day
  if (alarmDays.length > 0) {
    let daysToAdd = 0;
    const maxDaysToCheck = 7;
    
    while (daysToAdd < maxDaysToCheck) {
      const checkDate = new Date(nextAlarm);
      checkDate.setDate(checkDate.getDate() + daysToAdd);
      
      if (alarmDays.includes(checkDate.getDay())) {
        nextAlarm.setDate(nextAlarm.getDate() + daysToAdd);
        break;
      }
      daysToAdd++;
    }
  }
  
  const diff = nextAlarm.getTime() - now.getTime();
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const totalMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (totalHours === 0) {
    return `Alarm in ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
  }
  
  return `Alarm in ${totalHours} hour${totalHours !== 1 ? 's' : ''} ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
};
