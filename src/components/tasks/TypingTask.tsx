import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TypingTaskProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
  onAttempt?: () => void;
}

const PHRASES = {
  easy: [
    'I am awake',
    'Time to wake up',
    'Good morning',
    'Rise and shine',
    'Start the day',
  ],
  medium: [
    'I will not hit snooze',
    'Today is a great day',
    'I am ready to start',
    'Wake up and be awesome',
    'Seize the day ahead',
  ],
  hard: [
    'I promise to get out of bed immediately',
    'Today I will accomplish my goals',
    'I am grateful for this new day',
    'Success comes from consistent action',
    'I choose to be productive today',
  ],
};

export const TypingTask = ({ difficulty, onComplete, onAttempt }: TypingTaskProps) => {
  const [phrase, setPhrase] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const phrases = PHRASES[difficulty];
    setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, [difficulty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.toLowerCase().trim() === phrase.toLowerCase().trim()) {
      onComplete();
    } else {
      onAttempt?.();
      setError(true);
      setUserInput('');
      setTimeout(() => setError(false), 1000);
    }
  };

  const isCorrectSoFar = phrase.toLowerCase().startsWith(userInput.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Type this phrase to stop alarm</p>
        <p className="text-2xl font-bold mb-6 p-4 bg-muted rounded-lg">
          "{phrase}"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type the phrase exactly..."
          className={`text-xl h-14 ${
            error ? 'border-destructive bg-destructive/10 animate-shake' : 
            userInput && !isCorrectSoFar ? 'border-destructive' : ''
          }`}
          autoFocus
        />
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-sunrise hover:opacity-90"
          disabled={!userInput || !isCorrectSoFar}
        >
          Submit
        </Button>
      </form>

      {error && (
        <p className="text-destructive text-center animate-pulse">
          Incorrect! Try again carefully...
        </p>
      )}

      {userInput && !isCorrectSoFar && !error && (
        <p className="text-destructive text-center text-sm">
          Not matching the phrase...
        </p>
      )}
    </div>
  );
};
