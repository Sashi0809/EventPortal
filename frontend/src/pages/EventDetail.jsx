import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiBookmark, FiHeart, FiShare2, FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, getCategoryColor, getCategoryEmoji, getDefaultPoster } from '../utils/helpers';
import CountdownTimer from '../components/CountdownTimer';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
      if (user) {
        setIsRegistered(data.registeredUsers?.some(u => u._id === user._id));
        setIsInterested(data.interestedUsers?.includes(user._id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/events/${id}/register`);
      setIsRegistered(true);
      setQrCode(data.qrCode);
      fetchEvent();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleUnregister = async () => {
    try {
      await api.delete(`/events/${id}/register`);
      setIsRegistered(false);
      setQrCode(null);
      fetchEvent();
    } catch (err) { console.error(err); }
  };

  const handleBookmark = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/bookmarks/${id}`);
      setIsBookmarked(data.bookmarked);
    } catch (err) { console.error(err); }
  };

  const handleInterested = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/events/${id}/interested`);
      setIsInterested(data.interested);
      fetchEvent();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!event) return <div className="empty-state"><h3>Event not found</h3></div>;

  const spotsLeft = event.maxParticipants - (event.registeredUsers?.length || 0);

  return (
    <div className="event-detail">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        <FiArrowLeft /> Back
      </button>

      {/* Hero Image */}
      <div className="event-detail-hero">
        {event.posterImage ? (
          <img src={event.posterImage} alt={event.title} />
        ) : (
          <div className="event-detail-hero-placeholder" style={{ background: getDefaultPoster(event.category) }}>
            {getCategoryEmoji(event.category)}
          </div>
        )}
        <div className="event-detail-hero-overlay">
          <span className="tag" style={{ background: getCategoryColor(event.category), color: 'white', fontSize: '0.8rem', border: 'none' }}>
            {event.category}
          </span>
        </div>
      </div>

      <div className="event-detail-content">
        {/* Main Content */}
        <div className="event-detail-main">
          <h1>{event.title}</h1>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {event.tags?.map((tag, i) => (
              <span className="tag" key={i}>{tag}</span>
            ))}
          </div>

          {/* Countdown */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Event Starts In
            </h3>
            <CountdownTimer targetDate={event.date} />
          </div>

          <p className="event-detail-desc">{event.description}</p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {isRegistered ? (
              <button className="btn btn-danger" onClick={handleUnregister}>
                Cancel Registration
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleRegister} disabled={spotsLeft <= 0}>
                {spotsLeft <= 0 ? 'Event Full' : 'Register Now'}
              </button>
            )}
            <button className={`btn ${isBookmarked ? 'btn-primary' : 'btn-secondary'}`} onClick={handleBookmark}>
              <FiBookmark /> {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button className={`btn ${isInterested ? 'btn-primary' : 'btn-secondary'}`} onClick={handleInterested}>
              <FiHeart /> {isInterested ? 'Interested' : 'Mark Interested'}
            </button>
          </div>

          {/* QR Code */}
          {qrCode && (
            <div className="detail-info-card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>Your Registration QR Code</h3>
              <img src={qrCode} alt="QR Code" style={{ maxWidth: '200px', margin: '0 auto', borderRadius: '12px' }} />
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Show this at the venue for check-in
              </p>
            </div>
          )}

          {/* Registered Users */}
          {event.registeredUsers && event.registeredUsers.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1rem' }}>
                Registered Participants ({event.registeredUsers.length})
              </h3>
              <div className="registered-list">
                {event.registeredUsers.slice(0, 10).map(u => (
                  <div className="registered-item" key={u._id}>
                    <div className="registered-avatar">{u.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="event-detail-sidebar">
          <div className="detail-info-card">
            <div className="detail-info-row">
              <div className="detail-info-icon"><FiCalendar /></div>
              <div className="detail-info-text">
                <div className="detail-info-label">Date & Time</div>
                <div className="detail-info-value">{formatDate(event.date)} · {event.time}</div>
              </div>
            </div>
            <div className="detail-info-row">
              <div className="detail-info-icon"><FiMapPin /></div>
              <div className="detail-info-text">
                <div className="detail-info-label">Location</div>
                <div className="detail-info-value">{event.location}</div>
              </div>
            </div>
            <div className="detail-info-row">
              <div className="detail-info-icon"><FiUsers /></div>
              <div className="detail-info-text">
                <div className="detail-info-label">Capacity</div>
                <div className="detail-info-value">{event.registeredUsers?.length || 0} / {event.maxParticipants}</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="detail-info-card">
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Registration</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {Math.round(((event.registeredUsers?.length || 0) / event.maxParticipants) * 100)}%
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-input)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(((event.registeredUsers?.length || 0) / event.maxParticipants) * 100, 100)}%`,
                borderRadius: '4px',
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'No spots remaining'}
            </div>
          </div>

          {/* Club Info */}
          {event.club && (
            <div className="detail-info-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Hosted by
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '0.3rem' }}>{event.club.name}</h3>
              <span className="tag" style={{ fontSize: '0.75rem' }}>{event.club.category}</span>
              {event.club.contactEmail && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  📧 {event.club.contactEmail}
                </p>
              )}
            </div>
          )}

          {/* Interested Count */}
          <div className="detail-info-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>❤️</div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
              {event.interestedUsers?.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>People Interested</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
