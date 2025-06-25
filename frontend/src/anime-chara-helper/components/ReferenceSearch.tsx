import React, { useState } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';

interface ReferenceSearchProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const ReferenceSearch: React.FC<ReferenceSearchProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/anime-chara/reference-search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Reference search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reference-search">
      <div className="search-header">
        <div className="search-input">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for reference images..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading}>
            <IoSearch size={20} />
          </button>
        </div>
        <button className="close-button" onClick={onClose}>
          <IoClose size={20} />
        </button>
      </div>

      <div className="search-results">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : results.length > 0 ? (
          <div className="results-grid">
            {results.map((url, index) => (
              <div key={index} className="result-item" onClick={() => onSelect(url)}>
                <img src={url} alt={`Reference ${index + 1}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            {searchTerm ? 'No results found' : 'Start searching for reference images'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferenceSearch; 