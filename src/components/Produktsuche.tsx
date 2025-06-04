// src/components/Produktsuche.tsx
import React, { useState } from 'react';

interface Props {
  onSearch: (term: string) => void;
}

const Produktsuche: React.FC<Props> = ({ onSearch }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Suche nach Modell..."
        value={term}
        onChange={e => setTerm(e.target.value)}
        style={{ padding: '0.5rem', fontSize: '1rem', width: '300px' }}
      />
      <button type="submit" style={{ marginLeft: '0.5rem' }}>Suchen</button>
    </form>
  );
};

export default Produktsuche;
