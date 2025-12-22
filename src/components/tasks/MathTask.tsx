import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MathTaskProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
  onAttempt?: () => void;
}

export const MathTask = ({ difficulty, onComplete, onAttempt }: MathTaskProps) => {
  const [problem, setProblem] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    generateProblem();
  }, [difficulty]);

  const generateProblem = () => {
    let num1, num2, operator, question, answer;

    switch (difficulty) {
      case 'easy':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
        answer = operator === '+' ? num1 + num2 : num1 - num2;
        question = `${num1} ${operator} ${num2}`;
        break;

      case 'medium':
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 20) + 1;
        operator = ['+', '-', '×'][Math.floor(Math.random() * 3)];
        if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
        answer = operator === '+' ? num1 + num2 : operator === '-' ? num1 - num2 : num1 * num2;
        question = `${num1} ${operator} ${num2}`;
        break;

      case 'hard':
        num1 = Math.floor(Math.random() * 100) + 20;
        num2 = Math.floor(Math.random() * 30) + 5;
        const num3 = Math.floor(Math.random() * 20) + 1;
        const op1 = ['+', '-', '×'][Math.floor(Math.random() * 3)];
        const op2 = ['+', '-'][Math.floor(Math.random() * 2)];
        
        const first = op1 === '+' ? num1 + num2 : op1 === '-' ? num1 - num2 : num1 * num2;
        answer = op2 === '+' ? first + num3 : first - num3;
        question = `(${num1} ${op1} ${num2}) ${op2} ${num3}`;
        break;
    }

    setProblem({ question, answer });
    setUserAnswer('');
    setError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer) === problem.answer) {
      onComplete();
    } else {
      onAttempt?.();
      setError(true);
      setTimeout(() => {
        setError(false);
        generateProblem();
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Solve to stop alarm</p>
        <p className="text-4xl font-bold mb-6">{problem.question} = ?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer"
          className={`text-2xl text-center h-16 ${error ? 'border-destructive bg-destructive/10 animate-shake' : ''}`}
          autoFocus
        />
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-sunrise hover:opacity-90"
          disabled={!userAnswer}
        >
          Submit Answer
        </Button>
      </form>

      {error && (
        <p className="text-destructive text-center animate-pulse">
          Wrong answer! Try the new problem...
        </p>
      )}
    </div>
  );
};
