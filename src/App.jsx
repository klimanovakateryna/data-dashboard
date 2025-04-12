import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import './App.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Brewery Dashboard</h2>
      </div>
      <nav>
        <ul>
          <li><Link to="/" className="sidebar-link">Dashboard</Link></li>
          <li><Link to="/" className="sidebar-link">Breweries</Link></li>
          <li><Link to="/" className="sidebar-link">Search</Link></li>
        </ul>
      </nav>
    </aside>
  );
}

function Dashboard() {
  const [breweries, setBreweries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  useEffect(() => {
    const fetchBreweries = async () => {
      try {
        const response = await fetch('https://api.openbrewerydb.org/v1/breweries?per_page=30');
        const data = await response.json();
        setBreweries(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching breweries:', error);
        setLoading(false);
      }
    };
    fetchBreweries();
  }, []);
  const filteredBreweries = breweries.filter(brewery => {
    const matchesSearch = brewery.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === '' || brewery.brewery_type === filterType;
    return matchesSearch && matchesType;
  });
  const totalBreweries = breweries.length;
  const mostCommonType =
    breweries.length > 0
      ? Object.entries(breweries.reduce((acc, b) => {
          const type = b.brewery_type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})).reduce((max, curr) => (curr[1] > max[1] ? curr : max), ['None', 0])[0]
      : 'None';
  const uniqueStates =
    breweries.length > 0
      ? new Set(breweries.map(b => b.state_province || b.state)).size
      : 0;
  const breweryTypeCounts = breweries.reduce((acc, brewery) => {
    const type = brewery.brewery_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const breweryTypeData = Object.entries(breweryTypeCounts).map(([type, count]) => ({ type, count }));
  const breweryStateCounts = breweries.reduce((acc, brewery) => {
    const state = brewery.state_province || brewery.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});
  const breweryStateData = Object.entries(breweryStateCounts).map(([name, value]) => ({ name, value }));
  const generateColors = (num) => {
    let colors = [];
    for (let i = 0; i < num; i++) {
      colors.push(`hsl(${(i * 360) / num}, 70%, 50%)`);
    }
    return colors;
  };
  const pieColors = generateColors(breweryStateData.length);
  const barColor = "#FFA500";
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <div className="stats-cards">
            <div className="stat-card"><h2>{totalBreweries}</h2><p>Total Breweries</p></div>
            <div className="stat-card"><h2>{mostCommonType}</h2><p>Most Common Type</p></div>
            <div className="stat-card"><h2>{uniqueStates}</h2><p>Unique States</p></div>
          </div>
        </header>
        <div className="controls">
          <input type="text" placeholder="Search by brewery name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="">All Types</option>
            <option value="micro">Micro</option>
            <option value="nano">Nano</option>
            <option value="regional">Regional</option>
            <option value="brewpub">Brewpub</option>
            <option value="large">Large</option>
            <option value="planning">Planning</option>
            <option value="contract">Contract</option>
            <option value="proprietor">Proprietor</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        {loading ? (
          <p className="loading">Loading breweries...</p>
        ) : (
          <div className="columns-container">
            <div className="list-column">
              <div className="brewery-list">
                {filteredBreweries.map(brewery => (
                  <Link to={`/brewery/${brewery.id}`} key={brewery.id} className="brewery-link">
                    <div className="brewery-card">
                      <h3>{brewery.name}</h3>
                      <p><strong>Type:</strong> {brewery.brewery_type}</p>
                      <p><strong>City:</strong> {brewery.city}</p>
                      <p><strong>State:</strong> {brewery.state_province || brewery.state}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="charts-column">
              <div className="chart-card">
                <h3>Brewery Count by Type</h3>
                <BarChart width={400} height={300} data={breweryTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={barColor} />
                </BarChart>
              </div>
              <div className="chart-card">
                <h3>Distribution by State</h3>
                <PieChart width={400} height={300}>
                  <Pie data={breweryStateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {breweryStateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BreweryDetail() {
  const { id } = useParams();
  const [brewery, setBrewery] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBrewery = async () => {
      try {
        const response = await fetch(`https://api.openbrewerydb.org/v1/breweries/${id}`);
        const data = await response.json();
        setBrewery(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching brewery:', error);
        setLoading(false);
      }
    };
    fetchBrewery();
  }, [id]);
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        {loading ? (
          <p className="loading">Loading brewery details...</p>
        ) : brewery ? (
          <div className="brewery-detail">
            <Link to="/" className="back-button">Back</Link>
            <h2>{brewery.name}</h2>
            <p><strong>Type:</strong> {brewery.brewery_type}</p>
            <p>
              <strong>Address:</strong> {brewery.address_1}
              {brewery.address_2 && `, ${brewery.address_2}`}
              {brewery.address_3 && `, ${brewery.address_3}`}
            </p>
            <p><strong>City:</strong> {brewery.city}</p>
            <p><strong>State:</strong> {brewery.state_province || brewery.state}</p>
            <p><strong>Postal Code:</strong> {brewery.postal_code}</p>
            <p><strong>Country:</strong> {brewery.country}</p>
            {brewery.phone && <p><strong>Phone:</strong> {brewery.phone}</p>}
            {brewery.website_url && (
              <p>
                <strong>Website:</strong> <a href={brewery.website_url} target="_blank" rel="noopener noreferrer">{brewery.website_url}</a>
              </p>
            )}
            {(brewery.latitude && brewery.longitude) && (
              <p>
                <strong>Coordinates:</strong> {brewery.latitude}, {brewery.longitude}
              </p>
            )}
            {brewery.street && <p><strong>Street:</strong> {brewery.street}</p>}
          </div>
        ) : (
          <p className="loading">Brewery not found.</p>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/brewery/:id" element={<BreweryDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
