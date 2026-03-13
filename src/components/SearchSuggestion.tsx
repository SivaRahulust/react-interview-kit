import { useState, useEffect, useRef } from 'react';
import './SearchSuggestion.css';

interface SearchSuggestionProps {
  suggestions: string[];
  placeholder?: string;
  onSelect?: (value: string) => void;
}

export default function SearchSuggestion({ 
  suggestions, 
  placeholder = 'Search...', 
  onSelect 
}: SearchSuggestionProps) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query) {
      const matches = suggestions.filter(item =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setFiltered(matches);
      setShowDropdown(matches.length > 0);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
    setActiveIndex(-1);
  }, [query, suggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setQuery(value);
    setShowDropdown(false);
    onSelect?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showDropdown && query) {
        setShowDropdown(filtered.length > 0);
      }
      if (showDropdown) {
        setActiveIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showDropdown) {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && activeIndex >= 0) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="search-suggestion" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="search-input"
      />
      {showDropdown && (
        <ul className="suggestions-dropdown">
          {filtered.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className={index === activeIndex ? 'active' : ''}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
