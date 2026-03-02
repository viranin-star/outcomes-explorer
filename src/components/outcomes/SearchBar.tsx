"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface Program {
  slug: string;
  name: string;
  degreeLevel: string;
  institution: string | null;
}

export function SearchBar({ programs }: { programs: Program[] }) {
  const [query, setQuery] = useState("");

  const results = query.trim().length > 1
    ? programs.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.institution?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search programs, e.g. MSW, MBA, Nursing..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 outline-none text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {results.slice(0, 6).map((p) => (
            <a
              key={p.slug}
              href={`/programs/${p.slug}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{p.name}</p>
                {p.institution && (
                  <p className="text-xs text-slate-400">{p.institution}</p>
                )}
              </div>
              <span className="text-xs text-slate-400 capitalize">{p.degreeLevel}</span>
            </a>
          ))}
        </div>
      )}

      {query.trim().length > 1 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 px-4 py-3">
          <p className="text-sm text-slate-400">No programs found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
