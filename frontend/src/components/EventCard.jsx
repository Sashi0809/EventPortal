import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiBookmark, FiHeart } from 'react-icons/fi';
import { formatDate, getCategoryColor, getCategoryEmoji, getDefaultPoster } from '../utils/helpers';

const EventCard = ({ event, onBookmark, onInterested, isBookmarked, isInterested }) => {
  const categoryColor = getCategoryColor(event.category);
  const categoryEmoji = getCategoryEmoji(event.category);

  return (
    <div className="card event-card">
      <div className="event-card-image">
        {event.posterImage ? (
          <img src={event.posterImage} alt={event.title} />
        ) : (
          <div className="event-card-poster-placeholder" style={{ background: getDefaultPoster(event.category) }}>
            {categoryEmoji}
          </div>
        )}
        <div className="event-card-badge" style={{ background: categoryColor }}>
          {event.category}
        </div>
        <div className="event-card-actions-overlay">
          {onBookmark && (
            <button
              className={`event-card-action-btn ${isBookmarked ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onBookmark(event._id); }}
              title="Bookmark"
            >
              <FiBookmark />
            </button>
          )}
          {onInterested && (
            <button
              className={`event-card-action-btn ${isInterested ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onInterested(event._id); }}
              title="Interested"
            >
              <FiHeart />
            </button>
          )}
        </div>
      </div>
      <Link to={`/events/${event._id}`}>
        <div className="event-card-body">
          <div className="event-card-club">
            {event.club?.name || 'Campus Event'}
          </div>
          <h3 className="event-card-title">{event.title}</h3>
          <div className="event-card-meta">
            <div className="event-card-meta-item">
              <FiCalendar size={14} />
              <span>{formatDate(event.date)} · {event.time}</span>
            </div>
            <div className="event-card-meta-item">
              <FiMapPin size={14} />
              <span>{event.location}</span>
            </div>
          </div>
          {event.tags && event.tags.length > 0 && (
            <div className="event-card-tags">
              {event.tags.slice(0, 3).map((tag, i) => (
                <span className="tag" key={i}>{tag}</span>
              ))}
              {event.tags.length > 3 && (
                <span className="tag">+{event.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <div className="event-card-footer">
          <div className="attendee-count">
            <FiUsers size={14} />
            <span className="count">{event.attendees || event.registeredUsers?.length || 0}</span>
            <span>attending</span>
          </div>
          <span className="tag" style={{ background: categoryColor + '20', color: categoryColor, border: 'none' }}>
            {event.maxParticipants - (event.attendees || 0)} spots left
          </span>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;
