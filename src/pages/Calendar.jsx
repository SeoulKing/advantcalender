import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCalendar } from '../lib/firestore';
import { generateCalendarLink, generateGuestLink } from '../lib/localStorage';
import AdSenseMock from '../components/AdSenseMock';

export default function Calendar() {
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadCalendar();
  }, [calendarId]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const data = await getCalendar(calendarId);
      
      if (!data) {
        setError('캘린더를 찾을 수 없습니다.');
      } else {
        setCalendar(data);
      }
    } catch (err) {
      setError('캘린더를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isDateUnlocked = (date) => {
    // 테스트 모드: 모든 날짜 열기 (나중에 실제 날짜로 변경)
    const TEST_MODE = true; // 테스트용 - true: 모든 날짜 열림, false: 실제 날짜 기준
    
    if (TEST_MODE) {
      return true; // 테스트 모드에서는 모든 날짜 열기
    }
    
    // 실제 운영 모드: 날짜에 맞게 열기
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date + 'T00:00:00');
    return targetDate <= today;
  };

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

  const handleDateClick = (date) => {
    if (!isDateUnlocked(date)) {
      alert('🔒 아직 이 날짜의 메시지를 열 수 없습니다!');
      return;
    }
    setSelectedDate(date);
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('✅ 링크가 복사되었습니다!');
  };

  const getMessageCount = (date) => {
    if (!calendar?.messages?.[date]) {
      return 0;
    }
    const messages = calendar.messages[date];
    return Array.isArray(messages) ? messages.length : 0;
  };

  const getMessagesForDate = (date) => {
    if (!calendar?.messages?.[date]) {
      return [];
    }
    const messages = calendar.messages[date];
    return Array.isArray(messages) ? messages : [];
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#666' }}>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <p style={{ color: '#c8102e', fontSize: '18px' }}>{error}</p>
      </div>
    );
  }

  if (!calendar) {
    return null;
  }

  const dates = generateDecemberDates();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="fade-in">
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '32px'
      }}>
        <h1 style={{ 
          margin: 0,
          fontSize: 'clamp(28px, 5vw, 42px)',
          background: 'linear-gradient(135deg, #c8102e, #0d7d4e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          내 캘린더 - 메시지 확인 📬
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: 'clamp(14px, 3vw, 16px)',
          margin: 0
        }}>
          날짜를 클릭하면 받은 메시지를 확인할 수 있습니다! 💝
        </p>
      </div>

      <div className="christmas-card calendar-card" style={{ marginTop: '32px', padding: '16px' }}>
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
            const unlocked = isDateUnlocked(date);
            const today = new Date().toISOString().split('T')[0] === date;
            const isChristmas = day === 25; // 크리스마스 특별 처리
            
            return (
              <button
                key={date}
                onClick={() => handleDateClick(date)}
                disabled={!unlocked}
                className={`calendar-date calendar-date-button ${unlocked ? 'unlocked' : 'locked'} ${messageCount > 0 ? 'has-message' : ''}`}
                style={{
                  aspectRatio: '1',
                  minHeight: '45px',
                  border: isChristmas 
                    ? '2px solid #ffb600' 
                    : today 
                      ? '2px solid #ffb600' 
                      : '1.5px solid #e0e0e0',
                  borderRadius: '8px',
                  background: isChristmas
                    ? unlocked
                      ? 'linear-gradient(135deg, #fff5e6, #ffe4cc)'
                      : 'linear-gradient(135deg, #f5f5f5, #e8e8e8)'
                    : unlocked 
                      ? (messageCount > 0 
                        ? 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' 
                        : '#ffffff') 
                      : '#f5f5f5',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  opacity: unlocked ? 1 : 0.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isChristmas 
                    ? '0 0 0 2px rgba(255, 182, 0, 0.3), 0 2px 6px rgba(255, 182, 0, 0.2)' 
                    : today 
                      ? '0 0 0 1px rgba(255, 182, 0, 0.3)' 
                      : 'none',
                  transform: isChristmas && unlocked ? 'scale(1.03)' : 'scale(1)'
                }}
              >
                {isChristmas && (
                  <>
                    <div style={{
                      position: 'absolute',
                      top: '1px',
                      left: '1px',
                      fontSize: '11px',
                      animation: 'none'
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
                {today && !isChristmas && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    fontSize: '10px'
                  }}>
                    ✨
                  </div>
                )}
                <div style={{ 
                  fontSize: isChristmas ? '16px' : '14px',
                  color: isChristmas 
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
                    fontSize: unlocked ? '9px' : '8px',
                    marginTop: unlocked ? '3px' : '2px',
                    color: unlocked ? '#0d7d4e' : '#666',
                    fontWeight: 'bold',
                    background: unlocked ? 'white' : '#e8e8e8',
                    padding: '1px 4px',
                    borderRadius: '8px',
                    border: unlocked ? '1px solid #0d7d4e' : '1px solid #999',
                    opacity: unlocked ? 1 : 0.7,
                    lineHeight: '1.2'
                  }}>
                    {messageCount}개
                  </div>
                )}
                {messageCount > 0 && isChristmas && (
                  <div style={{
                    fontSize: unlocked ? '8px' : '7px',
                    marginTop: unlocked ? '2px' : '1px',
                    color: unlocked ? '#c8102e' : '#666',
                    fontWeight: 'bold',
                    background: unlocked ? 'white' : '#e8e8e8',
                    padding: '1px 4px',
                    borderRadius: '8px',
                    border: unlocked ? '1px solid #c8102e' : '1px solid #999',
                    opacity: unlocked ? 1 : 0.7,
                    lineHeight: '1.2'
                  }}>
                    {messageCount}개
                  </div>
                )}
                {!unlocked && messageCount === 0 && (
                  <div style={{
                    fontSize: '12px',
                    marginTop: '4px',
                    opacity: 0.5
                  }}>
                    🔒
                  </div>
                )}
                {!unlocked && messageCount > 0 && (
                  <div style={{
                    fontSize: '10px',
                    marginTop: '2px',
                    opacity: 0.6
                  }}>
                    🔒
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜의 메시지들 표시 */}
      {selectedDate && (
        <div className="christmas-card fade-in" style={{
          marginTop: '32px',
          padding: '28px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              margin: 0,
              fontSize: '24px',
              background: 'linear-gradient(135deg, #c8102e, #0d7d4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              📅 {new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}의 메시지
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: '#757575',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✕ 닫기
            </button>
          </div>
          
          {getMessagesForDate(selectedDate).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#fff9f0',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ color: '#666', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                이 날짜에는 아직 메시지가 없습니다.
              </p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                가족과 친구들에게 게스트 링크를 공유해보세요! 💌
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                background: '#e8f5e9',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#0d7d4e',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                💝 {getMessagesForDate(selectedDate).length}개의 메시지가 있습니다
              </div>
              
              {getMessagesForDate(selectedDate).map((msg, idx) => (
                <div
                  key={idx}
                  className="message-box fade-in"
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                    background: '#ffffff',
                    border: '2px solid #e8f5e9',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px'
                  }}>
                    <div style={{
                      fontSize: '28px',
                      flexShrink: 0
                    }}>
                      💌
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.8',
                        fontSize: '16px',
                        margin: 0,
                        color: '#333',
                        fontWeight: '400'
                      }}>
                        {msg.text || msg}
                      </p>
                      {msg.createdAt && (
                        <div style={{
                          fontSize: '12px',
                          color: '#999',
                          marginTop: '16px',
                          paddingTop: '12px',
                          borderTop: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>📆</span>
                          <span>{new Date(msg.createdAt).toLocaleString('ko-KR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 메시지 쓰기 버튼 - 캘린더 아래 */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button
          onClick={() => navigate(`/write/${calendarId}`)}
          className="christmas-button"
          style={{
            padding: '14px 32px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          ✉️ 메시지 쓰기
        </button>
      </div>

      {/* 링크 복사 섹션 */}
      <div className="christmas-card fade-in" style={{
        marginTop: '32px',
        padding: '24px'
      }}>
        <h3 style={{
          margin: 0,
          marginBottom: '20px',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          📋 캘린더 링크
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            fontSize: '13px', 
            color: '#666', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            🔒 내 캘린더 링크 (메시지 확인용)
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type='text'
              value={generateCalendarLink(calendarId)}
              readOnly
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '13px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                background: '#f9f9f9'
              }}
            />
            <button
              onClick={() => handleCopyLink(generateCalendarLink(calendarId))}
              style={{
                padding: '10px 16px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              복사
            </button>
          </div>

          <div style={{ 
            fontSize: '13px', 
            color: '#666', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            💌 게스트 링크 (메시지 작성용 - 공유)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type='text'
              value={generateGuestLink(calendarId)}
              readOnly
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '13px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                background: '#f9f9f9'
              }}
            />
            <button
              onClick={() => handleCopyLink(generateGuestLink(calendarId))}
              style={{
                padding: '10px 16px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              복사
            </button>
          </div>
        </div>
      </div>

      <AdSenseMock position="bottom" />
    </div>
  );
}
