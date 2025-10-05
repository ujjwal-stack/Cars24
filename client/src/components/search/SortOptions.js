// client/src/components/search/SortOptions.js
export const SortOptions = ({ sortBy, onSortChange }) => {
  return (
    <div className="sort-options">
      <label htmlFor="sort">Sort by:</label>
      <select
        id="sort"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="sort-select"
      >
        <option value="-createdAt">Newest First</option>
        <option value="createdAt">Oldest First</option>
        <option value="pricing.askingPrice">Price: Low to High</option>
        <option value="-pricing.askingPrice">Price: High to Low</option>
        <option value="basicInfo.year">Year: Old to New</option>
        <option value="-basicInfo.year">Year: New to Old</option>
        <option value="basicInfo.kmsDriven">Kilometers: Low to High</option>
        <option value="-basicInfo.kmsDriven">Kilometers: High to Low</option>
      </select>
    </div>
  );
};

export default SortOptions;