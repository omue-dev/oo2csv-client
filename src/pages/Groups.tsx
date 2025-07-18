import React, { useEffect, useState } from 'react';

interface ProductGroup {
  WarengruppeNr: string;
  Warengruppe: string;
  Sortierung: string;
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  // Export table to CSV (manual, like Products.tsx)
  const exportCSV = () => {
    if (!groups || groups.length === 0) return;
    // Only export the three data columns, not the Aktion column
    const header = ['WarengruppeNr', 'Warengruppe', 'Sortierung'];
    const rows = groups.map(g => [g.WarengruppeNr, g.Warengruppe, g.Sortierung].join(';'));
    const csvContent = [header.join(';'), ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'warengruppen.csv';
    link.click();
  };

  // Edit Warengruppe name
  const handleEdit = (idx: number, current: string) => {
    setEditIdx(idx);
    setEditValue(current);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = (idx: number) => {
    setGroups(prev => prev.map((g, i) => i === idx ? { ...g, Warengruppe: editValue } : g));
    setEditIdx(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditValue('');
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/product-groups')
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Laden der Warengruppen');
        return res.json();
      })
      .then(data => {
        setGroups(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Lade Warengruppen...</div>;
  if (error) return <div>Fehler: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Warengruppen</h2>
      <button onClick={exportCSV} style={{ marginBottom: '1rem' }}>Export als CSV</button>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>WarengruppeNr</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Warengruppe</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Sortierung</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{g.WarengruppeNr}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {editIdx === idx ? (
                  <>
                    <input value={editValue} onChange={handleEditChange} style={{ width: '80%' }} />
                    <button onClick={() => handleEditSave(idx)} style={{ marginLeft: 4 }}>Speichern</button>
                    <button onClick={handleEditCancel} style={{ marginLeft: 4 }}>Abbrechen</button>
                  </>
                ) : (
                  <>
                    {g.Warengruppe}
                  </>
                )}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{g.Sortierung}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {editIdx === idx ? null : (
                  <button onClick={() => handleEdit(idx, g.Warengruppe)}>Namen ändern</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Groups;
