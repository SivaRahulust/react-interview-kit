import { useState, useEffect, useRef } from 'react';
import './SearchSuggestion.css';

interface Suggestion {
  id: string;
  label: string;
}

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
  const [filtered, setFiltered] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestionObjects: Suggestion[] = suggestions.map((item, index) => ({
    id: `${item}-${index}`,
    label: item
  }));
  useEffect(() => {
    if (query) {
      const matches = suggestionObjects.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value: string) => {
    setQuery(value);
    setShowDropdown(false);
    onSelect?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();

      if (!showDropdown && query) {
        setShowDropdown(filtered.length > 0);
      }

      if (showDropdown) {
        setActiveIndex(prev =>
          prev < filtered.length - 1 ? prev + 1 : prev
        );
      }
    }

    else if (e.key === 'ArrowUp') {
      e.preventDefault();

      if (showDropdown) {
        setActiveIndex(prev =>
          prev > 0 ? prev - 1 : -1
        );
      }
    }

    else if (e.key === 'Enter') {
      e.preventDefault();

      if (showDropdown && activeIndex >= 0) {
        handleSelect(filtered[activeIndex].label);
      }
    }

    else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="search-suggestion" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="search-input"
      />

      {showDropdown && (
        <ul className="suggestions-dropdown" role="list">
          {filtered.map((item, index) => (
            <li
              key={item.id}
              role="listitem"
              onClick={() => handleSelect(item.label)}
              className={index === activeIndex ? 'active' : ''}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}