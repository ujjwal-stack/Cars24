// client/src/pages/BuyCars.js
import React, { useState, useEffect } from 'react';
import { carService } from '../services/carService';
import CarCard from '../components/car/CarCard';
import SearchBar from '../components/search/SearchBar';
import { FilterPanel } from '../components/search/FilterPanel';
import { SortOptions } from '../components/search/SortOptions';
import { Loader } from '../components/common/Loader';

const BuyCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sortBy: '-createdAt'
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const result = await carService.getFilterOptions();
      setFilterOptions(result.data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const result = await carService.getCars(filters);
      const carsData = result.data?.cars || result.cars || [];
      const paginationData = result.data?.pagination || result.pagination || {};

      setCars(carsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="buy-cars-page">
      <div className="container">
        <div className="page-header">
          <h1>Buy Used Cars</h1>
          <p>Find your perfect car from thousands of verified listings</p>
        </div>

        <SearchBar onSearch={handleSearch} />

        <div className="cars-content">
          <aside className="filters-sidebar">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              filterOptions={filterOptions}
            />
          </aside>

          <main className="cars-main">
            <div className="cars-toolbar">
              <div className="results-count">
                {pagination && `${pagination.total} cars found`}
              </div>
              <SortOptions sortBy={filters.sortBy} onSortChange={handleSortChange} />
            </div>

            {loading ? (
              <Loader text="Loading cars..." />
            ) : cars.length === 0 ? (
              <div className="no-results">
                <h3>No cars found</h3>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <>
                <div className="cars-grid">
                  {cars.map(car => (
                    <CarCard key={car._id} car={car} onFavoriteChange={fetchCars} />
                  ))}
                </div>

                {pagination && pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>

                    <div className="pagination-pages">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`pagination-page ${page === pagination.page ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BuyCars;