// client/src/components/search/FilterPanel.js
export const FilterPanel = ({ filters, onFilterChange, filterOptions }) => {
  const handleChange = (filterName, value) => {
    onFilterChange({ ...filters, [filterName]: value, page: 1 });
  };

  const handleClearFilters = () => {
    onFilterChange({
      page: 1,
      limit: 12,
      sortBy: '-createdAt'
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key] && !['page', 'limit', 'sortBy'].includes(key)
  ).length;
 
  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        {activeFiltersCount > 0 && (
          <button onClick={handleClearFilters} className="clear-filters-btn">
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="filter-section">
        <h4>Brand</h4>
        <select
          value={filters.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value)}
          className="filter-select"
        >
          
          <option value="">All Brands</option>
          {filterOptions.brands?.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
          
        </select>
      </div>

      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="price-input"
          />
          <span className="price-separator">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="price-input"
          />
        </div>
      </div>

      <div className="filter-section">
        <h4>Fuel Type</h4>
        <div className="checkbox-group">
          {['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map(fuel => (
            <label key={fuel} className="checkbox-label">
              <input
                type="radio"
                name="fuelType"
                value={fuel}
                checked={filters.fuelType === fuel}
                onChange={(e) => handleChange('fuelType', e.target.value)}
              />
              {fuel}
            </label>
          ))}
          <label className="checkbox-label">
            <input
              type="radio"
              name="fuelType"
              value=""
              checked={!filters.fuelType}
              onChange={(e) => handleChange('fuelType', '')}
            />
            All
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h4>Transmission</h4>
        <div className="checkbox-group">
          {['Manual', 'Automatic', 'AMT', 'CVT'].map(trans => (
            <label key={trans} className="checkbox-label">
              <input
                type="radio"
                name="transmission"
                value={trans}
                checked={filters.transmission === trans}
                onChange={(e) => handleChange('transmission', e.target.value)}
              />
              {trans}
            </label>
          ))}
          <label className="checkbox-label">
            <input
              type="radio"
              name="transmission"
              value=""
              checked={!filters.transmission}
              onChange={(e) => handleChange('transmission', '')}
            />
            All
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h4>Year</h4>
        <select
          value={filters.year || ''}
          onChange={(e) => handleChange('year', e.target.value)}
          className="filter-select"
        >
          <option value="">All Years</option>
          {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h4>City</h4>
        <select
          value={filters.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          className="filter-select"
        >
          <option value="">All Cities</option>
          {filterOptions.cities?.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;