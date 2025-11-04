import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCalendar } from '../lib/firestore';
import { generateCalendarLink, generateGuestLink } from '../lib/localStorage';
import AdSenseController from '../components/AdSenseController';

export default function Calendar() {
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [daysUntilChristmas, setDaysUntilChristmas] = useState(0);

  useEffect(() => {
    loadCalendar();
  }, [calendarId]);

  // 페이지 로드 시 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 크리스마스까지 남은 일수 계산
  useEffect(() => {
    const calculateDaysUntilChristmas = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const christmas = new Date(2025, 11, 25); // 2025년 12월 25일
      christmas.setHours(0, 0, 0, 0);
      const diffTime = christmas - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilChristmas(Math.max(0, diffDays));
    };
    
    calculateDaysUntilChristmas();
    // 매일 자정에 업데이트
    const interval = setInterval(calculateDaysUntilChristmas, 1000 * 60 * 60); // 1시간마다 체크
    return () => clearInterval(interval);
  }, []);

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
    // 서비스 범위 밖 날짜: 11월 30일, 12월 26일~30일
    const lockedDates = [
      '2025-11-30',  // 11월 30일
      '2025-12-26',  // 12월 26일
      '2025-12-27',  // 12월 27일
      '2025-12-28',  // 12월 28일
      '2025-12-29',  // 12월 29일
      '2025-12-30',  // 12월 30일
    ];
    
    if (lockedDates.includes(date)) {
      return false; // 서비스 범위 밖 날짜는 항상 잠금
    }
    
    // 12월 1일~25일: 해당 날짜가 되면 열림
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date + 'T00:00:00');
    return targetDate <= today;
  };

  const isDateLockedOutsideService = (date) => {
    // 서비스 범위 밖 날짜: 11월 30일, 12월 26일~30일
    const lockedDates = [
      '2025-11-30',  // 11월 30일
      '2025-12-26',  // 12월 26일
      '2025-12-27',  // 12월 27일
      '2025-12-28',  // 12월 28일
      '2025-12-29',  // 12월 29일
      '2025-12-30',  // 12월 30일
    ];
    return lockedDates.includes(date);
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
    // 서비스 범위 밖 날짜는 클릭 불가
    if (isDateLockedOutsideService(date)) {
      return;
    }
    // 잠긴 날짜든 열린 날짜든 클릭 가능
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

  const calculateCompletionRate = () => {
    if (!calendar) return { percentage: 0, filledDates: 0, totalDates: 25, emptyDates: 25 };
    
    // 12월 1일부터 25일까지의 날짜
    const targetDates = [];
    for (let day = 1; day <= 25; day++) {
      targetDates.push(`2025-12-${day.toString().padStart(2, '0')}`);
    }
    
    // 메시지가 있는 날짜 수 계산 (열렸든 안 열렸든 상관없이)
    let filledDates = 0;
    targetDates.forEach(date => {
      if (getMessageCount(date) > 0) {
        filledDates++;
      }
    });
    
    // 총 날짜는 항상 25일 (12월 1일~25일)
    const totalDates = 25;
    const emptyDates = totalDates - filledDates;
    const percentage = Math.round((filledDates / totalDates) * 100);
    
    return { percentage, filledDates, totalDates, emptyDates };
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

      {/* 크리스마스 카운트다운 */}
      <div className="christmas-card" style={{
        marginBottom: '24px',
        padding: 'clamp(20px, 5vw, 28px)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fff5f5, #fff9f0)',
        border: '2px solid #c8102e',
        borderRadius: '16px'
      }}>
        <div style={{
          fontSize: 'clamp(32px, 8vw, 48px)',
          marginBottom: '12px'
        }}>
          🎄
        </div>
        <div style={{
          fontSize: 'clamp(14px, 3vw, 16px)',
          color: '#666',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          크리스마스까지
        </div>
        <div style={{
          fontSize: 'clamp(36px, 10vw, 56px)',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #c8102e, #0d7d4e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '4px',
          lineHeight: '1.2'
        }}>
          {daysUntilChristmas}일
        </div>
        <div style={{
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          color: '#999'
        }}>
          {daysUntilChristmas === 0 ? '🎉 오늘은 크리스마스입니다! 🎉' : '남았습니다!'}
        </div>
      </div>

      <div className="christmas-card calendar-card" style={{ marginTop: '32px', padding: '16px' }}>
        <div style={{
          marginBottom: '12px',
          fontSize: '14px',
          color: '#666',
          fontWeight: '500'
        }}>
          12월
        </div>
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
            const isLockedOutside = isDateLockedOutsideService(date);
            const isFutureDate = !unlocked && !isLockedOutside; // 12월 1일~25일 중 아직 안 온 날짜
            const isSelected = selectedDate === date;
            const today = new Date().toISOString().split('T')[0] === date;
            const isChristmas = day === 25;
            
            return (
              <button
                key={date}
                onClick={() => handleDateClick(date)}
                disabled={isLockedOutside}
                className={`calendar-date calendar-date-button ${unlocked ? 'unlocked' : 'locked'} ${messageCount > 0 ? 'has-message' : ''}`}
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
                      ? unlocked
                        ? 'linear-gradient(135deg, #fff5e6, #ffe4cc)'
                        : 'linear-gradient(135deg, #f5f5f5, #e8e8e8)'
                      : unlocked 
                        ? (messageCount > 0 
                          ? 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' 
                          : '#ffffff') 
                        : '#f5f5f5',
                  cursor: isLockedOutside ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  opacity: unlocked ? 1 : 0.6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isSelected
                    ? '0 0 0 2px rgba(200, 16, 46, 0.2)'
                    : isChristmas 
                      ? '0 0 0 2px rgba(255, 182, 0, 0.3), 0 2px 6px rgba(255, 182, 0, 0.2)' 
                      : today 
                        ? '0 0 0 1px rgba(255, 182, 0, 0.3)' 
                        : 'none',
                  transform: isSelected 
                    ? 'scale(1.05)' 
                    : isChristmas && unlocked 
                      ? 'scale(1.03)' 
                      : 'scale(1)'
                }}
              >
                {isFutureDate && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    fontSize: '12px'
                  }}>
                    🔒
                  </div>
                )}
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
                      right: isFutureDate ? '14px' : '1px',
                      fontSize: '10px'
                    }}>
                      ⭐
                    </div>
                  </>
                )}
                {today && !isChristmas && !isFutureDate && (
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
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜의 메시지들 표시 */}
      {selectedDate && (() => {
        const isUnlocked = isDateUnlocked(selectedDate);
        const isLockedOutside = isDateLockedOutsideService(selectedDate);
        const isFutureDate = !isUnlocked && !isLockedOutside;
        
        return (
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
            
            {isFutureDate ? (
              // 잠긴 날짜 안내
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'linear-gradient(135deg, #fff9f0, #fff5f5)',
                borderRadius: '12px',
                border: '2px solid #ffb600'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
                <p style={{ 
                  color: '#333', 
                  fontSize: '20px', 
                  marginBottom: '12px', 
                  fontWeight: 'bold' 
                }}>
                  아직 이 날짜가 오지 않았어요!
                </p>
                <p style={{ 
                  color: '#666', 
                  fontSize: '16px',
                  marginBottom: '8px',
                  lineHeight: '1.6'
                }}>
                  {new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}이 되면
                  <br />
                  이 날짜의 메시지를 확인할 수 있습니다! ✨
                </p>
                <p style={{ 
                  color: '#999', 
                  fontSize: '14px',
                  marginTop: '16px'
                }}>
                  💝 가족과 친구들에게 게스트 링크를 공유해서<br />
                  미리 메시지를 받아보세요!
                </p>
              </div>
            ) : isUnlocked && getMessagesForDate(selectedDate).length === 0 ? (
              // 열렸지만 메시지 없음
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
            ) : isUnlocked ? (
              // 열렸고 메시지 있음
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
            ) : null}
          </div>
        );
      })()}

      {/* 메시지 쓰기 버튼 - 캘린더 아래 */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button
          onClick={() => navigate(`/guest/${calendarId}`)}
          className="christmas-button"
          style={{
            padding: '14px 32px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          ✉️ 내게 메시지 쓰기
        </button>
      </div>

      {/* 캘린더 완성도 표시 */}
      {calendar && (() => {
        const { percentage, filledDates, totalDates, emptyDates } = calculateCompletionRate();
        return (
          <div className="christmas-card" style={{
            marginTop: '24px',
            marginBottom: '24px',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{
                fontSize: 'clamp(14px, 3vw, 16px)',
                fontWeight: 'bold',
                color: '#333'
              }}>
                📊 캘린더 완성도
              </div>
              <div style={{
                fontSize: 'clamp(20px, 5vw, 28px)',
                fontWeight: 'bold',
                background: percentage === 100 
                  ? 'linear-gradient(135deg, #0d7d4e, #4caf50)' 
                  : 'linear-gradient(135deg, #c8102e, #d32f2f)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {percentage}%
              </div>
            </div>
            
            {/* 프로그레스 바 - 크리스마스 캔디 스트라이프 */}
            <div style={{
              width: '100%',
              height: '28px',
              background: '#f0f0f0',
              borderRadius: '14px',
              overflow: 'hidden',
              marginBottom: '12px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              position: 'relative'
            }}>
              <div style={{
                width: `${percentage}%`,
                height: '100%',
                background: percentage === 100
                  ? 'repeating-linear-gradient(45deg, #0d7d4e 0px, #0d7d4e 10px, #4caf50 10px, #4caf50 20px)'
                  : 'repeating-linear-gradient(45deg, #c8102e 0px, #c8102e 10px, #ffffff 10px, #ffffff 20px)',
                transition: 'width 0.5s ease',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontSize: '11px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                position: 'relative'
              }}>
                {percentage > 10 && (
                  <span>
                    {filledDates}/{totalDates}
                  </span>
                )}
              </div>
            </div>
            
            {/* 동기부여 메시지 */}
            {emptyDates > 0 ? (
              <div style={{
                fontSize: 'clamp(13px, 3vw, 15px)',
                color: '#666',
                textAlign: 'center',
                padding: '8px',
                background: 'linear-gradient(135deg, #ffeef5, #fff)',
                borderRadius: '8px'
              }}>
                💝 아직 <strong style={{ color: '#c8102e' }}>{emptyDates}개의 날짜</strong>에 메시지가 없어요! 
                <br />
                <span style={{ fontSize: '12px', color: '#999' }}>
                  가족과 친구들에게 게스트 링크를 공유해서 메시지를 받아보세요! ✉️
                </span>
              </div>
            ) : (
              <div style={{
                fontSize: 'clamp(13px, 3vw, 15px)',
                color: '#0d7d4e',
                textAlign: 'center',
                padding: '8px',
                background: 'linear-gradient(135deg, #e8f5e9, #fff)',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}>
                🎉 축하합니다! 모든 날짜(25일)에 메시지가 있습니다! 🎉
              </div>
            )}
          </div>
        );
      })()}

      {/* 링크 공유 섹션 */}
      <div className="christmas-card fade-in" style={{
        marginTop: '32px',
        padding: '24px'
      }}>
        <h3 style={{
          margin: 0,
          marginBottom: '24px',
          fontSize: 'clamp(18px, 4vw, 22px)',
          fontWeight: 'bold',
          color: '#333'
        }}>
          📤 내 캘린더 공유하기
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#c8102e', 
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            💌 게스트 링크 (이 링크를 공유하세요!)
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '8px'
          }}>
            가족과 친구들에게 이 링크를 공유하면 메시지를 작성할 수 있습니다.
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <input
              type='text'
              value={generateGuestLink(calendarId)}
              readOnly
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '13px',
                border: '2px solid #c8102e',
                borderRadius: '8px',
                background: '#fff',
                fontWeight: '500'
              }}
            />
            <button
              onClick={() => handleCopyLink(generateGuestLink(calendarId))}
              style={{
                padding: '12px 20px',
                background: '#c8102e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              복사
            </button>
          </div>

          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginBottom: '10px',
            fontWeight: '500'
          }}>
            🔒 내 캘린더 링크 (메시지 확인용)
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '8px'
          }}>
            내가 받은 메시지를 확인할 수 있는 링크입니다.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type='text'
              value={generateCalendarLink(calendarId)}
              readOnly
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '13px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                background: '#f9f9f9'
              }}
            />
            <button
              onClick={() => handleCopyLink(generateCalendarLink(calendarId))}
              style={{
                padding: '12px 20px',
                background: '#757575',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              복사
            </button>
          </div>
        </div>
      </div>

      <AdSenseController position="bottom" />
    </div>
  );
}
