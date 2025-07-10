import { useEffect, useState } from 'react';

interface Kunde {
  customer_id: string;
  firstname: string;
  lastname: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  phone1: string;
  phone2: string;
  phone3: string;
  email: string;
  mail_confirmation: boolean;
  birthdate: string;
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
      'customer_id', 'firstname', 'lastname', 'street', 'zip', 'city', 'country',
      'phone1', 'phone2', 'phone3', 'email', 'mail_confirmation', 'birthdate', 'remark', 'discount', 'deleted'
    ];

    const formatPhoneExport = (phone: string, country: string) => {
      if (!phone) return '';
      // Für Österreich (A) führen wir '++' ein, sonst Original
      return country === 'A' ? `++${phone}` : phone;
    };
    // Helper to format remark array as single-quoted list
    const formatRemark = (remark: string[]) => {
      if (!remark || remark.length === 0) return '';
      const parts = remark.map(r => r.replace(/'/g, "''"));
      return `['${parts.join("','")}']`;
    };

    const rows = kunden.map((k): string[] => [

      k.customer_id,
      k.firstname,
      k.lastname,
      k.street,
      k.zip,
      k.city,
      k.country,
      formatPhoneExport(k.phone1, k.country),
      formatPhoneExport(k.phone2, k.country),
      formatPhoneExport(k.phone3, k.country),
      k.email,
      k.mail_confirmation ? '1' : '0',
      k.birthdate,
      formatRemark(k.remark),
      k.discount.toString(),
      k.deleted ? '1' : '0'
    ]);

    // Escape fields with commas, quotes or newlines
    const escapeField = (field: string) => {
      // prefix BOM only on first field later
      const str = field.replace(/"/g, '""');
      if (/,|"|\n/.test(str)) {
        return `"${str}"`;
      }
      return str;
    };

    // Build CSV text
    const lines = rows.map(row => row.map(escapeField).join(','));
    const csvBody = [header.map(escapeField).join(','), ...lines].join('\n');
    // Add BOM
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
              {['customer_id','firstname','lastname','street','zip','city','country','phone1','phone2','phone3','email','mail_confirmation','birthdate','remark','discount','deleted'].map(key => <th key={key}>{key}</th>)}
            </tr>
          </thead>
          <tbody>
            {kunden.map((k, i) => (
              <tr key={i} className={k.deleted ? 'deleted' : ''}>
                <td>{k.customer_id}</td>
                <td>{k.firstname}</td>
                <td>{k.lastname}</td>
                <td>{k.street}</td>
                <td>{k.zip}</td>
                <td>{k.city}</td>
                <td>{k.country}</td>
                <td>{k.phone1 || '-'}</td>
                <td>{k.phone2 || '-'}</td>
                <td>{k.phone3 || '-'}</td>
                <td>{k.email}</td>
                <td>{k.mail_confirmation ? 'true' : 'false'}</td>
                <td>{k.birthdate}</td>
                <td><pre>{JSON.stringify(k.remark)}</pre></td>
                <td>{k.discount}</td>
                <td>{k.deleted ? 'true' : 'false'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Customers;
