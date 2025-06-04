import React, { useEffect, useState } from 'react';
import './App.css';

interface Produkt {
  unique_id: string;
  product_id: string;
  name: string;
  color_code: string;
  color: string;
  supplier_id: number;
  supplier: string;
  size: string;
  stock: number;
  index: number;
  real_ek: number;
  list_ek: number;
  discount1: number;
  discount2: number;
  list_vk: number;
  special_price: number | null;
  vat: number;
}

const App: React.FC = () => {
  const [daten, setDaten] = useState<Produkt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortAsc, setSortAsc] = useState(true);

  const fetchData = (term = '') => {
    setLoading(true);
    fetch(`http://localhost:3001/api/produkte${term ? `?search=${term}` : ''}`)
      .then(res => res.json())
      .then(setDaten)
      .catch(err => console.error("Fehler beim Abruf:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(searchTerm);
  };


const exportCSV = () => {
  if (!daten || daten.length === 0) return;

  const header = [
    'unique_id','product_id','name','color_code','color','supplier_id','supplier','real_ek',
    'list_ek','discount1','discount2','list_vk','special_price','vat',
    'size','stock','index'
  ];

  const rows: string[] = daten.map(item => [
    item.unique_id,
    item.product_id,
    item.name,
    item.color_code,
    item.color,
    item.supplier_id?.toString() ?? '',
    item.supplier ?? '',
    item.real_ek?.toString() ?? '',
    item.list_ek?.toString() ?? '',
    item.discount1?.toString() ?? '',
    item.discount2?.toString() ?? '',
    item.list_vk?.toString() ?? '',
    item.special_price?.toString() ?? '',
    item.vat?.toString() ?? '',
    item.size ?? '',
    item.stock?.toString() ?? '',
    item.index?.toString() ?? ''
  ].join(','));

  const csvContent = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'adverics-export.csv';
  link.click();
};



  const handleSort = (column: string) => {
    setSortAsc(prev => (column === sortColumn ? !prev : true));
    setSortColumn(column);
    const sorted = [...daten].sort((a, b) => {
      const valA = (a as any)[column];
      const valB = (b as any)[column];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    setDaten(sorted);
  };

  return (
    <div className="container">
      <h3>Bestandsexport <span className="timestamp">(Stand: {new Date().toLocaleString()})</span></h3>
      <form onSubmit={handleSearch} className="search">
        <input
          type="text"
          placeholder="Produktname suchen..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button type="submit">Suchen</button>
      </form>

      <button onClick={exportCSV} className="export">CSV exportieren</button>

      {loading ? (
        <>
          <p>Daten werden geladen...</p>
          <div className="loading-bar-container">
            <div className="loading-bar"></div>
          </div>
        </>
      ) : daten.length === 0 ? (
        <p>Keine Daten gefunden.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {Object.keys(daten[0]).map(key => (
                <th key={key} onClick={() => handleSort(key)}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daten.map((item, index) => {
              const next = daten[index + 1];
              const isLastOfColor = !next || next.color !== item.color;
              return (
              <tr
                key={index}
                className={item.stock < 1 ? 'text-gray-400' : ''}
                style={{
                  borderBottom: isLastOfColor ? '2px solid black' : '1px solid #ccc'
                }}
              >
                {Object.entries(item).map(([key, value], i) => (
                  <td key={i}>
                    {Array.isArray(value) ? (
                      key === 'sizes'
                        ? value.map((v, j) => <div key={j}>{v.size} ({v.stock})</div>)
                        : value.map((v, j) => <div key={j}>{JSON.stringify(v)}</div>)
                    ) : (
                      value ?? '-'
                    )}
                  </td>
                ))}
                  </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
