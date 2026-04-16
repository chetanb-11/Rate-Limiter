import { useState } from 'react';
import axios from 'axios';
import './App.css';
import Dashboard from './components/Dashboard';

function App() {
  const [stats, setStats] = useState([]);

  const apiCall = () => {
    axios.get('http://localhost:3000/api/stats').then((res) => {
      // The actual data is in res.data
      console.log(res.data);
      setStats(res.data);
    }).catch(err => console.error("Error fetching stats:", err));
  }

  return (
    <div className="App">
      <header className="App-header">
        <Dashboard stats={stats} />
        <button onClick={apiCall}>Refresh</button>
      </header>
    </div>
  );
}

export default App;