// Orders.tsx

import React, { useEffect, useState } from 'react';
import '../App.css';
import { FixedSizeList as List } from 'react-window';
import './Orders.css';

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

// Feste Spaltenbreiten, passen! (Passe ggf. an)
const csvFieldMapping = [
  { key: 'unique_id',           label: 'EAN/Scancode',    width: 110 },
  { key: 'product_id',          label: 'Artikel-Nr',      width: 110 },
  { key: 'name',                label: 'Artikel-Name',    width: 180 },
  { key: 'color_code',          label: 'Lief. Farb Nr.',  width: 110 },
  { key: 'color',               label: 'Lief. Farb Name', width: 130 },
  { key: 'supplier_id',         label: 'Hpt. Lief. Nr',   width: 90 },
  { key: 'supplier',            label: 'Lieferant',       width: 120 },
  { key: 'manufacturer',        label: 'Marke',           width: 120 },
  { key: 'size',                label: 'Groesse',         width: 80 },
  { key: 'stock',               label: 'Bestand',         width: 90 },
  { key: 'index',               label: 'Groessen Sort.',  width: 110 },
  { key: 'real_ek',             label: 'Netto EK',        width: 100 },
  { key: 'list_ek',             label: 'EK',              width: 90 },
  { key: 'list_vk',             label: 'Vis VK',          width: 90 },
  { key: 'special_price',       label: 'VK = VIS VK wenn leer', width: 150 },
  { key: 'vat',                 label: 'MwSt',            width: 60 },
  { key: 'vpe',                 label: 'VPE',             width: 60 },
  { key: 'warengruppeNr',       label: 'Warengruppen-Nr.',width: 120 },
  { key: 'vkRabattMax',         label: 'Rabattspere',     width: 110 },
  { key: 'kunde',               label: 'Kunde Nr.',       width: 100 },
  { key: 'order_nr',            label: 'Bestell-Nr..',    width: 120 },
  { key: 'order_quantity',      label: 'Bestellmenge',    width: 110 },
  { key: 'order_date',          label: 'Bestelldatum',    width: 110 },
  { key: 'delivery_date',       label: 'Lieferdatum',     width: 110 },
  { key: 'order_discounts_first', label: 'Rabatt 1',      width: 90 },
  { key: 'order_discounts_second', label: 'Rabatt 2',     width: 90 }
];

const totalWidth = csvFieldMapping.reduce((sum, f) => sum + (f.width || 120), 0);

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
        <div
  className="table-virtual-container"
  style={{
    overflowX: 'auto',
    width: '100%',
    maxHeight: 600, // max Gesamthöhe für den gesamten Tabellenbereich
    borderRadius: '8px'
  }}
>
  <table style={{ minWidth: totalWidth, width: totalWidth, tableLayout: 'fixed' }}>
    <thead>
      <tr>
        {csvFieldMapping.map(f => (
          <th
            key={f.key}
            style={{ width: f.width, minWidth: f.width, maxWidth: f.width }}
            onClick={() => handleSort(f.key)}
          >
            {f.label} {sortColumn === f.key ? (sortAsc ? '▲' : '▼') : ''}
          </th>
        ))}
      </tr>
    </thead>
  </table>
  <div
    style={{
      height: 550,            // 600px List + ca. 38px Header => ca. 638px gesamt
      minWidth: totalWidth,
      width: totalWidth,
      overflowX: 'visible',
      overflowY: 'auto'
    }}
  >
    <List
      height={550}
      itemCount={daten.length}
      itemSize={36}
      width={totalWidth}
      style={{
        overflowX: 'visible',
        overflowY: 'auto'
      }}
    >
              {({ index, style }: { index: number; style: React.CSSProperties }) => {
                const item = daten[index];
                return (
                  <div
                    key={item.unique_id || index}
                    style={{
                      ...style,
                      display: 'flex',
                      width: totalWidth,
                      borderBottom: '1px solid #eee',
                      background: index % 2 ? "#f9f9f9" : "#fff"
                    }}
                  >
                    {csvFieldMapping.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          width: f.width,
                          minWidth: f.width,
                          maxWidth: f.width,
                          padding: '4px 8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {(item as any)[f.key] ?? '-'}
                      </div>
                    ))}
                  </div>
                );
              }}
            </List>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
