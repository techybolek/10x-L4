import { useState } from 'react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  display_order: number;
}

interface FlashcardListProps {
  flashcards: Flashcard[];
  onEdit: (id: string, front: string, back: string) => void;
  onDelete: (id: string) => Promise<void>;
  isDeletingMap: Record<string, boolean>;
}

export default function FlashcardList({ flashcards, onEdit, onDelete, isDeletingMap }: FlashcardListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedFront, setEditedFront] = useState('');
  const [editedBack, setEditedBack] = useState('');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const startEditing = (flashcard: Flashcard) => {
    setEditingId(flashcard.id);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  };

  const saveEditing = () => {
    if (editingId) {
      onEdit(editingId, editedFront, editedBack);
      setEditingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedFront('');
    setEditedBack('');
  };

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => {
      const newFlipped = new Set(prev);
      if (newFlipped.has(id)) {
        newFlipped.delete(id);
      } else {
        newFlipped.add(id);
      }
      return newFlipped;
    });
  };

  const handleDeleteClick = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      await onDelete(id);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcards.map((flashcard) => (
        <div key={flashcard.id} className="bg-white rounded-lg shadow-sm border p-4">
          {editingId === flashcard.id ? (
            <div className="space-y-4">
              <div>
                <label htmlFor={`front-${flashcard.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Front
                </label>
                <textarea
                  id={`front-${flashcard.id}`}
                  value={editedFront}
                  onChange={(e) => setEditedFront(e.target.value)}
                  className="w-full min-h-[100px] p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter front side text"
                />
              </div>
              <div>
                <label htmlFor={`back-${flashcard.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Back
                </label>
                <textarea
                  id={`back-${flashcard.id}`}
                  value={editedBack}
                  onChange={(e) => setEditedBack(e.target.value)}
                  className="w-full min-h-[100px] p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter back side text"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditing}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                onClick={() => toggleFlip(flashcard.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFlip(flashcard.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Flashcard ${flippedCards.has(flashcard.id) ? 'back' : 'front'} side`}
                className="cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-medium text-gray-700">
                    {flippedCards.has(flashcard.id) ? 'Back' : 'Front'}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 group-hover:text-gray-600 transition-colors"
                    aria-label="Flip card"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 1l4 4-4 4"></path>
                      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                      <path d="M7 23l-4-4 4-4"></path>
                      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    </svg>
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap group-hover:bg-gray-100 transition-colors">
                  {flippedCards.has(flashcard.id) ? flashcard.back : flashcard.front}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {showDeleteConfirm === flashcard.id ? (
                  <>
                    <button
                      onClick={cancelDelete}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      disabled={isDeletingMap[flashcard.id]}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmDelete(flashcard.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                      disabled={isDeletingMap[flashcard.id]}
                    >
                      {isDeletingMap[flashcard.id] ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </span>
                      ) : (
                        'Confirm Delete'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(flashcard)}
                      className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(flashcard.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 