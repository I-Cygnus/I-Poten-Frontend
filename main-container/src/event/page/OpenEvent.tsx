import React, { useEffect, useState } from 'react';

interface OpenEventProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpenEvent: React.FC<OpenEventProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleClose = () => {
    if (dontShow) {
      localStorage.setItem('openEventHideUntil', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <>
      <style>{`
        .oe-wrap { position: relative; width: 100%; max-width: 820px; }
        .oe-gift { position: absolute; top: -65px; left: -20px; font-size: 110px; z-index: 10; filter: drop-shadow(0 10px 28px rgba(0,0,0,0.3)); pointer-events: none; line-height: 1; user-select: none; }
        .oe-modal { position: relative; width: 100%; background: linear-gradient(150deg, #7B4DE8 0%, #A040E8 45%, #8B30D8 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 80px rgba(100,40,220,0.55); }
        .oe-dot { position: absolute; background: rgba(255,255,255,0.55); border-radius: 50%; }
        .oe-close { position: absolute; top: 18px; right: 18px; background: #1e0a50; border: none; width: 38px; height: 38px; border-radius: 50%; cursor: pointer; color: white; font-size: 16px; z-index: 20; transition: background 0.2s; display:flex; align-items:center; justify-content:center; }
        .oe-close:hover { background: #2e1470; }
        .oe-header { padding: 36px 48px 28px; text-align: center; position: relative; }
        .oe-small { font-size: 15px; color: rgba(255,255,255,0.9); font-weight: 500; margin: 0 0 10px; }
        .oe-title { font-size: 56px; font-weight: 900; color: #FFE500; text-shadow: 0 3px 0 rgba(0,0,0,0.2); margin: 0; line-height: 1.1; }
        .oe-cards { padding: 0 20px 16px; display: flex; gap: 14px; }
        .oe-left-card { flex: 1; background: white; border-radius: 16px; padding: 24px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .oe-card-title { font-size: 20px; font-weight: 900; color: #1a1a1a; margin: 0 0 8px; }
        .oe-card-sub { font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 8px; }
        .oe-card-free { font-size: 22px; font-weight: 900; color: #3D6FE8; margin: 0 0 8px; }
        .oe-card-icon { font-size: 60px; margin: 6px 0 10px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15)); }
        .oe-card-small { font-size: 11px; color: #999; line-height: 1.5; margin: 0 0 14px; flex: 1; }
        .oe-card-btn { width: 100%; padding: 13px; background: #2d1060; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: auto; transition: background 0.2s; }
        .oe-card-btn:hover { background: #3d1880; }
        .oe-right-card { flex: 1; background: white; border-radius: 16px; padding: 24px 16px; display: flex; flex-direction: column; }
        .oe-right-title { font-size: 20px; font-weight: 900; color: #1a1a1a; text-align: center; margin: 0 0 14px; }
        .oe-cols { display: flex; flex: 1; }
        .oe-col { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 10px; }
        .oe-col:first-child { border-right: 2px dashed #e0e0e0; }
        .oe-col-label { font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px; }
        .oe-col-price { font-size: 26px; font-weight: 900; color: #3D6FE8; line-height: 1.1; margin-bottom: 2px; }
        .oe-col-free-label { font-size: 14px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
        .oe-col-icon { font-size: 48px; margin: 6px 0 8px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.12)); }
        .oe-col-small { font-size: 11px; color: #999; line-height: 1.4; margin-bottom: 12px; flex: 1; }
        .oe-col-btn { width: 100%; padding: 11px 6px; background: #2d1060; color: white; border: none; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .oe-col-btn:hover { background: #3d1880; }
        .oe-footer { padding: 14px 0 18px; display: flex; align-items: center; justify-content: center; }
        .oe-footer label { color: rgba(255,255,255,0.85); font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 7px; }
        .oe-footer input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: #fff; }
        @media (max-width: 600px) {
          .oe-title { font-size: 38px; }
          .oe-cards { flex-direction: column; }
          .oe-gift { font-size: 80px; top: -48px; left: -10px; }
          .oe-header { padding: 28px 20px 20px; }
        }
      `}</style>
      <div
        style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, opacity: isOpen ? 1 : 0, transition:'opacity 0.3s ease', padding:'80px 20px 20px' }}
        onClick={handleBackdropClick}
      >
        <div className="oe-wrap">
          <div className="oe-gift">🎁</div>
          <div
            className="oe-modal"
            style={{ transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <button className="oe-close" onClick={handleClose}>✕</button>
            <div className="oe-dot" style={{ width:10, height:10, top:28, left:'44%' }} />
            <div className="oe-dot" style={{ width:7, height:7, top:55, left:'57%' }} />
            <div className="oe-dot" style={{ width:8, height:8, top:18, right:'28%' }} />
            <div className="oe-dot" style={{ width:5, height:5, top:48, right:'22%' }} />
            <div className="oe-dot" style={{ width:6, height:6, top:38, left:'32%' }} />
            <div className="oe-header">
              <p className="oe-small">가입만 해도 AI 면접 무료 체험!</p>
              <h2 className="oe-title">지금 시작하세요!</h2>
            </div>
            <div className="oe-cards">
              <div className="oe-left-card">
                <div className="oe-card-title">가입만 해도 무료!</div>
                <div className="oe-card-sub">AI 모의면접 5회,<br />합격 예상 질문 무제한</div>
                <div className="oe-card-free">무료제공</div>
                <div className="oe-card-icon">🤖</div>
                <div className="oe-card-small">AI 면접 피드백 리포트 1회 추가제공<br />(마케팅 동의 본인 인증 시)</div>
                <button className="oe-card-btn" onClick={handleClose}>무료 체험하기 &gt;</button>
              </div>
              <div className="oe-right-card">
                <div className="oe-right-title">회원가입 추가 혜택!</div>
                <div className="oe-cols">
                  <div className="oe-col">
                    <div className="oe-col-label">첫 이용 혜택</div>
                    <div className="oe-col-price">무료</div>
                    <div className="oe-col-icon">🎯</div>
                    <div className="oe-col-small">AI 면접<br />3회 추가 제공</div>
                    <button className="oe-col-btn" onClick={handleClose}>첫 이용 혜택 받기 &gt;</button>
                  </div>
                  <div className="oe-col">
                    <div className="oe-col-label">프리미엄 플랜</div>
                    <div className="oe-col-free-label">첫달무료</div>
                    <div className="oe-col-price" style={{ fontSize: '32px' }}>0원</div>
                    <div className="oe-col-icon">�</div>
                    <div className="oe-col-small">AI 피드백<br />월 10회 제공</div>
                    <button className="oe-col-btn" onClick={handleClose}>프리미엄 시작 &gt;</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="oe-footer">
              <label>
                <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} />
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
