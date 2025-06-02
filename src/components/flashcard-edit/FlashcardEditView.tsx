import { useState, useEffect } from 'react';
import ToastNotifications from '../flashcard-generation/ToastNotifications';
import { useFlashcardEdit } from './hooks/useFlashcardEdit';
import FlashcardList from './FlashcardList';
import NewFlashcardForm from './NewFlashcardForm';

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
  console.log('FlashcardEditView rendering with generationId:', generationId);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);

  // Use the custom hook for flashcard editing logic
  const {
    flashcards,
    isLoading,
    error,
    handleEdit,
    handleDelete,
    handleCreate,
    isDeletingMap,
    isCreating,
  } = useFlashcardEdit(generationId);

  useEffect(() => {
    console.log('FlashcardEditView state:', {
      flashcardsCount: flashcards.length,
      isLoading,
      error,
      showNewForm,
      isCreating
    });
  }, [flashcards, isLoading, error, showNewForm, isCreating]);

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

  // Handle flashcard creation with notifications
  const handleFlashcardCreate = async (front: string, back: string) => {
    try {
      await handleCreate(front, back);
      addNotification('success', 'Flashcard created successfully');
      setShowNewForm(false);
    } catch (err) {
      addNotification('error', err instanceof Error ? err.message : 'Failed to create flashcard');
      throw err;
    }
  };

  if (isLoading) {
    console.log('FlashcardEditView showing loading state');
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.log('FlashcardEditView showing error state:', error);
    return (
      <div className="text-red-500 text-center py-8">
        Error loading flashcards: {error}
      </div>
    );
  }

  console.log('FlashcardEditView rendering main UI, showNewForm:', showNewForm);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Flashcards ({flashcards.length})
        </h2>
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Add New Flashcard
          </button>
        )}
      </div>

      {showNewForm && (
        <NewFlashcardForm
          onSubmit={handleFlashcardCreate}
          onCancel={() => setShowNewForm(false)}
          isCreating={isCreating}
        />
      )}

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