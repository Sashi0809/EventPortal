export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (time) => time;

export const getTimeUntil = (date) => {
  const now = new Date();
  const eventDate = new Date(date);
  const diff = eventDate - now;
  if (diff <= 0) return { expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, expired: false };
};

export const getCategoryColor = (category) => {
  const colors = {
    technical: '#6366f1',
    cultural: '#ec4899',
    sports: '#10b981',
    workshop: '#f59e0b',
    seminar: '#8b5cf6',
    hackathon: '#ef4444',
    fest: '#f97316',
    other: '#6b7280',
    literary: '#14b8a6',
    social: '#3b82f6'
  };
  return colors[category] || colors.other;
};

export const getCategoryEmoji = (category) => {
  const emojis = {
    technical: '💻',
    cultural: '🎭',
    sports: '🏆',
    workshop: '🔧',
    seminar: '🎤',
    hackathon: '🚀',
    fest: '🎉',
    other: '📌',
    literary: '📚',
    social: '🤝'
  };
  return emojis[category] || '📌';
};

export const getDefaultPoster = (category) => {
  const gradients = {
    technical: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cultural: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    sports: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    workshop: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    seminar: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    hackathon: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    fest: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    other: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
  };
  return gradients[category] || gradients.other;
};
