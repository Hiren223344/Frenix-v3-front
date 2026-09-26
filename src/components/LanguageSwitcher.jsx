import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from './motion/combobox';

// The sidebar footer's language indicator — was a static "EN" label, now a
// real searchable switcher over every language MyMemory (src/lib/translate)
// can translate into. The trigger stays a compact "globe + code" pill (its
// own thing, not <ComboboxInput>) so it reads as a current-value display
// when closed; the actual search field lives at the top of the popover.
export default function LanguageSwitcher({ className }) {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = languages.find((l) => l.code === language) ?? languages[0];
  const shortCode = current.code.split('-')[0].toUpperCase();

  return (
    <Combobox
      value={language}
      onValueChange={setLanguage}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
      query={query}
      onQueryChange={setQuery}
      className={className}
    >
      <ComboboxTrigger className="h-auto w-auto gap-1.5 rounded-md border-none bg-transparent p-0 text-[12px] focus-within:ring-2 focus-within:ring-offset-0 [&>svg:first-child]:hidden">
        <button
          type="button"
          aria-label={`Change language (currently ${current.name})`}
          className="flex items-center gap-1.5"
          style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Globe size={14} />
          <span>{shortCode}</span>
        </button>
      </ComboboxTrigger>

      <ComboboxContent side="top" align="start" className="w-64">
        <div className="border-b border-border p-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
            <ComboboxInput placeholder="Search languages…" aria-label="Search languages" className="h-5" />
          </div>
        </div>
        <ComboboxList ariaLabel="Languages" className="max-h-64 p-1.5">
          <ComboboxEmpty>No languages found.</ComboboxEmpty>
          {languages.map((lang) => (
            <ComboboxItem
              key={lang.code}
              value={lang.code}
              textValue={lang.name}
              keywords={[lang.name, lang.native]}
              className="justify-between py-1.5"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{lang.name}</span>
                {lang.native !== lang.name && (
                  <span className="truncate text-xs text-muted-foreground">{lang.native}</span>
                )}
              </span>
              {lang.code === language && <Check size={14} className="shrink-0 text-foreground" aria-hidden="true" />}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
