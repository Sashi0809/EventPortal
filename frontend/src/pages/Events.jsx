import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('nearest');
  const [bookmarks, setBookmarks] = useState([]);

  const categories = ['', 'technical', 'cultural', 'sports', 'workshop', 'seminar', 'hackathon', 'fest'];

  useEffect(() => {
    fetchEvents();
    if (user) fetchBookmarks();
  }, [category, sort]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      params.append('sort', sort);
      params.append('upcoming', 'true');
      const { data } = await api.get(`/events?${params}`);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/bookmarks');
      setBookmarks(data.map(e => e._id));
    } catch (err) { console.error(err); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleBookmark = async (eventId) => {
    try {
      const { data } = await api.post(`/bookmarks/${eventId}`);
      if (data.bookmarked) {
        setBookmarks(prev => [...prev, eventId]);
      } else {
        setBookmarks(prev => prev.filter(id => id !== eventId));
      }
    } catch (err) { console.error(err); }
  };

  const handleInterested = async (eventId) => {
    try { await api.post(`/events/${eventId}/interested`); } catch (err) { console.error(err); }
  };

  return (
    <div className="section" style={{ paddingTop: '6rem' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">🎯 Discover Events</h2>
          <p className="section-subtitle">Find events that match your interests</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <form className="search-box" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search events by name, tags, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="nearest">Nearest Date</option>
          <option value="popularity">Most Popular</option>
          <option value="newest">Newly Added</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="filter-pills" style={{ marginBottom: '2rem' }}>
        {categories.map(cat => (
          <button
            key={cat || 'all'}
            className={`filter-pill ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat || 'All'}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="spinner"></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No events found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <EventCard
              key={event._id}
              event={event}
              onBookmark={user ? handleBookmark : null}
              onInterested={user ? handleInterested : null}
              isBookmarked={bookmarks.includes(event._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
