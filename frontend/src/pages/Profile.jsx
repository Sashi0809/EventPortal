import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '', department: '', yearOfStudy: 1, interests: '', skills: ''
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        yearOfStudy: user.yearOfStudy || 1,
        interests: (user.interests || []).join(', '),
        skills: (user.skills || []).join(', ')
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const { data } = await api.put('/auth/profile', {
        name: formData.name,
        department: formData.department,
        yearOfStudy: Number(formData.yearOfStudy),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      updateUser(data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <p>{user?.department} · Year {user?.yearOfStudy}</p>
          <span className="tag" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{user?.role}</span>
          {user?.interests?.length > 0 && (
            <div className="profile-tags">
              {user.interests.map((interest, i) => (
                <span className="tag" key={i}>{interest}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.5rem' }}>✏️ Edit Profile</h3>

        {success && (
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                <option value="">Select</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Industrial & Production">Industrial & Production</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Business Administration">Business Administration</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select className="form-select" value={formData.yearOfStudy} onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}>
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Interests (comma separated)</label>
            <input type="text" className="form-input" placeholder="AI, Coding, Music, Sports..." value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Skills (comma separated)</label>
            <input type="text" className="form-input" placeholder="Python, React, Arduino..." value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
