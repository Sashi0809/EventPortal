import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMail, FiPhone, FiGlobe, FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

const ClubDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    fetchClub();
  }, [id]);

  const fetchClub = async () => {
    try {
      const { data } = await api.get(`/clubs/${id}`);
      setClub(data);
      if (user) {
        setIsMember(data.members?.some(m => m._id === user._id));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/clubs/${id}/join`);
      setIsMember(true);
      fetchClub();
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleLeave = async () => {
    try {
      await api.delete(`/clubs/${id}/join`);
      setIsMember(false);
      fetchClub();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!club) return <div className="empty-state"><h3>Club not found</h3></div>;

  const getCategoryGradient = (cat) => {
    const g = { technical: '#6366f1, #8b5cf6', cultural: '#ec4899, #f43f5e', sports: '#10b981, #14b8a6', literary: '#14b8a6, #06b6d4', social: '#3b82f6, #6366f1', other: '#6b7280, #9ca3af' };
    return g[cat] || g.other;
  };

  return (
    <div className="section" style={{ paddingTop: '6rem' }}>
      <Link to="/clubs">
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <FiArrowLeft /> Back to Clubs
        </button>
      </Link>

      <div className="profile-header">
        <div className="profile-avatar" style={{ background: `linear-gradient(135deg, ${getCategoryGradient(club.category)})`, fontSize: '2rem' }}>
          {club.name?.charAt(0)}
        </div>
        <div className="profile-info" style={{ flex: 1 }}>
          <h2>{club.name}</h2>
          <span className="tag" style={{ display: 'inline-block', marginTop: '0.4rem' }}>{club.category}</span>
          <p style={{ marginTop: '0.75rem' }}>{club.description}</p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div><strong style={{ color: 'var(--primary)' }}>{club.eventsHosted}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Events</span></div>
            <div><strong style={{ color: 'var(--primary)' }}>{club.members?.length || 0}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Members</span></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            {isMember ? (
              <button className="btn btn-danger btn-sm" onClick={handleLeave}>Leave Club</button>
            ) : user ? (
              <button className="btn btn-primary btn-sm" onClick={handleJoin}>Join Club</button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {club.contactEmail && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <FiMail /> {club.contactEmail}
          </div>
        )}
        {club.contactPhone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <FiPhone /> {club.contactPhone}
          </div>
        )}
        {club.socialLinks?.website && (
          <a href={club.socialLinks.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>
            <FiGlobe /> Website
          </a>
        )}
      </div>

      {/* Club Events */}
      <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Club Events</h3>
      {club.events && club.events.length > 0 ? (
        <div className="events-grid">
          {club.events.map(event => (
            <EventCard key={event._id} event={{ ...event, club: { name: club.name, logo: club.logo } }} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No events yet</h3>
          <p>This club hasn't hosted any events</p>
        </div>
      )}

      {/* Members */}
      {club.members && club.members.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Members ({club.members.length})</h3>
          <div className="registered-list">
            {club.members.map(m => (
              <div className="registered-item" key={m._id}>
                <div className="registered-avatar">{m.name?.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.department || m.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetail;
