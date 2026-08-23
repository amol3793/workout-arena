"use client";

import { useState, useMemo, type ReactNode } from "react";

/**
 * A reusable client-side search/filter wrapper.
 * Renders a search input, filters items by a `matchText` function,
 * and passes the filtered list to a render-prop child.
 */
interface SearchFilterProps<T> {
  items: T[];
  /** Produces the searchable text from an item (lowercased automatically). */
  matchText: (item: T) => string;
  placeholder?: string;
  emptyMessage?: string;
  children: (filtered: T[], query: string) => ReactNode;
}

export function SearchFilter<T>({
  items,
  matchText,
  placeholder = "Search…",
  emptyMessage = "No results found.",
  children,
}: SearchFilterProps<T>) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => matchText(item).toLowerCase().includes(q));
  }, [items, query, matchText]);

  return (
    <>
      <div className="relative mt-5">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-md"
          aria-label={placeholder}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
          {emptyMessage} Try a different search term.
        </p>
      ) : (
        children(filtered, query)
      )}
    </>
  );
}
