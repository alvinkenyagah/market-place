import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../../../services/api';
import { ErrorMsg, StarRating } from '../../Shared';

export default function Search() {
  const [services, setServices] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [search, setSearch]     = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Dynamic API Categories State
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch both existing categories and services on load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch categories dynamically from your endpoint
        if (servicesAPI.getCategories) {
          const cats = await servicesAPI.getCategories();
          setDynamicCategories(cats);
        } else {
          // Fallback if API helper isn't written yet
          const res = await fetch('https://market-place-api-xlwv.onrender.com/api/services/categories');
          const cats = await res.json();
          setDynamicCategories(cats);
        }
      } catch (err) {
        console.error('Failed to load registered categories:', err);
      }
      
      // Load initial services grid
      fetchServices(1);
    };

    loadInitialData();
  }, []);

  const fetchServices = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: 12 };
      if (search)   params.search   = search;
      if (location) params.location = location;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      
      if (selectedCategories.length > 0) {
        params.category = selectedCategories.join(',');
      }
      
      const data = await servicesAPI.list(params);
      setServices(data.services);
      setTotal(data.total);
      setPages(data.pages);
      setPage(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices(1);
  };

  const handleCategoryCheck = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearAll = () => {
    setSearch('');
    setSelectedCategories([]);
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    fetchServices(1);
  };

  const getPaginationRange = () => {
    const delta = 1;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift('...');
    if (page + delta < pages - 1) range.push('...');
    range.unshift(1);
    if (pages > 1) range.push(pages);
    return range;
  };

  const inputStyles = "block w-full px-3.5 py-2.5 font-body text-sm text-charcoal bg-white border border-gray-300 rounded-sm outline-none placeholder:text-gray-400 transition-all focus:border-terracotta focus:ring-3 focus:ring-terracotta/12";

  return (
    <div className="max-w-[1100px] mx-auto p-8 max-sm:p-5 animate-[fadeUp_0.35s_ease_both]">
      
      <div className="mb-6">
        <h2 className="font-display text-3xl font-bold text-charcoal relative inline-block after:content-[''] after:block after:w-10 after:h-[3px] after:bg-terracotta after:rounded-full after:mt-1.5">
          Browse Services
        </h2>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-md p-5 border border-gray-200 shadow-sm mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
          
          <input placeholder="Search services…" value={search} onChange={e => setSearch(e.target.value)} className={inputStyles} />
          
          {/* Dynamic Checklist Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${inputStyles} flex justify-between items-center cursor-pointer select-none ${selectedCategories.length > 0 ? 'border-terracotta text-charcoal' : 'text-gray-400'}`}
            >
              <span className="truncate">
                {selectedCategories.length === 0 
                  ? 'All Categories' 
                  : `${selectedCategories.length} selected`}
              </span>
              <span className={`text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-200 rounded-sm shadow-lg z-50 p-2 max-h-60 overflow-y-auto animate-[fadeUp_0.15s_ease_both]">
                {dynamicCategories.length === 0 ? (
                  <div className="px-2 py-1.5 font-body text-xs text-gray-400 italic">No categories found</div>
                ) : (
                  dynamicCategories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <label 
                        key={cat} 
                        className="flex items-center gap-2.5 px-2.5 py-2 font-body text-sm rounded-sm hover:bg-cream cursor-pointer text-gray-700 checked:text-charcoal transition-colors select-none"
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleCategoryCheck(cat)}
                          className="w-4 h-4 rounded-xs border-gray-300 text-terracotta accent-terracotta cursor-pointer"
                        />
                        <span>{cat}</span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className={inputStyles} />
        </div>
        
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="font-body text-xs font-semibold text-gray-500 mr-1">Active Filters:</span>
            {selectedCategories.map(cat => (
              <span key={cat} className="inline-flex items-center gap-1 bg-terracotta-light text-terracotta-dark font-body text-xs font-semibold px-2 py-0.5 rounded-sm">
                {cat}
                <button type="button" onClick={() => handleCategoryCheck(cat)} className="hover:text-status-cancelled text-[10px] font-bold ml-0.5">✕</button>
              </span>
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 max-sm:flex-col max-sm:items-stretch">
          <div className="flex items-center gap-2 max-sm:grid max-sm:grid-cols-2">
            <input placeholder="Min price" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className={`${inputStyles} max-w-[140px] max-sm:max-w-none`} />
            <input placeholder="Max price" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className={`${inputStyles} max-w-[140px] max-sm:max-w-none`} />
          </div>
          
          <div className="flex items-center gap-2 justify-end">
            <button type="button" onClick={clearAll} className="px-4 py-2.5 font-body text-sm font-semibold rounded-sm border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 active:bg-gray-200 transition-all cursor-pointer">
              Clear All
            </button>
            <button type="submit" className="px-5 py-2.5 font-body text-sm font-semibold rounded-sm text-white bg-terracotta shadow-[0_2px_8px_rgba(196,98,45,0.25)] hover:bg-terracotta-dark hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {/* Services rendering logic remains the same below... */}
      <ErrorMsg msg={error} />
      {/* ... keeping the remainder of the view layout grid block unchanged ... */}
      {loading ? (
        <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-md overflow-hidden border border-gray-200 animate-pulse">
              <div className="w-full h-[140px] bg-gray-200" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-md">
          <p className="font-body text-base text-gray-500">No services match your active search terms parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
          {services.map(s => (
            <div key={s._id} className="bg-white rounded-md overflow-hidden border border-gray-200 shadow-xs flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-1 group">
              <div className="relative overflow-hidden h-[140px] bg-gray-100">
                {s.images?.[0] ? (
                  <img src={`https://market-place-api-xlwv.onrender.com${s.images[0]}`} alt={s.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-cream-dark text-gray-400 font-body text-xs">No preview available</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col gap-1.5">
                <h4 className="font-display text-base font-semibold text-charcoal leading-tight line-clamp-1">{s.title}</h4>
                <p className="font-body text-sm font-bold text-terracotta">KES {s.price.toLocaleString()}</p>
                <p className="font-body text-xs text-gray-500">{s.category} · {s.location}</p>
                <div className="flex items-center gap-1 font-body text-xs text-gray-500 mt-0.5">
                  <StarRating value={Math.round(s.averageRating)} />
                  <span>({s.totalReviews})</span>
                </div>
                <Link to={`/services/${s._id}`} className="mt-3 w-full text-center py-1.5 px-3 font-body text-xs font-semibold rounded-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                  View Offer
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}