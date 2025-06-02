import { useState } from 'react';

interface NewFlashcardFormProps {
  onSubmit: (front: string, back: string) => Promise<void>;
  onCancel: () => void;
  isCreating: boolean;
}

export default function NewFlashcardForm({ onSubmit, onCancel, isCreating }: NewFlashcardFormProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    try {
      await onSubmit(front.trim(), back.trim());
      // Reset form
      setFront('');
      setBack('');
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div>
        <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-1">
          Front
        </label>
        <textarea
          id="front"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="w-full min-h-[100px] p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter the question or front side text"
          required
          disabled={isCreating}
        />
      </div>
      <div>
        <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-1">
          Back
        </label>
        <textarea
          id="back"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="w-full min-h-[100px] p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter the answer or back side text"
          required
          disabled={isCreating}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          disabled={isCreating}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          disabled={isCreating || !front.trim() || !back.trim()}
        >
          {isCreating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            'Create Flashcard'
          )}
        </button>
      </div>
    </form>
  );
} 