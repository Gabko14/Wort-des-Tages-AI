import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('renders with title', () => {
    const { getByText } = render(<Button onPress={() => {}} title="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button onPress={onPressMock} title="Click Me" />);

    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button onPress={onPressMock} title="Click Me" disabled />);

    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders in loading state without crashing', () => {
    const { root } = render(<Button onPress={() => {}} title="Click Me" loading />);

    // Component should render without crashing
    expect(root).toBeTruthy();
  });

  it('renders all variants correctly', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;

    variants.forEach((variant) => {
      const { getByText } = render(<Button onPress={() => {}} title="Test" variant={variant} />);
      expect(getByText('Test')).toBeTruthy();
    });
  });

  it('renders with icon', () => {
    const { getByText } = render(<Button onPress={() => {}} title="With Icon" icon="add-circle" />);
    expect(getByText('With Icon')).toBeTruthy();
  });

  it('uses custom accessibility label', () => {
    const { getByLabelText } = render(
      <Button onPress={() => {}} title="Click" accessibilityLabel="Custom label" />
    );
    expect(getByLabelText('Custom label')).toBeTruthy();
  });
});
