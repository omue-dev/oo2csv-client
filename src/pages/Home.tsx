import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // optional für Styling

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h2>Wähle eine Exportoption</h2>
      <div className="button-group">
        <button onClick={() => navigate('/products')}>Export Products</button>
        <button onClick={() => navigate('/customers')}>Export Customers</button>
      </div>
    </div>
  );
};

export default Home;
