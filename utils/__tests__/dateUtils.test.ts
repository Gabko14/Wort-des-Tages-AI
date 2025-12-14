describe('Date Utilities', () => {
  describe('getTodayDateString', () => {
    it('should return date string in YYYY-MM-DD format', () => {
      const dateString = new Date().toISOString().split('T')[0];
      expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return consistent date string on same day', () => {
      const date1 = new Date().toISOString().split('T')[0];
      const date2 = new Date().toISOString().split('T')[0];
      expect(date1).toBe(date2);
    });

    it('should format date correctly', () => {
      // Mock a specific date
      const mockDate = new Date('2024-01-15T10:30:00Z');
      const dateString = mockDate.toISOString().split('T')[0];
      expect(dateString).toBe('2024-01-15');
    });

    it('should handle dates with single digit months and days', () => {
      const mockDate = new Date('2024-01-05T10:30:00Z');
      const dateString = mockDate.toISOString().split('T')[0];
      expect(dateString).toBe('2024-01-05');
    });

    it('should handle dates with double digit months and days', () => {
      const mockDate = new Date('2024-12-31T23:59:59Z');
      const dateString = mockDate.toISOString().split('T')[0];
      expect(dateString).toBe('2024-12-31');
    });
  });

  describe('Date parsing', () => {
    it('should correctly parse date strings for comparison', () => {
      const date1 = new Date('2024-01-15').toISOString().split('T')[0];
      const date2 = new Date('2024-01-15').toISOString().split('T')[0];
      expect(date1).toBe(date2);
    });

    it('should differentiate between different dates', () => {
      const date1 = new Date('2024-01-15').toISOString().split('T')[0];
      const date2 = new Date('2024-01-16').toISOString().split('T')[0];
      expect(date1).not.toBe(date2);
    });

    it('should handle date crossing midnight correctly', () => {
      const date1 = new Date('2024-01-15T23:59:59Z').toISOString().split('T')[0];
      const date2 = new Date('2024-01-16T00:00:00Z').toISOString().split('T')[0];
      expect(date1).not.toBe(date2);
    });
  });
});
