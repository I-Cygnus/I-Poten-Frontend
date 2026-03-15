import React from 'react';
import surveyImg from '../../assets/survey_event_v0.png';

const EventPage2: React.FC = () => {
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: '#292740', // 요청하신 색상으로 고정
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        width: '90%', 
        maxWidth: '1100px', 
        border: 'none',
        outline: 'none',
        background: 'transparent'
      }}>
        <img 
          src={surveyImg} 
          alt="Survey Event" 
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            border: 'none',
            outline: 'none',
            margin: '0',
            padding: '0'
          }} 
        />
      </div>
    </div>
  );
};

export default EventPage2;
