// Orders.tsx

import React, { useEffect, useState } from 'react';
import '../App.css';

// Interface für ein Order-Produkt
interface OrderProduct {
    unique_id: string;
    product_id: string;
    name: string;
    color_code: string;
    color: string;
    supplier_id: number;
    supplier: string;
    manufacturer: string;
    size: string;
    stock: number;
    index: number;
    real_ek: number;
    list_ek: number;
    list_vk: number;
    special_price: number | null;
    vat: number;
    vpe: number;
    warengruppeNr: string;
    vkRabattMax: number | null;
    kunde: string | null;
    order_nr: string | null;
    order_date: string | null;
    delivery_date: string | null;
    order_quantity: number;
    order_discounts_first: number | null;
    order_discounts_second: number | null;
}

// Spalten-Definition (wie csvFieldMapping)
const csvFieldMapping = [
  { key: 'unique_id',           label: 'Scancode' },
  { key: 'product_id',          label: 'Artikel-Nr' },
  { key: 'name',                label: 'Artikel-Name' },
  { key: 'color_code',          label: 'Farbcode' },
  { key: 'color',               label: 'Farbe' },
  { key: 'size',                label: 'Größe' },
  { key: 'index',               label: 'Sort.' },
  { key: 'stock',               label: 'Bestandsmenge' },
  { key: 'supplier',            label: 'Lieferant' },
  { key: 'manufacturer',        label: 'Hersteller' },
  { key: 'real_ek',             label: 'Realer EK' },
  { key: 'list_ek',             label: 'Listen-EK' },
  { key: 'list_vk',             label: 'VK' },
  { key: 'special_price',       label: 'Sonderpreis' },
  { key: 'vkRabattMax',         label: 'VK-Rabatt Max' },
  { key: 'kunde',               label: 'Kunden-Nr.' },
  { key: 'order_nr',            label: 'Bestell-Nr..' },
  { key: 'order_date',          label: 'Bestelldatum' },
  { key: 'delivery_date',       label: 'Lieferdatum' },
  { key: 'order_quantity',      label: 'Bestellmenge' },
  { key: 'order_discounts_first', label: 'Rabatt 1' },
  { key: 'order_discounts_second', label: 'Rabatt 2' }
];

const Orders: React.FC = () => {
  const [daten, setDaten] = useState<OrderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderNr, setOrderNr] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('order_date');
  const [sortAsc, setSortAsc] = useState(true);
  const [gesamtanzahl, setGesamtanzahl] = useState(0);

  // Daten laden, entweder nach OrderNr oder nach Artikelnamen
  const fetchData = (order = '', search = '') => {
    setLoading(true);
    let url = 'http://localhost:3001/api/orders';
    if (order) {
      url += `?order_nr=${encodeURIComponent(order)}`;
    } else if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setDaten(data.items || []);
        setGesamtanzahl(data.total || 0);
      })
      .catch(err => console.error("Fehler beim Abruf:", err))
      .finally(() => setLoading(false));
  };

  // Initial-Ladung
  useEffect(() => {
    fetchData();
  }, []);

  // Suchen (entweder orderNr oder name)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(orderNr.trim(), orderNr.trim() ? '' : searchTerm.trim());
  };

  // CSV Export
  const exportCSV = () => {
    if (!daten || daten.length === 0) return;
    const header = csvFieldMapping.map(f => f.label);
    const rows = daten.map(item =>
      csvFieldMapping.map(f => {
        const value = (item as any)[f.key];
        return value !== null && value !== undefined ? value.toString() : '';
      }).join(';')
    );
    const csvContent = [header.join(';'), ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'orders-export.csv';
    link.click();
  };

  // Sortierfunktion
  const handleSort = (column: string) => {
    let asc = sortAsc;
    if (sortColumn === column) {
      asc = !asc;
      setSortAsc(asc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
      asc = true;
    }
    const sorted = [...daten].sort((a, b) => {
      let valA = (a as any)[column];
      let valB = (b as any)[column];
      // Null/undefined immer hinten
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      // Zahlen
      if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
        return asc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }
      // Strings
      return asc
        ? valA.toString().localeCompare(valB.toString(), 'de', { numeric: true })
        : valB.toString().localeCompare(valA.toString(), 'de', { numeric: true });
    });
    setDaten(sorted);
  };

  return (
    <div className="container">
      <h3><center>Order-Produkte</center></h3>
      <p>Angezeigte Einträge: <strong>{daten.length}</strong>{gesamtanzahl > 0 && ` von ${gesamtanzahl}`}</p>
      <form onSubmit={handleSearch} className="search">
        <input
          type="text"
          placeholder="Order-Nr. (z.B. 19640)"
          value={orderNr}
          style={{ width: '160px', marginRight: '8px' }}
          onChange={e => setOrderNr(e.target.value)}
        />
        <span style={{marginRight: '12px'}}>oder</span>
        <input
          type="text"
          placeholder="Artikelname suchen..."
          value={searchTerm}
          style={{ width: '200px', marginRight: '8px' }}
          onChange={e => setSearchTerm(e.target.value)}
          disabled={orderNr.trim().length > 0}
        />
        <button type="submit">Suchen</button>
      </form>

      <button onClick={exportCSV} className="export">CSV exportieren</button>

      {loading ? (
        <>
          <p>Daten werden geladen...</p>
          <div className="loading-bar-container"><div className="loading-bar"></div></div>
        </>
      ) : daten.length === 0 ? (
        <p>Keine Daten gefunden.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {csvFieldMapping.map(f => (
                  <th key={f.key} onClick={() => handleSort(f.key)}>
                    {f.label} {sortColumn === f.key ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daten.map((item, idx) => (
                <tr key={item.unique_id || idx}>
                  {csvFieldMapping.map((f, i) => (
                    <td key={i}>{(item as any)[f.key] ?? '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
