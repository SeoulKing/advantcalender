import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveMessage, getCalendar } from '../lib/firestore';
import AdSenseController from '../components/AdSenseController';

export default function Write() {
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(true);

  useEffect(() => {
    loadCalendar();
  }, [calendarId]);

  const loadCalendar = async () => {
    try {
      const data = await getCalendar(calendarId);
      if (data) {
        setCalendar(data);
      }
    } catch (err) {
      console.error('캘린더 로드 실패:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  // 12월 달력 날짜 생성 (2025년 12월 1일 ~ 31일)
  const generateDecemberDates = () => {
    const dates = [];
    const year = 2025;
    const month = 11;
    
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const getMessageCount = (date) => {
    if (!calendar?.messages?.[date]) {
      return 0;
    }
    const messages = calendar.messages[date];
    return Array.isArray(messages) ? messages.length : 0;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // 날짜 선택 시 스크롤
    setTimeout(() => {
      document.getElementById('message-section')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !message.trim()) {
      alert('날짜와 메시지를 모두 입력해주세요.');
      return;
    }

    // 12월이 아닌 날짜 선택 방지
    const dateObj = new Date(selectedDate);
    if (dateObj.getMonth() !== 11 || dateObj.getFullYear() !== 2025) {
      alert('2025년 12월 날짜만 선택할 수 있습니다.');
      return;
    }

    setLoading(true);
    try {
      await saveMessage(calendarId, selectedDate, message.trim());
      alert('✅ 메시지가 저장되었습니다!');
      // 캘린더 새로고침 후 캘린더 페이지로 이동
      await loadCalendar();
      navigate(`/calendar/${calendarId}`);
    } catch (error) {
      alert('메시지 저장에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (calendarLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#666' }}>로딩 중...</p>
      </div>
    );
  }

  const dates = generateDecemberDates();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* 헤더 섹션 */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 6vw, 40px)' }}>
        <div style={{ fontSize: 'clamp(40px, 15vw, 64px)', marginBottom: '16px' }}>✉️</div>
        <h1 style={{ 
          margin: 0,
          fontSize: 'clamp(24px, 8vw, 36px)',
          background: 'linear-gradient(135deg, #c8102e, #0d7d4e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          marginBottom: '12px'
        }}>
          메시지 작성하기
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: 'clamp(14px, 3vw, 16px)',
          lineHeight: '1.6'
        }}>
          먼저 날짜를 선택하고, 따뜻한 메시지를 작성해주세요! 💝
        </p>
      </div>

      {/* 달력 섹션 */}
      <div className="christmas-card calendar-card" style={{ marginBottom: '32px', padding: '16px' }}>
        <h2 style={{
          marginTop: 0,
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          📅 날짜 선택 (12월)
        </h2>
        <div className="calendar-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px'
        }}>
          {/* 요일 헤더 */}
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="weekday-header"
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                padding: '8px 4px',
                background: 'linear-gradient(135deg, #c8102e, #d32f2f)',
                color: 'white',
                borderRadius: '6px',
                fontSize: '11px'
              }}
            >
              {day}
            </div>
          ))}

          {/* 첫 주 빈 칸 */}
          {(() => {
            const firstDate = new Date(dates[0]);
            const firstDayOfWeek = firstDate.getDay();
            const emptyDays = [];
            for (let i = 0; i < firstDayOfWeek; i++) {
              emptyDays.push(
                <div 
                  key={`empty-${i}`} 
                  style={{ aspectRatio: '1' }}
                />
              );
            }
            return emptyDays;
          })()}

          {/* 달력 날짜들 */}
          {dates.map((date) => {
            const dateObj = new Date(date);
            const day = dateObj.getDate();
            const messageCount = getMessageCount(date);
            const isSelected = selectedDate === date;
            const today = new Date().toISOString().split('T')[0] === date;
            const isChristmas = day === 25; // 크리스마스 특별 처리
            
            return (
              <button
                key={date}
                type="button"
                className="calendar-date-button"
                onClick={() => handleDateSelect(date)}
                style={{
                  aspectRatio: '1',
                  minHeight: '45px',
                  border: isSelected 
                    ? '2px solid #c8102e' 
                    : isChristmas
                      ? '2px solid #ffb600'
                      : today 
                        ? '2px solid #ffb600'
                        : '1.5px solid #e0e0e0',
                  borderRadius: '8px',
                  background: isSelected
                    ? 'linear-gradient(135deg, #ffeef5, #fff)'
                    : isChristmas
                      ? 'linear-gradient(135deg, #fff5e6, #ffe4cc)'
                      : messageCount > 0
                        ? 'linear-gradient(135deg, #e8f5e9, #c8e6c9)'
                        : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isSelected 
                    ? '0 0 0 2px rgba(200, 16, 46, 0.2)' 
                    : isChristmas
                      ? '0 0 0 2px rgba(255, 182, 0, 0.3), 0 2px 6px rgba(255, 182, 0, 0.2)'
                      : 'none',
                  transform: isChristmas ? 'scale(1.03)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.transform = isChristmas ? 'scale(1.1)' : 'scale(1.05)';
                    e.target.style.boxShadow = isChristmas
                      ? '0 0 0 3px rgba(255, 182, 0, 0.4), 0 6px 16px rgba(255, 182, 0, 0.3)'
                      : '0 4px 12px rgba(200, 16, 46, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.transform = isChristmas ? 'scale(1.05)' : 'scale(1)';
                    e.target.style.boxShadow = isSelected 
                      ? '0 0 0 3px rgba(200, 16, 46, 0.2)' 
                      : isChristmas
                        ? '0 0 0 3px rgba(255, 182, 0, 0.3), 0 4px 12px rgba(255, 182, 0, 0.2)'
                        : 'none';
                  }
                }}
              >
                {isChristmas && (
                  <>
                    <div style={{
                      position: 'absolute',
                      top: '1px',
                      left: '1px',
                      fontSize: '11px'
                    }}>
                      🎄
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '1px',
                      right: '1px',
                      fontSize: '10px'
                    }}>
                      ⭐
                    </div>
                  </>
                )}
                {today && !isSelected && !isChristmas && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    fontSize: '9px'
                  }}>
                    ✨
                  </div>
                )}
                <div style={{ 
                  fontSize: isChristmas ? '16px' : '14px',
                  color: isSelected 
                    ? '#c8102e' 
                    : isChristmas
                      ? '#ffb600'
                      : today 
                        ? '#ffb600' 
                        : '#333',
                  fontWeight: isChristmas ? 'bold' : 'bold',
                  lineHeight: '1'
                }}>
                  {day}
                </div>
                {isChristmas && (
                  <div style={{
                    fontSize: '8px',
                    marginTop: '1px',
                    color: '#ffb600',
                    fontWeight: 'bold'
                  }}>
                    🎁
                  </div>
                )}
                {messageCount > 0 && !isChristmas && (
                  <div style={{
                    fontSize: '9px',
                    marginTop: '3px',
                    color: '#0d7d4e',
                    fontWeight: 'bold',
                    background: 'white',
                    padding: '1px 4px',
                    borderRadius: '8px',
                    border: '1px solid #0d7d4e',
                    lineHeight: '1.2'
                  }}>
                    {messageCount}개
                  </div>
                )}
                {messageCount > 0 && isChristmas && (
                  <div style={{
                    fontSize: '8px',
                    marginTop: '2px',
                    color: '#c8102e',
                    fontWeight: 'bold',
                    background: 'white',
                    padding: '1px 4px',
                    borderRadius: '8px',
                    border: '1px solid #c8102e',
                    lineHeight: '1.2'
                  }}>
                    {messageCount}개
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 메시지 작성 섹션 */}
      <div id="message-section" className="christmas-card" style={{ padding: '32px', overflow: 'hidden', boxSizing: 'border-box', width: '100%' }}>
        {selectedDate ? (
          <>
            <div style={{ 
              marginBottom: '24px',
              padding: '16px',
              background: 'linear-gradient(135deg, #ffeef5, #fff)',
              borderRadius: '12px',
              border: '2px solid #c8102e'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#666', 
                marginBottom: '8px' 
              }}>
                선택한 날짜
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#c8102e'
              }}>
                {new Date(selectedDate).toLocaleDateString('ko-KR', { 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                style={{
                  marginTop: '12px',
                  padding: '6px 12px',
                  background: '#757575',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                날짜 다시 선택
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '12px', 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#333'
                }}>
                  ✍️ 메시지 작성
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="여기에 따뜻한 메시지를 작성해주세요...&#10;&#10;예: 크리스마스 즐거운 하루 보내세요! 🎄"
                  style={{ 
                    width: '100%', 
                    minHeight: '250px',
                    maxWidth: '100%',
                    padding: '18px', 
                    borderRadius: '12px', 
                    border: '2px solid #e0e0e0',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    overflow: 'auto',
                    transition: 'all 0.3s ease',
                    lineHeight: '1.8'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c8102e';
                    e.target.style.boxShadow = '0 0 0 3px rgba(200, 16, 46, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <div style={{ 
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  {message.length}자
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                <button
                  type="button"
                  onClick={() => navigate(`/calendar/${calendarId}`)}
                  className="christmas-button christmas-button-green"
                  style={{ 
                    padding: '16px 24px', 
                    fontSize: '16px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📋 캘린더 보기
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className="christmas-button"
                  style={{ 
                    flex: 1,
                    padding: '16px', 
                    fontSize: '18px',
                    fontWeight: 'bold',
                    minWidth: 0
                  }}
                >
                  {loading ? '⏳ 저장 중...' : '💝 메시지 저장하기'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>👆</div>
            <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 'bold' }}>
              날짜를 선택해주세요
            </p>
            <p style={{ fontSize: '14px', color: '#999' }}>
              위의 달력에서 메시지를 작성할 날짜를 선택해주세요
            </p>
          </div>
        )}
      </div>

      <AdSenseController position="bottom" />
    </div>
  );
}
