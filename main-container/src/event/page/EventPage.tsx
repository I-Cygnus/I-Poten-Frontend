import React from 'react';

const EventPage: React.FC = () => {
  return (
    <>
      <style>{`
        .ep-root { font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif; width: 100%; overflow-x: hidden; }

        /* ── Section 1 ── */
        .ep-s1 {
          background: linear-gradient(160deg, #f9c5d1 0%, #d4b8f0 35%, #b8d4f0 65%, #a8e6f0 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 20px 80px;
          position: relative;
          overflow: hidden;
        }
        .ep-topbar {
          width: 100%;
          max-width: 900px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 0 0;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #555;
        }
        .ep-subtitle {
          margin-top: 32px;
          font-size: 16px;
          color: #666;
          font-weight: 500;
          text-align: center;
        }
        .ep-title {
          margin: 14px 0 0;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 900;
          text-align: center;
          color: #1a1a1a;
          line-height: 1.2;
        }
        .ep-hero-area {
          position: relative;
          width: 100%;
          max-width: 700px;
          height: 420px;
          margin-top: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Phone mockup */
        .ep-phone {
          width: 160px;
          height: 320px;
          background: white;
          border-radius: 28px;
          border: 6px solid #2a2a2a;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          position: relative;
          overflow: hidden;
          z-index: 5;
          flex-shrink: 0;
        }
        .ep-phone-notch {
          width: 50px;
          height: 10px;
          background: #2a2a2a;
          border-radius: 0 0 10px 10px;
          margin: 0 auto;
        }
        .ep-phone-screen {
          background: linear-gradient(160deg, #e8d8ff, #d0e8ff);
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 12px 10px;
          gap: 8px;
        }
        .ep-phone-bar {
          background: rgba(255,255,255,0.7);
          border-radius: 6px;
          height: 12px;
          width: 100%;
        }
        .ep-phone-img-placeholder {
          background: linear-gradient(135deg, #c5a8f0, #a8c5f0);
          border-radius: 10px;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
        }
        .ep-phone-bottom {
          display: flex;
          gap: 6px;
        }
        .ep-phone-btn {
          flex: 1;
          background: linear-gradient(135deg, #9b6cf5, #7b9cf5);
          border-radius: 6px;
          height: 20px;
        }
        /* Floating review bubbles */
        .ep-bubble {
          position: absolute;
          background: white;
          border-radius: 14px;
          padding: 10px 14px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          max-width: 180px;
          z-index: 10;
        }
        .ep-bubble-label {
          font-size: 9px;
          font-weight: 800;
          color: #9b6cf5;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .ep-bubble-text {
          font-size: 12px;
          color: #333;
          font-weight: 500;
          line-height: 1.4;
        }
        .ep-b1 { top: 40px; left: 0; transform: rotate(-3deg); }
        .ep-b2 { top: 160px; left: 20px; transform: rotate(2deg); }
        .ep-b3 { top: 50px; right: 10px; transform: rotate(3deg); }
        .ep-b4 { bottom: 60px; right: 20px; transform: rotate(-2deg); }
        /* Floating emojis */
        .ep-emoji { position: absolute; font-size: 28px; z-index: 3; }
        .ep-e1 { top: 10px; left: 200px; }
        .ep-e2 { top: 80px; right: 0; }
        .ep-e3 { bottom: 80px; left: 60px; }
        .ep-e4 { bottom: 20px; right: 60px; }
        /* Arrows */
        .ep-arrow {
          position: absolute;
          font-size: 40px;
          color: #9b6cf5;
          opacity: 0.7;
          z-index: 3;
        }
        .ep-a1 { top: 130px; left: 170px; transform: rotate(30deg); }
        .ep-a2 { top: 80px; right: 140px; transform: rotate(-20deg) scaleX(-1); }

        /* ── Section 2 ── */
        .ep-s2 {
          background: #111118;
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ep-s2-inner {
          width: 100%;
          max-width: 900px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 32px;
          margin-bottom: 64px;
        }
        .ep-s2-left {}
        .ep-s2-heading {
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 900;
          color: white;
          line-height: 1.2;
          margin: 0;
        }
        .ep-s2-accent {
          background: linear-gradient(90deg, #f472b6, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ep-s2-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .ep-s2-brand {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.1em;
        }
        .ep-smiley {
          width: 80px;
          height: 80px;
          background: #FFE600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          box-shadow: 0 0 40px rgba(255,230,0,0.3);
        }
        .ep-s2-tiers {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .ep-tier {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .ep-tier-num {
          font-size: 12px;
          font-weight: 800;
          background: linear-gradient(90deg, #f472b6, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.05em;
        }
        .ep-tier-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        .ep-tier-label {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          text-align: center;
          line-height: 1.5;
        }
        .ep-tier-point {
          font-size: 20px;
          font-weight: 900;
          color: white;
        }

        /* ── Section 3 ── */
        .ep-s3 {
          background: #e8e0f7;
          padding: 0 20px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ep-s3-topbar {
          width: 100%;
          max-width: 900px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 0 0;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #777;
        }
        .ep-s3-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 900;
          color: #1a1a1a;
          margin: 40px 0 32px;
          text-align: center;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ep-tips {
          width: 100%;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ep-tip-card {
          background: white;
          border-radius: 16px;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .ep-tip-illust {
          font-size: 56px;
          flex-shrink: 0;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }
        .ep-tip-text {
          font-size: 15px;
          color: #333;
          line-height: 1.7;
        }
        .ep-tip-highlight {
          font-weight: 900;
          color: #1a1a1a;
        }

        @media (max-width: 600px) {
          .ep-hero-area { height: 380px; }
          .ep-b1 { left: -10px; top: 20px; max-width: 140px; }
          .ep-b2 { display: none; }
          .ep-b3 { right: -10px; top: 30px; max-width: 140px; }
          .ep-b4 { right: -10px; bottom: 40px; max-width: 140px; }
          .ep-s2-inner { justify-content: center; }
          .ep-tip-card { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="ep-root">

        {/* ── Section 1: Hero ── */}
        <section className="ep-s1">
          <div className="ep-topbar">
            <span>아이포텐</span>
            <span>REVIEW EVENT</span>
          </div>
          <p className="ep-subtitle">AI 면접 경험이 어떠셨나요?</p>
          <h1 className="ep-title">아이포텐이<br />당신의 리뷰를 기다립니다!</h1>

          <div className="ep-hero-area">
            {/* Floating arrows */}
            <div className="ep-arrow ep-a1">↙</div>
            <div className="ep-arrow ep-a2">↙</div>

            {/* Floating emojis */}
            <div className="ep-emoji ep-e1">💗</div>
            <div className="ep-emoji ep-e2">😊</div>
            <div className="ep-emoji ep-e3">😄</div>
            <div className="ep-emoji ep-e4">💗</div>

            {/* Review bubbles */}
            <div className="ep-bubble ep-b1">
              <div className="ep-bubble-label">REVIEW</div>
              <div className="ep-bubble-text">실제 면접보다 더 도움이 됐어요♡</div>
            </div>
            <div className="ep-bubble ep-b2">
              <div className="ep-bubble-label">REVIEW</div>
              <div className="ep-bubble-text">피드백이 너무 정확해요. 합격했습니다!</div>
            </div>
            <div className="ep-bubble ep-b3">
              <div className="ep-bubble-label">REVIEW</div>
              <div className="ep-bubble-text">AI인데 진짜 면접관 같아요!</div>
            </div>
            <div className="ep-bubble ep-b4">
              <div className="ep-bubble-label">REVIEW</div>
              <div className="ep-bubble-text">반복 연습하니까 자신감이 생겼어요 👍</div>
            </div>

            {/* Phone mockup */}
            <div className="ep-phone">
              <div className="ep-phone-notch" />
              <div className="ep-phone-screen">
                <div className="ep-phone-bar" style={{ width: '60%' }} />
                <div className="ep-phone-bar" style={{ width: '40%' }} />
                <div className="ep-phone-img-placeholder">🤖</div>
                <div className="ep-phone-bottom">
                  <div className="ep-phone-btn" />
                  <div className="ep-phone-btn" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Point reward ── */}
        <section className="ep-s2">
          <div className="ep-s2-inner">
            <div className="ep-s2-left">
              <p className="ep-s2-heading">리뷰 작성하고</p>
              <p className="ep-s2-heading"><span className="ep-s2-accent">최대 6,000P</span></p>
              <p className="ep-s2-heading">혜택 받으세요!</p>
            </div>
            <div className="ep-s2-right">
              <div className="ep-s2-brand">아이포텐</div>
              <div className="ep-smiley">😊</div>
            </div>
          </div>

          <div className="ep-s2-tiers">
            <div className="ep-tier">
              <div className="ep-tier-num">#01</div>
              <div className="ep-tier-circle">📝</div>
              <div className="ep-tier-label">텍스트 리뷰 작성 시</div>
              <div className="ep-tier-point">500 P</div>
            </div>
            <div className="ep-tier">
              <div className="ep-tier-num">#02</div>
              <div className="ep-tier-circle">📸</div>
              <div className="ep-tier-label">스크린샷 리뷰 작성 시</div>
              <div className="ep-tier-point">1,000 P</div>
            </div>
            <div className="ep-tier">
              <div className="ep-tier-num">#03</div>
              <div className="ep-tier-circle" style={{ border: '2px solid rgba(255,230,0,0.4)' }}>⭐</div>
              <div className="ep-tier-label">매월 베스트 리뷰 5건</div>
              <div className="ep-tier-point">5,000 P</div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Best Review Tip ── */}
        <section className="ep-s3">
          <div className="ep-s3-topbar">
            <span>아이포텐</span>
            <span>REVIEW EVENT</span>
          </div>
          <h2 className="ep-s3-title">
            BEST REVIEW TIP! <span>💗</span>
          </h2>
          <div className="ep-tips">
            <div className="ep-tip-card">
              <div className="ep-tip-illust">👩‍💼</div>
              <div className="ep-tip-text">
                AI 면접 화면 캡처와 함께<br />
                <span className="ep-tip-highlight">실제 합격 경험담을 올려주세요!</span>
              </div>
            </div>
            <div className="ep-tip-card">
              <div className="ep-tip-illust">📱</div>
              <div className="ep-tip-text">
                질문 난이도, 피드백 품질, 사용감 등<br />
                <span className="ep-tip-highlight">꼼꼼한 리뷰를 적어주세요!</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default EventPage;
