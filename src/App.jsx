import React, { useEffect, useState } from 'react';

function App() {
  const [daten, setDaten] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/produkte')
      .then(res => res.json())
      .then(setDaten)
      .catch(err => console.error("Fehler beim Abruf:", err));
  }, []);

  const exportCSV = () => {
    const header = Object.keys(daten[0]).join(',') + '\\n';
    const rows = daten.map(obj => Object.values(obj).join(',')).join('\\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'export.csv';
    link.click();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Produkt-Analyse</h1>
      <button onClick={exportCSV}>CSV exportieren</button>
      {daten.length === 0 ? (
        <p>Keine Daten.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>ArtikelNr</th>
              <th>Modell</th>
              <th>Farbe</th>
              <th>EK</th>
              <th>VK</th>
              <th>Sonderpreis</th>
              <th>Größen</th>
            </tr>
          </thead>
          <tbody>
            {daten.map((item, index) => (
              <tr key={index}>
                <td>{item.ArtikelNr}</td>
                <td>{item.Modell}</td>
                <td>{item.Farbe}</td>
                <td>{item.EK}</td>
                <td>{item.VK}</td>
                <td>{item.Sonderpreis}</td>
                <td>
                  {item.Größen.map((g, i) => (
                    <div key={i}>{g.Größe} ({g.Bestand})</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
