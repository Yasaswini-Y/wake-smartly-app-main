import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MathTask } from './tasks/MathTask';
import { ShakeTask } from './tasks/ShakeTask';
import { TypingTask } from './tasks/TypingTask';
import { Volume2, X } from 'lucide-react';

interface AlarmPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTypes: ('math' | 'shake' | 'typing')[];
  taskDifficulty: 'easy' | 'medium' | 'hard';
}

export const AlarmPreview = ({ open, onOpenChange, taskTypes, taskDifficulty }: AlarmPreviewProps) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  const handleTaskComplete = () => {
    const newCompleted = new Set(completedTasks);
    newCompleted.add(currentTaskIndex);
    setCompletedTasks(newCompleted);

    if (newCompleted.size < taskTypes.length) {
      const nextIndex = taskTypes.findIndex((_, idx) => !newCompleted.has(idx));
      setCurrentTaskIndex(nextIndex);
    }
  };

  const handleClose = () => {
    setCompletedTasks(new Set());
    setCurrentTaskIndex(0);
    onOpenChange(false);
  };

  const renderTask = () => {
    const taskType = taskTypes[currentTaskIndex];
    switch (taskType) {
      case 'math':
        return <MathTask difficulty={taskDifficulty} onComplete={handleTaskComplete} />;
      case 'shake':
        return <ShakeTask difficulty={taskDifficulty} onComplete={handleTaskComplete} />;
      case 'typing':
        return <TypingTask difficulty={taskDifficulty} onComplete={handleTaskComplete} />;
      default:
        return <MathTask difficulty={taskDifficulty} onComplete={handleTaskComplete} />;
    }
  };

  const allCompleted = completedTasks.size === taskTypes.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="bg-gradient-sunrise bg-clip-text text-transparent">Alarm Preview</span>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {allCompleted ? (
          <Card className="p-6 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Preview Complete!</h3>
            <p className="text-muted-foreground mb-4">
              You've completed all {taskTypes.length} task{taskTypes.length > 1 ? 's' : ''}
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <Volume2 className="h-12 w-12 text-primary animate-pulse" />
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Preview Mode: {taskTypes.length} task{taskTypes.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Task {completedTasks.size + 1} of {taskTypes.length}
              </p>
            </div>

            {renderTask()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
