import { useState } from 'react';
import TextInputForm from './TextInputForm';
import GenerationStatus from './GenerationStatus';
import FlashcardProposalsList from './FlashcardProposalsList';
import ActionButtons from './ActionButtons';
import ToastNotifications from './ToastNotifications';
import { useFlashcardGeneration } from './hooks/useFlashcardGeneration';

// Types for notifications
interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export default function FlashcardGenerationView() {
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Use the custom hook for flashcard generation logic
  const {
    text,
    setText,
    isTextValid,
    textError,
    isGenerating,
    generationError,
    proposals,
    proposalStatuses,
    stats,
    generationId,
    generationName,
    handleGenerate,
    handleAccept,
    handleEdit,
    handleReject,
    handleSaveAccepted,
    handleSaveAll
  } = useFlashcardGeneration();

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

  // Handle saving accepted flashcards with redirection
  const handleSaveAcceptedWithRedirect = async () => {
    const success = await handleSaveAccepted();
    if (success) {
      addNotification('success', 'Successfully saved accepted flashcards!', 3000);
      // Short delay to allow the notification to be seen
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      addNotification('error', 'Failed to save flashcards. Please try again.', 5000);
    }
  };

  // Handle saving all flashcards with redirection
  const handleSaveAllWithRedirect = async () => {
    const success = await handleSaveAll();
    if (success) {
      addNotification('success', 'Successfully saved all flashcards!', 3000);
      // Short delay to allow the notification to be seen
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      addNotification('error', 'Failed to save flashcards. Please try again.', 5000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <TextInputForm 
        text={text}
        setText={setText}
        isTextValid={isTextValid}
        textError={textError}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
      
      <GenerationStatus 
        isLoading={isGenerating}
        error={generationError}
      />
      
      {proposals.length > 0 && (
        <>
          {generationName && (
            <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {generationName}
            </div>
          )}
          
          <FlashcardProposalsList 
            proposals={proposals}
            proposalStatuses={proposalStatuses}
            onAccept={handleAccept}
            onEdit={handleEdit}
            onReject={handleReject}
          />
          
          <ActionButtons 
            hasAccepted={Object.values(proposalStatuses).some(status => status === 'accepted')}
            hasProposals={proposals.length > 0}
            onSaveAccepted={async () => {
              const success = await handleSaveAccepted();
              if (success) {
                addNotification('success', 'Successfully saved accepted flashcards!', 3000);
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 1000);
              } else {
                addNotification('error', 'Failed to save flashcards. Please try again.', 5000);
              }
              return success;
            }}
            onSaveAll={async () => {
              const success = await handleSaveAll();
              if (success) {
                addNotification('success', 'Successfully saved all flashcards!', 3000);
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 1000);
              } else {
                addNotification('error', 'Failed to save flashcards. Please try again.', 5000);
              }
              return success;
            }}
          />
        </>
      )}
      
      <ToastNotifications 
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
} 