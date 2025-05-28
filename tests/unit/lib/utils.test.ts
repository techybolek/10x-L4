import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500', 'p-4');
    expect(result).toBe('text-red-500 bg-blue-500 p-4');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isPrimary = false;

    const result = cn(
      'base-class',
      isActive && 'active-class',
      isPrimary && 'primary-class'
    );

    expect(result).toBe('base-class active-class');
  });

  it('should handle Tailwind conflicts correctly', () => {
    const result = cn('px-4 py-2', 'p-6');
    // twMerge should override px-4 py-2 with p-6
    expect(result).toBe('p-6');
  });

  it('should handle array inputs', () => {
    const result = cn(['text-sm', 'font-bold'], 'text-center');
    expect(result).toBe('text-sm font-bold text-center');
  });

  it('should handle falsy values', () => {
    const result = cn('text-lg', null, undefined, 0, '');
    expect(result).toBe('text-lg');
  });
}); 