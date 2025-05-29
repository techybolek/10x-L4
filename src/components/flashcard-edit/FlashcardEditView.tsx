import { useState } from 'react';
import ToastNotifications from '../flashcard-generation/ToastNotifications';
import { useFlashcardEdit } from './hooks/useFlashcardEdit';
import FlashcardList from './FlashcardList';

// Types for notifications
interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface FlashcardEditViewProps {
  generationId: string;
}

export default function FlashcardEditView({ generationId }: FlashcardEditViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Use the custom hook for flashcard editing logic
  const {
    flashcards,
    isLoading,
    error,
    handleEdit,
    handleDelete,
    isDeletingMap,
  } = useFlashcardEdit(generationId);

  // Function to add a notification
  const addNotification = (type: 'success' | 'error' | 'info', message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, type, message, duration }]);
    
    // Auto-dismiss notification after duration
    setTimeout(() => {
      dismissNotification(id);
    }, duration);
  };

  // Function to dismiss a notification
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Handle flashcard deletion with notifications
  const handleFlashcardDelete = async (id: string) => {
    try {
      await handleDelete(id);
      addNotification('success', 'Flashcard deleted successfully');
    } catch (err) {
      addNotification('error', err instanceof Error ? err.message : 'Failed to delete flashcard');
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        Error loading flashcards: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {flashcards && flashcards.length > 0 && (
        <FlashcardList 
          flashcards={flashcards}
          onEdit={handleEdit}
          onDelete={handleFlashcardDelete}
          isDeletingMap={isDeletingMap}
        />
      )}
      
      <ToastNotifications 
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
} 