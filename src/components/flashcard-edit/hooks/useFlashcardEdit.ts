import { useState, useEffect } from 'react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export function useFlashcardEdit(generationId: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingMap, setIsDeletingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadFlashcards();
  }, [generationId]);

  const loadFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/generations/${generationId}/flashcards`);
      if (!response.ok) {
        throw new Error('Failed to load flashcards');
      }

      const data = await response.json();
      setFlashcards(data.flashcards || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: string, front: string, back: string) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ front, back }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update flashcard');
      }

      setFlashcards(cards =>
        cards.map(card =>
          card.id === id ? { ...card, front, back } : card
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flashcard');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeletingMap(prev => ({ ...prev, [id]: true }));

      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete flashcard');
      }

      setFlashcards(cards => cards.filter(card => card.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete flashcard');
      throw err;
    } finally {
      setIsDeletingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleSave = async () => {
    try {
      // We don't need to do anything here since changes are saved immediately
      // This is just a placeholder in case we want to add batch operations later
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      throw err;
    }
  };

  return {
    flashcards,
    isLoading,
    error,
    handleEdit,
    handleDelete,
    handleSave,
    isDeletingMap,
  };
} 