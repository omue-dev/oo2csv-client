import { useEffect, useState } from 'react';

interface Kunde {
  customer_id: string;
  salutation: string;
  firstname: string;
  lastname: string;
  street: string;
  street_number: string;
  zip: string;
  city: string;
  country: string;
  phone1: string;
  phone2: string;
  phone3: string;
  email: string;
  remark: string[];
  discount: number;
  deleted: boolean;
}

const Customers = () => {
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/customers')
      .then(res => res.json())
      .then(data => setKunden(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    const header = [
      'customer_id', 'salutation', 'firstname', 'lastname', 'street', 'street_number', 'zip', 'city', 'country',
      'phone1', 'phone2', 'phone3', 'email', 'remark', 'discount'
    ];

    const formatPhoneExport = (phone: string, country: string) => {
      if (!phone) return '';
      // Für Österreich (A) führen wir '++' ein, sonst Original
      return country === 'A' ? `++${phone}` : phone;
    };

    // remark as array
    // const formatRemark = (remark: string[]) => {
    //   if (!remark || remark.length === 0) return '';
    //   const parts = remark.map(r => r.replace(/'/g, "''"));
    //   return `['${parts.join("','")}']`;
    // };

    // remark with line break;
    const formatRemarkFlat = (remark: string[]): string => {
      if (!remark || remark.length === 0) return '';
      // Double-Quotes escapen für CSV-Quote-Konformität
      const escaped = remark.map(r => r.replace(/"/g, '""').trim());
      // Mit echtem Zeilenumbruch verbinden
      return escaped.join('\n');
    };


    const rows = kunden.map((k): string[] => [
      k.customer_id,
      k.salutation,
      k.firstname,
      k.lastname,
      k.street,
      k.street_number,
      k.zip,
      k.city,
      k.country,
      formatPhoneExport(k.phone1, k.country),
      formatPhoneExport(k.phone2, k.country),
      formatPhoneExport(k.phone3, k.country),
      k.email,
      formatRemarkFlat(k.remark),
      k.discount.toString(),
      k.deleted ? '1' : '0'
    ]);

    /**
     * Escape fields with commas, quotes or newlines
     * by wrapping them in double quotes.
     *
     * @param {string} field The field to escape
     * @returns {string} The escaped field
     */
    const escapeField = (field: string): string => {
      const str = field.replace(/"/g, '""'); // Replace all double quotes with two double quotes
      // If the string contains commas, quotes or newlines, wrap it in double quotes
      return /,|"|\n/.test(str) ? `"${str}"` : str;
    };

  // JOIN mit Semikolon
  const lines = rows.map(r => r.map(escapeField).join(';'));
  const csvBody = [
    header.map(escapeField).join(';'),  // Header mit ;
    ...lines
  ].join('\n');

  // BOM vorne dran
  const csvContent = '\uFEFF' + csvBody;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'kunden-export.csv';
  link.click();
};

  return (
    <div className="container">
      <h3>Kundendaten</h3>
      <button onClick={exportCSV}>CSV exportieren</button>
      {loading ? (
        <p>Daten werden geladen...</p>
      ) : (
        <table>
          <thead>
            <tr>
              {['Nr.','Anrede','Vorname','Nachname','Straße','Haus-Nr.','PLZ','Ort','Land','Tel. priv. 1','Tel. priv. 2','Tel. Firma','E-Mail','Info','Rabatt'].map(key => <th key={key}>{key}</th>)}
            </tr>
          </thead>
          <tbody>
            {kunden.map((k, i) => (
              <tr key={i} className={k.deleted ? 'deleted' : ''}>
                <td>{k.customer_id}</td>
                <td>{k.salutation}</td>
                <td>{k.firstname}</td>
                <td>{k.lastname}</td>
                <td>{k.street}</td>
                <td>{k.street_number}</td>
                <td>{k.zip}</td>
                <td>{k.city}</td>
                <td>{k.country}</td>
                <td>{k.phone1 || '-'}</td>
                <td>{k.phone2 || '-'}</td>
                <td>{k.phone3 || '-'}</td>
                <td>{k.email}</td>
                <td>{k.remark}</td>
                <td>{k.discount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Customers;
