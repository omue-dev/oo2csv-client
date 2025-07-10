import React, { useEffect, useState } from 'react';
import '../App.css';

// Interface zur Typdefinition eines Produkts
interface Produkt {
  unique_id: string;
  product_id: string;
  name: string;
  color_code: string;
  color: string;
  supplier: string;
  manufacturer: string;
  size: string;
  size_range?: string;
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
  // Zustand für geladene Produktdaten
  const [daten, setDaten] = useState<Produkt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortAsc, setSortAsc] = useState(true);
  const [gesamtanzahl, setGesamtanzahl] = useState(0);


  // Daten vom Server laden
  const fetchData = (term = '') => {
      setLoading(true);
      fetch(`http://localhost:3001/api/produkte${term ? `?search=${term}` : ''}`)
        .then(res => res.json())
        .then(data => {
          const sorted = data.items.sort((a: Produkt, b: Produkt) => {
            // 1. Nach Hersteller (manufacturer)
            const manufA = (a.manufacturer || '').toLowerCase();
            const manufB = (b.manufacturer || '').toLowerCase();
            if (manufA < manufB) return -1;
            if (manufA > manufB) return 1;

            // 2. Wenn Hersteller gleich: nach product_id
            const pidA = a.product_id;
            const pidB = b.product_id;
            if (pidA < pidB) return -1;
            if (pidA > pidB) return 1;

            // 3. Wenn product_id gleich: nach index (Größensortierung)
            return a.index - b.index;
          });
          const sortedWithSizeRange = sorted.map((item: { size_range: any; }) => ({
            ...item,
            size_range: item.size_range ?? ''
          }));
          setDaten(sortedWithSizeRange);             // sortierte Daten setzen
          setGesamtanzahl(data.total);   // Gesamtanzahl aus Server übernehmen
        })
        .catch(err => console.error("Fehler beim Abruf:", err))
        .finally(() => setLoading(false));
    };


  // Initialer Abruf beim Laden der Seite
  useEffect(() => {
    fetchData();
  }, []);

  // Suchen-Button gedrückt
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(searchTerm);
  };

  // CSV-Export der aktuellen Daten
  const exportCSV = () => {
  // Wenn keine Daten vorhanden sind, abbrechen
  if (!daten || daten.length === 0) return;

  /**
   * Definiert die Spaltenüberschriften für die CSV-Datei.
   * Diese entsprechen den Eigenschaftsnamen im Produktobjekt.
   */
  const header = [
    'unique_id',      // Eindeutige ID des Eintrags (z. B. Varianten-ID)
    'product_id',     // Modellcode oder Artikelcode
    'name',           // Produktname
    'color_code',     // Farbcode (z. B. "ch")
    'color',          // Farbname (z. B. "chlorite green")
    'supplier',       // Name des Lieferanten (aus supplier.csv)
    'manufacturer',   // Herstellername (aus product-stocks.csv)
    'real_ek',        // Effektiver Einkaufspreis (EK)
    'list_ek',        // Listen-EK (aus CSV)
    'discount1',      // Erster Rabatt
    'discount2',      // Zweiter Rabatt
    'list_vk',        // Listenverkaufspreis
    'special_price',  // Sonderpreis (falls gepflegt)
    'vat',            // Mehrwertsteuersatz (z. B. 0.19)
    'size',           // Größenangabe (z. B. "185 cm")
    'size_range',     // Größenlauf    
    'stock',          // Lagerbestand
    'index'           // Optionaler Sortierindex (derzeit immer 0)
  ];

  /**
   * Wandelt alle Produkteinträge (`daten`) in CSV-Zeilen um.
   * Dabei werden alle Felder einzeln in Strings umgewandelt,
   * leere oder null-Werte werden mit '' ersetzt.
   */
  const rows: string[] = daten.map(item => [
    item.unique_id,
    item.product_id,
    item.name,
    item.color_code,
    item.color,
    item.supplier?.toString() ?? '',         // Lieferant (optional)
    item.manufacturer ?? '',                 // Hersteller
    item.real_ek?.toString() ?? '',          // EK real
    item.list_ek?.toString() ?? '',          // EK Liste
    item.discount1?.toString() ?? '',        // Rabatt 1
    item.discount2?.toString() ?? '',        // Rabatt 2
    item.list_vk?.toString() ?? '',          // VK Liste
    item.special_price?.toString() ?? '',    // Sonderpreis
    item.vat?.toString() ?? '',              // MwSt
    item.size ?? '',
    item.size_range?.toString() ?? '',               
    item.stock?.toString() ?? '',            // Bestand
    item.index?.toString() ?? ''             // Index (falls vorhanden)
  ].join(',')); // Spalten durch Kommas trennen (CSV = comma-separated values)

  /**
   * Kombiniert die Kopfzeile mit den Datenzeilen.
   * Jede Zeile wird durch einen Zeilenumbruch getrennt.
   */
  const csvContent = [header.join(','), ...rows].join('\n');

  /**
   * Erstellt ein Blob (eine Datei im Speicher) mit dem CSV-Inhalt.
   * Typ: text/csv mit UTF-8-Kodierung.
   */
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });

  /**
   * Erstellt einen Download-Link für den CSV-Inhalt
   * und simuliert einen Klick auf den Link, damit die Datei automatisch heruntergeladen wird.
   */
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'adverics-export.csv'; // Name der exportierten Datei
  link.click(); // Klick auslösen → Download startet
};


  // Sortierfunktion für Tabellenüberschriften
  const handleSort = (column: string) => {
    setSortAsc(prev => (column === sortColumn ? !prev : true));
    setSortColumn(column);
    const sorted = [...daten].sort((a: any, b: any) => {
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
      <h3><center>OO-Daten vom<span> 09.07.2025</span></center></h3>
      <p>
        (<i>[server/data/] products.csv | product-stocks.csv | product-sizes.csv</i>) –
        generiert in <code>DC02/adverics-csv-export.php</code> – gespeichert in <code>/csv_export_adverics/</code>
      </p>
      <p>
        Angezeigte Einträge: <strong>{daten.length}</strong>
        {gesamtanzahl > 0 && ` von ${gesamtanzahl}`}
      </p>
      {/* Suchfeld */}
      <form onSubmit={handleSearch} className="search">
        <input
          type="text"
          placeholder="Produktname suchen..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button type="submit">Suchen</button>
      </form>

      {/* CSV Export-Button */}
      <button onClick={exportCSV} className="export">CSV exportieren</button>

      {/* Ladeanzeige / Ergebnistabelle */}
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
        <div className="table-wrapper">
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
        </div>
      )}
    </div>
  );
};

export default App;
