"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter, SortAsc } from "lucide-react";

interface EnhancedSearchBarProps {
  onSearch: (query: string) => void;
  onToggleFilters: () => void;
  placeholder?: string;
  className?: string;
}

export default function EnhancedSearchBar({
  onSearch,
  onToggleFilters,
  placeholder = "Search tracks, artists, tags...",
  className = "",
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show floating search button when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFloatingSearch(scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to clear search
      if (e.key === "Escape" && isFocused) {
        setQuery("");
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFocused]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleFloatingSearchClick = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Main Search Bar */}
      <div className={`enhanced-search-container ${className}`}>
        <div className="enhanced-search-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="enhanced-search-input"
            />
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="search-clear-btn"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          <div className="search-actions">
            <button
              onClick={onToggleFilters}
              className="filter-btn"
              title="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>

            <div className="search-shortcut">
              <kbd className="shortcut-key">⌘</kbd>
              <kbd className="shortcut-key">K</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Search Button */}
      <AnimatePresence>
        {showFloatingSearch && !isFocused && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={handleFloatingSearchClick}
            className="floating-search-btn"
            title="Search (⌘K)"
          >
            <Search className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
