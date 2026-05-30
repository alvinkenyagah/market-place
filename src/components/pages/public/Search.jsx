import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../../../services/api';
import { ErrorMsg, StarRating } from '../../Shared';

// ── Icons (inline SVG) ──────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const GpsIcon = ({ loading }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin text-terracotta" : ""}>
    <circle cx="12" cy="12" r="7"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
  </svg>
);
const PriceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Search() {
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Input states (uncommitted values)
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Committed filter values used explicitly for API dispatch calls
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    categories: []
  });

  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial lookup data mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (servicesAPI.getCategories) {
          const cats = await servicesAPI.getCategories();
          setDynamicCategories(cats);
        } else {
          const res = await fetch('https://market-place-api-xlwv.onrender.com/api/services/categories');
          const cats = await res.json();
          setDynamicCategories(cats);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadInitialData();
  }, []);

  // Main implementation tracking search parameter execution triggers
  const fetchServices = async (p = 1, currentFilters = activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: 12 };
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.location) params.location = currentFilters.location;
      if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
      if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;
      if (currentFilters.categories.length > 0) params.category = currentFilters.categories.join(',');

      const data = await servicesAPI.list(params);
      setServices(data.services || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch (e) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger loading when active filters alter
  useEffect(() => {
    fetchServices(1, activeFilters);
  }, [activeFilters]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveFilters(prev => ({
      ...prev,
      search,
      location,
      minPrice,
      maxPrice,
      categories: selectedCategories
    }));
  };

  // Pill alterations instantly sync into operational context filters
  const handleCategoryCheck = (cat) => {
    const updatedCats = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    
    setSelectedCategories(updatedCats);
    setActiveFilters(prev => ({ ...prev, categories: updatedCats }));
  };

  const handlePriceChange = (type, value) => {
    if (type === 'min') {
      setMinPrice(value);
      setActiveFilters(prev => ({ ...prev, minPrice: value }));
    } else {
      setMaxPrice(value);
      setActiveFilters(prev => ({ ...prev, maxPrice: value }));
    }
  };

  const handleLocationChange = (value) => {
    setLocation(value);
    setActiveFilters(prev => ({ ...prev, location: value }));
  };

  // ── GPS Geolocation Handler ──────────────────────────────────────────────
  const handleGpsDetection = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap Nominatim for clean reverse geocoding without api keys
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();

          if (data && data.address) {
            const addr = data.address;
            
            // Extract Area/Estate context
            const area = addr.neighbourhood || addr.suburb || addr.residential || addr.commercial || addr.quarter || '';
            // Extract City/Town context
            const city = addr.city || addr.town || addr.village || addr.city_district || '';

            let resolvedLocation = '';
            if (area && city) {
              resolvedLocation = `${area}, ${city}`;
            } else {
              resolvedLocation = area || city || data.name || 'Unknown Location';
            }

            handleLocationChange(resolvedLocation);
          } else {
            setError('Could not securely determine address components.');
          }
        } catch (err) {
          setError('Failed to fetch readable address from your GPS location.');
          console.error(err);
        } finally {
          setGpsLoading(false);
        }
      },
      (geoError) => {
        setGpsLoading(false);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError('Location permission denied.');
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case geoError.TIMEOUT:
            setError('The request to get your location timed out.');
            break;
          default:
            setError('An unknown Geolocation error occurred.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const clearAll = () => {
    setSearch('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategories([]);
    setActiveFilters({
      search: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      categories: []
    });
  };

  const hasActiveFilters = activeFilters.categories.length > 0 || activeFilters.location || activeFilters.minPrice || activeFilters.maxPrice || activeFilters.search;

  const getPaginationRange = () => {
    const delta = 1, range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) range.push(i);
    if (page - delta > 2) range.unshift('...');
    if (page + delta < pages - 1) range.push('...');
    range.unshift(1);
    if (pages > 1) range.push(pages);
    return range;
  };

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Hero Search Banner ─────────────────────────────────────────────── */}
      <div className="relative bg-charcoal" style={{ zIndex: 100 }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border-[32px] border-terracotta/20" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full border-[24px] border-terracotta/10" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        </div>

        <div className="relative max-w-[1100px] mx-auto px-8 py-12 max-sm:px-5 max-sm:py-8">
          <p className="font-body text-terracotta text-sm font-semibold tracking-widest uppercase mb-2">
            Marketplace
          </p>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Browse Services
          </h1>
          <p className="font-body text-gray-400 text-sm mb-8">
            {total > 0 ? `${total.toLocaleString()} services available` : 'Find skilled professionals near you'}
          </p>

          {/* ── Main Search Bar ── */}
          <form onSubmit={handleSearchSubmit}>
            <div
              className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.3)] transition-all duration-300"
              style={{ boxShadow: searchFocused ? '0 8px 40px rgba(196,98,45,0.25), 0 0 0 2px rgba(196,98,45,0.4)' : '0 8px 40px rgba(0,0,0,0.3)' }}
            >
              {/* Keyword */}
              <div className="flex items-center gap-2.5 flex-1 px-4 py-3.5 border-r border-gray-100">
                <span className="text-terracotta shrink-0"><SearchIcon /></span>
                <input
                  ref={searchRef}
                  placeholder="What are you looking for?"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-1 font-body text-sm text-charcoal bg-transparent outline-none placeholder:text-gray-400 min-w-0"
                />
                {search && (
                  <button type="button" onClick={() => { setSearch(''); setActiveFilters(p => ({ ...p, search: '' })); }} className="text-gray-300 hover:text-gray-500 shrink-0 transition-colors">
                    <XIcon />
                  </button>
                )}
              </div>

              {/* Location (Desktop) */}
              <div className="flex items-center gap-2.5 w-[240px] max-md:hidden px-4 py-3.5 border-r border-gray-100">
                <span className="text-gray-400 shrink-0"><LocationIcon /></span>
                <input
                  placeholder="Area, City"
                  value={location}
                  onChange={e => handleLocationChange(e.target.value)}
                  className="flex-1 font-body text-sm text-charcoal bg-transparent outline-none placeholder:text-gray-400 min-w-0"
                />
                <button
                  type="button"
                  onClick={handleGpsDetection}
                  disabled={gpsLoading}
                  className="p-1 text-gray-400 hover:text-terracotta rounded-md hover:bg-gray-50 transition-all shrink-0 disabled:opacity-50"
                  title="Use current location"
                >
                  <GpsIcon loading={gpsLoading} />
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="shrink-0 mx-2 my-2 px-6 py-2.5 font-body text-sm font-semibold text-white bg-terracotta rounded-lg hover:bg-terracotta-dark active:scale-95 transition-all duration-150 cursor-pointer shadow-[0_2px_8px_rgba(196,98,45,0.4)]"
              >
                Search
              </button>
            </div>

            {/* ── Filter Pill Row ── */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4">

              {/* Category dropdown pill */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm font-medium border transition-all duration-150 cursor-pointer
                    ${selectedCategories.length > 0
                      ? 'bg-terracotta text-white border-terracotta shadow-[0_2px_8px_rgba(196,98,45,0.35)]'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                >
                  <span>
                    {selectedCategories.length === 0 ? 'Category' : `${selectedCategories.length} Categor${selectedCategories.length > 1 ? 'ies' : 'y'}`}
                  </span>
                  <ChevronIcon open={isDropdownOpen} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] z-[200] p-1.5 max-h-64 overflow-y-auto">
                    {dynamicCategories.length === 0 ? (
                      <div className="px-3 py-2 font-body text-xs text-gray-400 italic">No categories found</div>
                    ) : (
                      dynamicCategories.map(cat => {
                        const checked = selectedCategories.includes(cat);
                        return (
                          <label key={cat} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-cream font-body text-sm text-gray-700 cursor-pointer transition-colors select-none">
                            <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-terracotta border-terracotta' : 'border-gray-300'}`}>
                              {checked && (
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                                  <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            <input type="checkbox" checked={checked} onChange={() => handleCategoryCheck(cat)} className="hidden" />
                            <span>{cat}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Location pill (Mobile View) */}
              <div className="hidden max-md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 font-body text-sm text-white">
                <LocationIcon />
                <input
                  placeholder="Area, City"
                  value={location}
                  onChange={e => handleLocationChange(e.target.value)}
                  className="bg-transparent outline-none placeholder:text-white/50 text-white w-24 text-sm"
                />
                <button
                  type="button"
                  onClick={handleGpsDetection}
                  disabled={gpsLoading}
                  className="p-0.5 text-white/70 hover:text-white transition-all shrink-0"
                >
                  <GpsIcon loading={gpsLoading} />
                </button>
              </div>

              {/* Price range pill */}
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 font-body text-sm text-white">
                <span className="text-white/60"><PriceIcon /></span>
                <input
                  placeholder="Min"
                  type="number"
                  value={minPrice}
                  onChange={e => handlePriceChange('min', e.target.value)}
                  className="bg-transparent outline-none placeholder:text-white/50 text-white w-16"
                />
                <span className="text-white/40 text-xs">–</span>
                <input
                  placeholder="Max"
                  type="number"
                  value={maxPrice}
                  onChange={e => handlePriceChange('max', e.target.value)}
                  className="bg-transparent outline-none placeholder:text-white/50 text-white w-16"
                />
              </div>

              {/* Clear pill */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 font-body text-sm text-white/70 hover:bg-red-500/20 hover:border-red-400/40 hover:text-red-300 transition-all duration-150 cursor-pointer"
                >
                  <XIcon />
                  Clear filters
                </button>
              )}
            </div>

            {/* Active filter chips */}
            {activeFilters.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeFilters.categories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 bg-terracotta/20 text-terracotta-light font-body text-xs font-semibold px-3 py-1 rounded-full border border-terracotta/30">
                    {cat}
                    <button type="button" onClick={() => handleCategoryCheck(cat)} className="opacity-70 hover:opacity-100 transition-opacity">
                      <XIcon />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Results Area ───────────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-8 py-8 max-sm:px-5">

        {/* Toolbar row */}
        <div className="flex items-center justify-between mb-5">
          <p className="font-body text-sm text-gray-500">
            {loading ? 'Searching…' : total > 0 ? (
              <><span className="font-semibold text-charcoal">{total.toLocaleString()}</span> services found</>
            ) : ''}
          </p>
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-charcoal text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <GridIcon />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-charcoal text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <ListIcon />
            </button>
          </div>
        </div>

        <ErrorMsg msg={error} />

        {/* Cards rendering */}
        {loading ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-4 gap-5 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1'
            : 'flex flex-col gap-3'}>
            {[...Array(viewMode === 'grid' ? 8 : 4)].map((_, i) => (
              <div key={i} className={`bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse ${viewMode === 'list' ? 'flex gap-4 p-3' : ''}`}>
                <div className={`bg-gray-100 shrink-0 ${viewMode === 'list' ? 'w-28 h-24 rounded-lg' : 'w-full h-[140px]'}`} />
                <div className={`p-4 flex flex-col gap-2 flex-1 ${viewMode === 'list' ? 'py-2' : ''}`}>
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl shadow-xs">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-300">
              <SearchIcon />
            </div>
            <p className="font-display text-lg font-semibold text-charcoal mb-1">No services found</p>
            <p className="font-body text-sm text-gray-400">Try adjusting your search terms or clearing filters.</p>
            <button onClick={clearAll} className="mt-5 px-5 py-2 font-body text-sm font-semibold rounded-lg bg-terracotta text-white hover:bg-terracotta-dark transition-colors cursor-pointer">
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
            {services.map((s, idx) => (
              <div
                key={s._id}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-xs flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="relative overflow-hidden h-[145px] bg-gray-50">
                  {s.images?.[0] ? (
                    <img
                      src={s.images[0]?.startsWith('http') ? s.images[0] : `https://market-place-api-xlwv.onrender.com${s.images[0]}`}
                      alt={s.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cream text-gray-300 font-body text-xs">No preview</div>
                  )}
                  <span className="absolute top-2.5 left-2.5 font-body text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {s.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-1">
                  <h4 className="font-display text-sm font-semibold text-charcoal leading-snug line-clamp-2">{s.title}</h4>
                  <div className="flex items-center gap-1 font-body text-xs text-gray-400 mt-0.5">
                    <LocationIcon />
                    <span className="line-clamp-1">{typeof s.location === 'object' ? s.location?.formattedAddress : s.location}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating value={Math.round(s.averageRating)} />
                    <span className="font-body text-xs text-gray-400">({s.totalReviews})</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <p className="font-body text-sm font-bold text-terracotta">KES {s.price.toLocaleString()}</p>
                    <Link to={`/services/${s._id}`} className="font-body text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── List View ── */
          <div className="flex flex-col gap-3">
            {services.map((s, idx) => (
              <div
                key={s._id}
                className="bg-white rounded-xl border border-gray-100 shadow-xs flex gap-4 p-3 transition-all duration-200 hover:shadow-md hover:border-gray-200 group"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="relative overflow-hidden w-28 h-24 rounded-lg bg-gray-50 shrink-0">
                  {s.images?.[0] ? (
                    <img
                      src={s.images[0]?.startsWith('http') ? s.images[0] : `https://market-place-api-xlwv.onrender.com${s.images[0]}`}
                      alt={s.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-body text-[10px]">No preview</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-sm font-semibold text-charcoal leading-snug line-clamp-1">{s.title}</h4>
                      <span className="shrink-0 font-body text-[10px] font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {s.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 font-body text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <LocationIcon />
                        {typeof s.location === 'object' ? s.location?.formattedAddress : s.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <StarRating value={Math.round(s.averageRating)} />
                      <span className="font-body text-xs text-gray-400">({s.totalReviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-body text-base font-bold text-terracotta">KES {s.price.toLocaleString()}</p>
                    <Link to={`/services/${s._id}`} className="font-body text-xs font-semibold text-white bg-terracotta hover:bg-terracotta-dark px-4 py-1.5 rounded-lg transition-colors">
                      View Offer →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-10">
            <button
              onClick={() => fetchServices(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 font-body text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              ← Prev
            </button>
            {getPaginationRange().map((p, i) => (
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-3 py-2 font-body text-sm text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => fetchServices(p)}
                  className={`w-9 h-9 font-body text-sm font-semibold rounded-lg transition-all cursor-pointer
                    ${p === page
                      ? 'bg-terracotta text-white shadow-[0_2px_8px_rgba(196,98,45,0.35)]'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              )
            ))}
            <button
              onClick={() => fetchServices(page + 1)}
              disabled={page === pages}
              className="px-4 py-2 font-body text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}