import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchSuggestion from './SearchSuggestion';

const mockSuggestions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

describe('SearchSuggestion - Filtering Logic', () => {
  it('renders input field with placeholder', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('shows filtered suggestions on input (case insensitive)', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'app' } });
    
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('filters suggestions case insensitively', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'CHERRY' } });
    
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('hides dropdown when no matches found', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'xyz' } });
    
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('hides dropdown when input is cleared', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'app' } });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('filters multiple matching items', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'e' } });
    
    expect(screen.getByText('Cherry')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Elderberry')).toBeInTheDocument();
  });
});

describe('SearchSuggestion - Selection Logic', () => {
  it('selects suggestion on click and fills input', () => {
    const onSelect = vi.fn();
    render(<SearchSuggestion suggestions={mockSuggestions} onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'ban' } });
    fireEvent.click(screen.getByText('Banana'));
    
    expect(onSelect).toHaveBeenCalledWith('Banana');
    expect(input).toHaveValue('Banana');
  });

  it('calls onSelect callback when provided', () => {
    const onSelect = vi.fn();
    render(<SearchSuggestion suggestions={mockSuggestions} onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'app' } });
    fireEvent.click(screen.getByText('Apple'));
    
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('Apple');
  });

  it('works without onSelect callback', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'app' } });
    fireEvent.click(screen.getByText('Apple'));
    
    expect(input).toHaveValue('Apple');
  });
});

describe('SearchSuggestion - Keyboard Navigation', () => {
  it('navigates suggestions with ArrowDown key', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'e' } });
    
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('active');
    
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getAllByRole('listitem')[1]).toHaveClass('active');
  });

  it('navigates suggestions with ArrowUp key', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'e' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('active');
  });

  it('selects suggestion with Enter key', () => {
    const onSelect = vi.fn();
    render(<SearchSuggestion suggestions={mockSuggestions} onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'e' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onSelect).toHaveBeenCalled();
    expect(input.value).toBeTruthy();
  });

  it('hides dropdown on Escape key', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'app' } });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('does not navigate beyond list boundaries', () => {
    render(<SearchSuggestion suggestions={['Apple', 'Apricot']} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'ap' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    expect(screen.getByText('Apricot')).toHaveClass('active');
  });

  it('resets active index when query changes', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'e' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('active');
    
    fireEvent.change(input, { target: { value: 'a' } });
    const items = screen.getAllByRole('listitem');
    items.forEach(item => expect(item).not.toHaveClass('active'));
  });
});

describe('SearchSuggestion - Dropdown Behavior', () => {
  it('hides dropdown when clicking outside', () => {
    render(
      <div>
        <SearchSuggestion suggestions={mockSuggestions} />
        <button>Outside</button>
      </div>
    );
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'app' } });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    
    fireEvent.mouseDown(screen.getByText('Outside'));
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows dropdown only when there are matches', () => {
    render(<SearchSuggestion suggestions={mockSuggestions} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: 'app' } });
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
