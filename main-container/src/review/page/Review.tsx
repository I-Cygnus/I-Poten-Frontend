import React, { useState, useEffect } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const Review: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(false);

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

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('별점을 선택해주세요');
      return;
    }
    if (comment.trim().length < 10) {
      alert('10자 이상 작성해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setTimeout(() => {
        setRating(0);
        setComment('');
        onClose();
      }, 500);
    } catch (error) {
      console.error('리뷰 제출 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentRating = hoveredRating || rating;

  // --- Styles ---
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    opacity: isOpen ? 1 : 0,
    transition: 'opacity 0.3s ease',
    padding: '20px',
  };

  const modalContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '32px 24px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'transparent',
    border: 'none',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#868e96',
    fontSize: '20px',
    transition: 'color 0.2s',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '24px',
    width: '100%',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#212529',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  };

  const subTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#868e96',
    fontWeight: '400',
  };

  const starContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px',
  };

  const starStyle = (index: number): React.CSSProperties => {
    const isActive = index <= currentRating;
    return {
      fontSize: '36px',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      color: isActive ? '#FFD43B' : '#E9ECEF',
      transform: isActive ? 'scale(1.1)' : 'scale(1)',
    };
  };

  const ratingTextStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '20px',
    height: '20px',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100px',
    padding: '14px',
    fontSize: '14px',
    borderRadius: '12px',
    border: '1px solid #DEE2E6',
    backgroundColor: '#F8F9FA',
    resize: 'none',
    outline: 'none',
    transition: 'border-color 0.2s, background-color 0.2s',
    color: '#495057',
    marginBottom: '20px',
    lineHeight: '1.5',
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    background: '#6342E8',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    opacity: isSubmitting ? 0.7 : 1,
  };

  return (
    <>
      <style>
        {`
          .review-textarea:focus {
            border-color: #6342E8 !important;
            background-color: #fff !important;
          }
          .close-btn:hover {
            color: #212529 !important;
          }
          .submit-btn:hover:not(:disabled) {
            background-color: #5334D6 !important;
            transform: translateY(-1px);
          }
          .submit-btn:active:not(:disabled) {
            transform: translateY(1px);
          }
        `}
      </style>

      <div style={overlayStyle} onClick={handleBackdropClick}>
        <div style={modalContainerStyle}>
          <button style={closeButtonStyle} onClick={onClose} className="close-btn">✕</button>

          <div style={headerStyle}>
            <h2 style={titleStyle}>서비스는 어떠셨나요?</h2>
            <p style={subTitleStyle}>더 좋은 서비스를 위해 의견을 들려주세요</p>
          </div>

          <div style={starContainerStyle}>
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                style={starStyle(star)}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                ★
              </div>
            ))}
          </div>

          <div style={ratingTextStyle}>
            {currentRating === 0 ? '' : 
             currentRating === 5 ? '최고예요! 🥰' :
             currentRating >= 4 ? '좋아요! 😄' :
             currentRating >= 3 ? '보통이에요 🙂' : '아쉬워요 😢'}
          </div>

          <textarea
            style={textareaStyle}
            className="review-textarea"
            placeholder="솔직한 리뷰를 남겨주세요 (10자 이상)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={300}
          />

          <button 
            style={submitButtonStyle} 
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '제출 중...' : '리뷰 등록하기'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Review;
