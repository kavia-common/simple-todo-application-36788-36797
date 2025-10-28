import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Retro Todos header', () => {
  render(<App />);
  const header = screen.getByText(/Retro Todos/i);
  expect(header).toBeInTheDocument();
});
