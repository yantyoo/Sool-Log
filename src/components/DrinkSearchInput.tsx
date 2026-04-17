import React from 'react';
import { Search } from 'lucide-react';

interface DrinkSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DrinkSearchInput({ value, onChange, placeholder = '술 이름, 브랜드, 별칭으로 검색' }: DrinkSearchInputProps) {
  return (
    <label className="card flex items-center gap-3 px-4 py-3">
      <Search size={18} className="text-white/35 shrink-0" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/25"
      />
    </label>
  );
}

