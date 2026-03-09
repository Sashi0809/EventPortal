import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../utils/api';
import { formatDate, getCategoryColor } from '../utils/helpers';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayEvents, setDayEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        setEvents(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
    setDayEvents(filtered);
  }, [selectedDate, events]);

  const getEventDates = () => {
    return events.map(e => new Date(e.date).toDateString());
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const eventDates = getEventDates();
      const hasEvent = eventDates.includes(date.toDateString());
      if (hasEvent) {
        return <div className="calendar-event-dot"></div>;
      }
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">📆 Event Calendar</h2>
          <p className="section-subtitle">View events by date</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          {loading ? <div className="spinner"></div> : (
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
            />
          )}
        </div>

        <div>
          <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1rem' }}>
            Events on {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          {dayEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dayEvents.map(event => (
                <Link to={`/events/${event._id}`} key={event._id}>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '4px', height: '50px', borderRadius: '2px',
                        background: getCategoryColor(event.category)
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: getCategoryColor(event.category), fontWeight: 600, textTransform: 'uppercase' }}>
                          {event.club?.name} · {event.time}
                        </div>
                        <div style={{ fontWeight: 700, fontFamily: 'Space Grotesk', margin: '0.2rem 0' }}>{event.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {event.location}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{event.attendees || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>attending</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-sm">
              <div className="empty-state-icon">📭</div>
              <h3>No events on this date</h3>
              <p>Select a date with a dot indicator to see events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
