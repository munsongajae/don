import { Card } from './Card';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorMessage = ({ message, onRetry, onDismiss }: ErrorMessageProps) => {
  return (
    <Card className="bg-red-50 border-red-300">
      <div className="flex items-center justify-between">
        <div className="text-red-600">{message}</div>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="secondary" onClick={onRetry} className="text-xs px-3 py-1">
              재시도
            </Button>
          )}
          {onDismiss && (
            <Button variant="secondary" onClick={onDismiss} className="text-xs px-3 py-1">
              닫기
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

