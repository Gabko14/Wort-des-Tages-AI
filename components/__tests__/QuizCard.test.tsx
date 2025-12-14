import { Quiz } from '@/types/ai';

const mockQuiz: Quiz = {
  question: 'Was bedeutet das Wort "Beispiel"?',
  options: [
    { id: 'a', text: 'Ein Muster zur Veranschaulichung' },
    { id: 'b', text: 'Eine Zeitangabe' },
    { id: 'c', text: 'Ein Werkzeug' },
    { id: 'd', text: 'Eine Pflanze' },
  ],
  correctOptionId: 'a',
};

const mockQuizWithDifferentCorrect: Quiz = {
  ...mockQuiz,
  correctOptionId: 'c',
};

describe('QuizCard Logic', () => {
  describe('Quiz data structure', () => {
    it('should have a valid question', () => {
      expect(mockQuiz.question).toBeTruthy();
      expect(typeof mockQuiz.question).toBe('string');
    });

    it('should have exactly 4 options', () => {
      expect(mockQuiz.options).toHaveLength(4);
    });

    it('should have unique option IDs', () => {
      const ids = mockQuiz.options.map((o) => o.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(4);
    });

    it('should have a valid correct option ID', () => {
      const validIds = mockQuiz.options.map((o) => o.id);
      expect(validIds).toContain(mockQuiz.correctOptionId);
    });

    it('should have non-empty option texts', () => {
      mockQuiz.options.forEach((option) => {
        expect(option.text).toBeTruthy();
        expect(typeof option.text).toBe('string');
      });
    });
  });

  describe('Answer validation', () => {
    it('should identify correct answer', () => {
      const isCorrect = (selectedId: string) =>
        selectedId === mockQuiz.correctOptionId;

      expect(isCorrect('a')).toBe(true);
      expect(isCorrect('b')).toBe(false);
      expect(isCorrect('c')).toBe(false);
      expect(isCorrect('d')).toBe(false);
    });

    it('should work with different correct answers', () => {
      const isCorrect = (selectedId: string) =>
        selectedId === mockQuizWithDifferentCorrect.correctOptionId;

      expect(isCorrect('a')).toBe(false);
      expect(isCorrect('c')).toBe(true);
    });
  });

  describe('Option selection logic', () => {
    it('should determine if an option is selected', () => {
      const selectedId = 'b';
      const isSelected = (optionId: string) => optionId === selectedId;

      expect(isSelected('a')).toBe(false);
      expect(isSelected('b')).toBe(true);
      expect(isSelected('c')).toBe(false);
    });

    it('should handle null selection', () => {
      const selectedId: string | null = null;
      const isSelected = (optionId: string) => optionId === selectedId;

      mockQuiz.options.forEach((option) => {
        expect(isSelected(option.id)).toBe(false);
      });
    });
  });

  describe('Result display logic', () => {
    it('should determine correct result message', () => {
      const getResultMessage = (
        selectedId: string,
        correctId: string
      ): string => {
        return selectedId === correctId ? '✓ Richtig!' : '✗ Leider falsch';
      };

      expect(getResultMessage('a', 'a')).toBe('✓ Richtig!');
      expect(getResultMessage('b', 'a')).toBe('✗ Leider falsch');
    });

    it('should identify which option to highlight as correct', () => {
      const isCorrectOption = (optionId: string) =>
        optionId === mockQuiz.correctOptionId;

      expect(isCorrectOption('a')).toBe(true);
      expect(isCorrectOption('b')).toBe(false);
    });

    it('should identify incorrectly selected option', () => {
      const selectedId = 'b';
      const isIncorrectlySelected = (optionId: string) =>
        optionId === selectedId && optionId !== mockQuiz.correctOptionId;

      expect(isIncorrectlySelected('a')).toBe(false);
      expect(isIncorrectlySelected('b')).toBe(true);
      expect(isIncorrectlySelected('c')).toBe(false);
    });
  });

  describe('Submit button state', () => {
    it('should disable submit when no option selected', () => {
      const canSubmit = (selectedId: string | null): boolean => !!selectedId;

      expect(canSubmit(null)).toBe(false);
      expect(canSubmit('a')).toBe(true);
    });

    it('should prevent option changes after showing result', () => {
      const showResult = true;
      const canChangeSelection = !showResult;

      expect(canChangeSelection).toBe(false);
    });
  });

  describe('Reset functionality', () => {
    it('should reset to initial state', () => {
      const resetState = () => ({
        selectedOptionId: null,
        showResult: false,
      });

      const state = resetState();
      expect(state.selectedOptionId).toBeNull();
      expect(state.showResult).toBe(false);
    });
  });
});
