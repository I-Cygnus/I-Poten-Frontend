import React from 'react';
import eventImg from '../../assets/event1.png';

const EventPage1 = () => {
  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: '#fff',
      padding: '0',
      margin: '0',
      minHeight: '100vh'
    }}>
      <img 
        src={eventImg} 
        alt="Open Beta Event" 
        style={{ 
          width: '100%', 
          height: 'auto', 
          display: 'block',
          border: 'none',
          outline: 'none'
        }} 
      />
    </div>
  );
};

export default EventPage1;
