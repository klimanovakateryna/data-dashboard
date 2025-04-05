import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [breweries, setBreweries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const fetchAllBreweries = async () => {
      let page = 1;
      let allBreweries = [];
      while (true) {
        const response = await fetch(`https://api.openbrewerydb.org/v1/breweries?per_page=50&page=${page}`);
        const data = await response.json();
        if (data.length === 0) break;
        allBreweries = allBreweries.concat(data);
        page++;
      }
      setBreweries(allBreweries);
      setLoading(false);
    };
    fetchAllBreweries();
  }, []);

  const filteredBreweries = breweries.filter(brewery => {
    const matchesSearch = brewery.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === '' || brewery.brewery_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalBreweries = breweries.length;
  const mostCommonType =
    breweries.length > 0
      ? Object.entries(
          breweries.reduce((acc, b) => {
            const type = b.brewery_type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {})
        ).reduce((max, curr) => (curr[1] > max[1] ? curr : max), ['None', 0])[0]
      : 'None';
  const uniqueStates =
    breweries.length > 0
      ? new Set(breweries.map(b => b.state_province || b.state)).size
      : 0;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Brewery Dashboard</h2>
        </div>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Breweries</li>
            <li>Search</li>
          </ul>
        </nav>
      </aside>
      <div className="main-content">
        <header className="header">
          <div className="stats-cards">
            <div className="stat-card">
              <h2>{totalBreweries}</h2>
              <p>Total Breweries</p>
            </div>
            <div className="stat-card">
              <h2>{mostCommonType}</h2>
              <p>Most Common Type</p>
            </div>
            <div className="stat-card">
              <h2>{uniqueStates}</h2>
              <p>Unique States</p>
            </div>
          </div>
        </header>
        <div className="controls">
          <input
            type="text"
            placeholder="Search by brewery name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
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
          <div className="brewery-list">
            {filteredBreweries.map(brewery => (
              <div key={brewery.id} className="brewery-card">
                <h3>{brewery.name}</h3>
                <p><strong>Type:</strong> {brewery.brewery_type}</p>
                <p>
                  <strong>Address:</strong> {brewery.address_1}
                  {brewery.address_2 && `, ${brewery.address_2}`}
                  {brewery.address_3 && `, ${brewery.address_3}`}
                </p>
                <p><strong>City:</strong> {brewery.city}</p>
                <p>
                  <strong>State:</strong> {brewery.state_province || brewery.state}
                </p>
                <p><strong>Postal Code:</strong> {brewery.postal_code}</p>
                <p><strong>Country:</strong> {brewery.country}</p>
                {brewery.phone && <p><strong>Phone:</strong> {brewery.phone}</p>}
                {brewery.website_url && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={brewery.website_url} target="_blank" rel="noopener noreferrer">
                      {brewery.website_url}
                    </a>
                  </p>
                )}
                {(brewery.latitude && brewery.longitude) && (
                  <p>
                    <strong>Coordinates:</strong> {brewery.latitude}, {brewery.longitude}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
