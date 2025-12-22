import { useState, useEffect } from 'react';

export const CurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  const date = time.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="text-center mb-12">
      <div className="text-8xl font-bold bg-gradient-sunrise bg-clip-text text-transparent mb-2 animate-in fade-in duration-700">
        {hours}:{minutes}
        <span className="text-5xl opacity-60">:{seconds}</span>
      </div>
      <div className="text-lg text-muted-foreground font-medium">
        {date}
      </div>
    </div>
  );
};
