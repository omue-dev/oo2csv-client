import React, { useEffect, useState } from 'react';
import '../App.css';

// Interface zur Typdefinition eines Produkts
interface Produkt {
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
}

const App: React.FC = () => {
  // Zustand für geladene Produktdaten
  const [daten, setDaten] = useState<Produkt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortAsc, setSortAsc] = useState(true);
  const [gesamtanzahl, setGesamtanzahl] = useState(0);

  // Typ für das Mapping-Array
  type CsvFieldMappingEntry = { key: keyof Produkt, label: string };

  // Das Mapping-Array:
  const csvFieldMapping: CsvFieldMappingEntry[] = [
    { key: 'unique_id',        label: 'Identnummer' },
    { key: 'product_id',       label: 'Artikel-Nr' },
    { key: 'name',             label: 'Artikel-Name' },
    { key: 'color_code',       label: 'Lief. Farb Nr.' },
    { key: 'color',            label: 'Lief. Farb Name' },
    { key: 'supplier_id',      label: 'Hpt. Lief. Nr' },
    { key: 'supplier',         label: 'Hpt. Lief. Name' },
    { key: 'manufacturer',     label: 'Hersteller' },
    { key: 'size',             label: 'Groesse' },
    { key: 'stock',            label: 'Bestand' },
    { key: 'index',            label: 'Groessen Sort.' },
    { key: 'real_ek',          label: 'Realer-EK Netto' },
    { key: 'list_ek',          label: 'Listen-EK Netto' },
    { key: 'list_vk',          label: 'VK Brutto' },
    { key: 'special_price',    label: 'Sonderpreis Brutto' },
    { key: 'vat',              label: 'MwSt' },
    { key: 'vpe',              label: 'VPE' },
    { key: 'warengruppeNr',    label: 'Warengruppen-Nr.' },
    { key: 'vkRabattMax',      label: 'VK Rabatt Max' },
    { key: 'kunde',            label: 'Kunde Nr.' }
  ];

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
          // const sortedWithSizeRange = sorted.map((item: { size_range: any; }) => ({
          //   ...item,
          //   size_range: item.size_range ?? ''
          // }));
          setDaten(sorted);          // sortierte Daten setzen
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
  const header = csvFieldMapping.map(field => field.label);

  // Rows
  const rows: string[] = daten.map(item =>
    csvFieldMapping.map(field => {
      // Value holen, korrekt als String ausgeben
      const value = item[field.key as keyof Produkt];
      return value !== null && value !== undefined ? value.toString() : '';
    }).join(';') // Achtung: Hier das Semikolon!
  );

  /**
   * Kombiniert die Kopfzeile mit den Datenzeilen.
   * Jede Zeile wird durch einen Zeilenumbruch getrennt.
   */
  const csvContent = [header.join(';'), ...rows].join('\n');

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
            {csvFieldMapping.map(field => (
              <th key={field.key} onClick={() => handleSort(field.key)}>
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {daten.map((item, index) => (
            <tr key={index}>
              {csvFieldMapping.map((field, i) => (
                <td key={i}>{item[field.key] ?? '-'}</td>
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

export default App;
