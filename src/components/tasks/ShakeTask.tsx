import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ShakeTaskProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
}

export const ShakeTask = ({ difficulty, onComplete }: ShakeTaskProps) => {
  const [shakeCount, setShakeCount] = useState(0);
  const requiredShakes = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;

  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let shakeThreshold = 15;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x = 0, y = 0, z = 0 } = acceleration;
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX + deltaY + deltaZ > shakeThreshold) {
        setShakeCount(prev => {
          const newCount = prev + 1;
          if (newCount >= requiredShakes) {
            onComplete();
          }
          return newCount;
        });
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [difficulty, onComplete, requiredShakes]);

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== 'granted') {
          alert('Motion permission is required for shake task');
        }
      } catch (error) {
        console.error('Error requesting motion permission:', error);
      }
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const progress = (shakeCount / requiredShakes) * 100;

  return (
    <div className="space-y-6 text-center">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Shake your device to stop alarm</p>
        <p className="text-6xl font-bold mb-4">📱</p>
        <p className="text-2xl font-bold">
          {shakeCount} / {requiredShakes}
        </p>
      </div>

      <Progress value={progress} className="h-4" />

      <p className="text-muted-foreground">
        Shake your device vigorously!
      </p>
    </div>
  );
};
