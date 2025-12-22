import { useEffect, useRef, useState } from "react";
import { Alarm } from "@/types/alarm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MathTask } from "./tasks/MathTask";
import { ShakeTask } from "./tasks/ShakeTask";
import { TypingTask } from "./tasks/TypingTask";
import { Volume2, CloudRain, Cloud } from "lucide-react";
import { getRandomQuote } from "@/lib/motivationalQuotes";
import { useWeather } from "@/hooks/useWeather";

interface AlarmRingingProps {
  alarm: Alarm;
  onDismiss: (stats?: { completionTime: number; attempts: number }) => void;
  onSnooze: () => void;
}

export const AlarmRinging = ({ alarm, onDismiss, onSnooze }: AlarmRingingProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState("");

  const { weather, loading: weatherLoading } = useWeather();
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const playAlarm = async () => {
      try {
        let audio: HTMLAudioElement | null = null;

        // 🟡 1 — Custom uploaded sound
        if (alarm.customSoundUrl) {
          audio = new Audio(alarm.customSoundUrl);
        }
        // 🟡 2 — Text-to-Speech sound (not implemented yet)
        else if (alarm.ttsMessage) {
          console.log("TTS playback not implemented yet");
        }
        // 🟡 3 — Built-in sounds (.wav + .mp3)
        else {
          const soundMap: Record<string, string> = {
            default: "/alarm/default.wav",
            birds: "/alarm/birds_alarm.wav",
            rain: "/alarm/rain.wav",
            crickets: "/alarm/crickets.wav",
            piano: "/alarm/piano.mp3", // NEW — MP3 support
          };

          const selectedFile = soundMap[alarm.sound] ?? soundMap["default"];
          audio = new Audio(selectedFile);
        }

        if (!audio) return;

        audio.loop = true;
        audio.volume = 0.1;

        audioRef.current = audio;

        await audio.play().catch((err) => {
          console.error("Audio playback failed:", err);
        });

        // 🔼 Smooth volume increase
        let volume = 0.1;
        const ramp = setInterval(() => {
          if (!audioRef.current) return clearInterval(ramp);

          if (volume < 0.7) {
            volume += 0.02;
            audioRef.current.volume = Math.min(volume, 0.7);
          } else {
            clearInterval(ramp);
          }
        }, 500);
      } catch (error) {
        console.error("Alarm sound error:", error);
      }
    };

    playAlarm();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [alarm]);

  // =============================
  // TASK COMPLETION LOGIC
  // =============================

  const handleTaskComplete = () => {
    const updated = new Set(completedTasks);
    updated.add(currentTaskIndex);
    setCompletedTasks(updated);

    // all tasks done → success screen
    if (updated.size === alarm.taskTypes.length) {
      if (audioRef.current) audioRef.current.pause();
      setMotivationalQuote(getRandomQuote());
      setShowSuccess(true);
      return;
    }

    // move to next task
    const nextIndex = alarm.taskTypes.findIndex((_, idx) => !updated.has(idx));
    setCurrentTaskIndex(nextIndex);
  };

  const handleAttempt = () => {
    setAttempts((prev) => prev + 1);
  };

  const handleSnooze = () => {
    if (audioRef.current) audioRef.current.pause();
    onSnooze();
  };

  const canSnooze = (alarm.snoozeCount || 0) < alarm.snoozeLimit;

  const renderTask = () => {
    const t = alarm.taskTypes[currentTaskIndex];
    switch (t) {
      case "math":
        return (
          <MathTask difficulty={alarm.taskDifficulty} onComplete={handleTaskComplete} onAttempt={handleAttempt} />
        );
      case "shake":
        return <ShakeTask difficulty={alarm.taskDifficulty} onComplete={handleTaskComplete} />;
      case "typing":
        return (
          <TypingTask difficulty={alarm.taskDifficulty} onComplete={handleTaskComplete} onAttempt={handleAttempt} />
        );
      default:
        return (
          <MathTask difficulty={alarm.taskDifficulty} onComplete={handleTaskComplete} onAttempt={handleAttempt} />
        );
    }
  };

  const finishTime = Math.floor((Date.now() - startTime) / 1000);

  const successMessage = () => {
    if (finishTime < 30) return "Lightning fast! You're a morning champion! ⚡";
    if (finishTime < 60) return "Great speed! You're ready to conquer the day! 🚀";
    if (attempts <= 2) return "Excellent focus! Your dedication shows! 🎯";
    return "You made it! Every step counts. Keep going! 💪";
  };

  // =============================
  // SUCCESS SCREEN
  // =============================

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-sunrise opacity-30" />

        <Card className="relative w-full max-w-md p-8 text-center shadow-glow border-primary/50">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-sunrise bg-clip-text text-transparent">
            Well Done!
          </h2>

          <p className="text-xl italic mb-6">"{motivationalQuote}"</p>

          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Time taken:</span>
              <span className="font-semibold">{finishTime}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Attempts:</span>
              <span className="font-semibold">{attempts + 1}</span>
            </div>

            <p className="mt-3 font-medium">{successMessage()}</p>
          </div>

          {weather && !weatherLoading && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {weather.condition.includes("Rain") ? (
                  <CloudRain className="h-5 w-5 text-primary" />
                ) : (
                  <Cloud className="h-5 w-5 text-primary" />
                )}
                <span className="font-semibold">
                  {weather.temperature}°C - {weather.condition}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{weather.recommendation}</p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onDismiss({ completionTime: finishTime, attempts: attempts + 1 });
            }}
          >
            Dismiss Alarm
          </Button>

          {canSnooze ? (
            <Button onClick={handleSnooze} variant="outline" className="w-full mt-3">
              Snooze {alarm.snoozeDuration} min ({alarm.snoozeLimit - (alarm.snoozeCount || 0)} left)
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">No more snoozes available</p>
          )}
        </Card>
      </div>
    );
  }

  // =============================
  // MAIN RINGING SCREEN
  // =============================

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-sunrise opacity-20 animate-pulse" />

      <Card className="relative w-full max-w-md p-8 shadow-glow border-primary/50">
        <div className="mb-8 text-center">
          <Volume2 className="h-16 w-16 text-primary animate-pulse mx-auto mb-4" />

          <h1 className="text-5xl font-bold bg-gradient-sunrise bg-clip-text text-transparent">
            {alarm.time}
          </h1>

          {alarm.label && <p className="text-xl text-muted-foreground">{alarm.label}</p>}
        </div>

        <div className="space-y-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="font-medium">
              Complete {alarm.taskTypes.length} task{alarm.taskTypes.length > 1 ? "s" : ""} to dismiss
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Task {completedTasks.size + 1} of {alarm.taskTypes.length}
            </p>
          </div>

          {renderTask()}
        </div>
      </Card>
    </div>
  );
};
