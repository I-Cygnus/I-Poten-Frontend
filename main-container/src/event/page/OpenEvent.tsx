import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventImg from '../../assets/event.png';

interface OpenEventProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpenEvent: React.FC<OpenEventProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    const timer = setTimeout(() => setIsVisible(false), 300);
    document.body.style.overflow = '';
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleClose = () => {
    if (dontShow) {
      localStorage.setItem('openEventHideUntil', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    }
    onClose();
  };

  const handleEventClick = (path: string) => {
    handleClose();
    navigate(path);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <>
      <style>{`
        .oe-wrap {
          position: relative;
          width: min(100vw, 100vh);
        }
        .oe-modal {
          position: relative;
          width: 100%;
          border-radius: clamp(12px, 1.8vmin, 22px);
          overflow: hidden;
          font-size: 0;
          line-height: 0;
          background: transparent;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.12),
            0 32px 80px rgba(0,0,0,0.28);
        }
        .oe-img {
          width: 100%;
          height: auto;
          display: block;
          vertical-align: top;
          cursor: pointer;
        }
        .oe-close {
          position: absolute;
          top: 2%;
          right: 2%;
          width: clamp(28px, 4vmin, 40px);
          height: clamp(28px, 4vmin, 40px);
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.55);
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: rgba(255,255,255,0.9);
          font-size: clamp(11px, 1.6vmin, 16px);
          cursor: pointer;
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
          letter-spacing: 0;
        }
        .oe-close:hover {
          background: rgba(0,0,0,0.55);
          border-color: rgba(255,255,255,0.8);
          transform: rotate(90deg);
        }
        .oe-overlay-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: clamp(12px, 2.5vmin, 22px) clamp(14px, 3vmin, 26px);
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%);
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .oe-overlay-bar label {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1vmin, 10px);
          color: rgba(255,255,255,0.75);
          font-size: clamp(11px, 1.5vmin, 14px);
          font-weight: 500;
          letter-spacing: 0.3px;
          cursor: pointer;
          user-select: none;
          transition: color 0.2s;
        }
        .oe-overlay-bar label:hover {
          color: rgba(255,255,255,1);
        }
        .oe-overlay-bar input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: clamp(13px, 1.8vmin, 17px);
          height: clamp(13px, 1.8vmin, 17px);
          border: 1.5px solid rgba(255,255,255,0.5);
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          transition: border-color 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .oe-overlay-bar input[type="checkbox"]:checked {
          background: white;
          border-color: white;
        }
        .oe-overlay-bar input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          top: 1.5px;
          left: 4px;
          width: 4px;
          height: 7px;
          border: 2px solid #111;
          border-top: none;
          border-left: none;
          transform: rotate(45deg);
        }
        .oe-hotspot {
          position: absolute;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.18s ease;
        }
        .oe-hotspot:hover {
          background: rgba(255,255,255,0.12);
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.35s ease',
          padding: '20px',
        }}
        onClick={handleBackdropClick}
      >
        <div className="oe-wrap">
          <div
            className="oe-modal"
            style={{
              transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
              transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
              opacity: isOpen ? 1 : 0,
            }}
          >
            <button className="oe-close" onClick={handleClose}>✕</button>

            <div style={{ position: 'relative', fontSize: 0, lineHeight: 0 }}>
              <img
                src={eventImg}
                className="oe-img"
                alt="Event"
              />
              {/* 회원가입 이벤트 박스 — top/left/width/height를 이미지에 맞게 조정 */}
              <div
                className="oe-hotspot"
                style={{ top: '60%', left: '5%', width: '40%', height: '20%' }}
                onClick={() => handleEventClick('/event/1')}
              />
              {/* 솔직리뷰 이벤트 박스 — top/left/width/height를 이미지에 맞게 조정 */}
              <div
                className="oe-hotspot"
                style={{ top: '60%', left: '55%', width: '40%', height: '20%' }}
                onClick={() => handleEventClick('/event/2')}
              />
            </div>

            <div className="oe-overlay-bar">
              <label>
                <input
                  type="checkbox"
                  checked={dontShow}
                  onChange={e => setDontShow(e.target.checked)}
                />
                7일 동안 열지 않기
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OpenEvent;
