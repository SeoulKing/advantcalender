import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCalendar, saveMessage } from '../lib/firestore';
import AdSenseController from '../components/AdSenseController';

export default function Guest() {
  const { calendarId } = useParams();
  const navigate = useNavigate();
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadCalendar();
  }, [calendarId]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      setCalendarLoading(true);
      const data = await getCalendar(calendarId);
      
      if (!data) {
        alert('캘린더를 찾을 수 없습니다.');
        navigate('/');
      } else {
        setCalendar(data);
      }
    } catch (err) {
      alert('캘린더를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
      setCalendarLoading(false);
    }
  };

  // 12월 달력 날짜 생성 (2025년 12월 1일 ~ 31일)
  const generateDecemberDates = () => {
    const dates = [];
    const year = 2025;
    const month = 11; // JavaScript에서 월은 0부터 시작
    
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
    
    // 12월 1일~25일: 언제든지 메시지 작성 가능
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    return day >= 1 && day <= 25;
  };

  const handleDateSelect = (date) => {
    // 서비스 범위 밖 날짜는 클릭 불가
    if (isDateLockedOutsideService(date)) {
      alert('🚫 이 날짜는 서비스 범위 밖 날짜입니다.\n\n12월 1일부터 25일까지만 메시지를 작성할 수 있습니다.');
      return;
    }
    
    if (!isDateUnlocked(date)) {
      alert('🔒 아직 이 날짜의 메시지를 작성할 수 없습니다!');
      return;
    }
    setSelectedDate(date);
    // 날짜 선택 시 제출 완료 상태 해제
    if (submitted) {
      setSubmitted(false);
    }
    // 날짜 선택 시 제출 섹션으로 스크롤
    setTimeout(() => {
      const element = document.getElementById('message-section');
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 50; // 상단 여백 50px
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !message.trim()) {
      alert('날짜와 메시지를 모두 입력해주세요.');
      return;
    }

    // 서비스 범위 밖 날짜 확인
    if (isDateLockedOutsideService(selectedDate)) {
      alert('🚫 이 날짜는 서비스 범위 밖 날짜입니다.\n\n12월 1일부터 25일까지만 메시지를 작성할 수 있습니다.');
      return;
    }

    // 날짜 잠금 확인
    if (!isDateUnlocked(selectedDate)) {
      alert('🔒 이 날짜는 메시지를 작성할 수 없습니다!');
      return;
    }

    // 12월이 아닌 날짜 선택 방지
    const dateObj = new Date(selectedDate);
    if (dateObj.getMonth() !== 11 || dateObj.getFullYear() !== 2025) {
      alert('2025년 12월 날짜만 선택할 수 있습니다.');
      return;
    }

    setSaving(true);
    try {
      await saveMessage(calendarId, selectedDate, message.trim());
      alert('✅ 메시지가 저장되었습니다! 감사합니다! 💝');
      
      // textarea blur 처리 (키보드가 올라오지 않도록)
      document.getElementById('message-textarea')?.blur();
      
      // 폼 초기화
      setMessage('');
      setSelectedDate('');
      setShowDateSelector(false);
      setSubmitted(true); // 제출 완료 상태 설정
      
      // 캘린더 새로고침
      await loadCalendar();
      
      // "나도 캘린더 만들기" 섹션으로 스크롤 (중앙 정렬)
      setTimeout(() => {
        const element = document.getElementById('create-calendar-section');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 300);
    } catch (error) {
      alert('메시지 저장에 실패했습니다.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // 크리스마스까지 남은 일수 계산
  const [daysUntilChristmas, setDaysUntilChristmas] = useState(0);
  
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

  const dates = generateDecemberDates();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date().toISOString().split('T')[0];

  if (loading || calendarLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!calendar) {
    return null;
  }

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* 헤더 섹션 */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 6vw, 40px)' }}>
        {calendar?.calendarName && (
          <div style={{
            fontSize: 'clamp(20px, 6vw, 28px)',
            color: '#c8102e',
            fontWeight: 'bold',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            {calendar.calendarName}
          </div>
        )}
        <div style={{ fontSize: 'clamp(40px, 15vw, 64px)', marginBottom: '16px' }}>💌</div>
        <h1 style={{ 
          margin: 0,
          fontSize: 'clamp(24px, 8vw, 36px)',
          background: 'linear-gradient(135deg, #c8102e, #0d7d4e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          marginBottom: '12px'
        }}>
          메시지 남기기
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: 'clamp(14px, 3vw, 16px)',
          lineHeight: '1.6',
          margin: 0
        }}>
          따뜻한 메시지를 남겨주세요! 💝<br />
          메시지를 작성하고 날짜를 선택하면 <br/>
          상대가 그 날짜에 메시지를 확인할 수 있습니다.
        </p>
      </div>

      {/* 1단계: 메시지 입력 섹션 (항상 보임) */}
      <div className="christmas-card fade-in" style={{ 
        marginBottom: '32px', 
        padding: '32px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: 'bold',
            fontSize: 'clamp(18px, 4vw, 22px)',
            color: '#333'
          }}>
            ✍️ 메시지 작성
          </label>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginTop: '-8px',
            marginBottom: '16px',
            lineHeight: '1.6'
          }}>
            먼저 전하고 싶은 메시지를 작성해주세요. 메시지를 작성하면 날짜를 선택할 수 있습니다.
          </p>
                      <textarea
            id="message-textarea"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // 메시지 입력 시작 시 제출 완료 상태 해제
              if (submitted) {
                setSubmitted(false);
              }
              // 메시지가 완전히 삭제되면 날짜 선택 섹션도 숨김
              if (!e.target.value.trim()) {
                setShowDateSelector(false);
                setSelectedDate('');
              }
            }}
            placeholder="여기에 따뜻한 메시지를 작성해주세요.&#10;&#10;예: 크리스마스 즐거운 하루 보내세요! 🎄"
            style={{ 
              width: '100%', 
              minHeight: '200px',
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
            autoFocus={!submitted}
          />
          <div style={{ 
            marginTop: '8px',
            fontSize: '13px',
            color: '#666',
            marginBottom: '16px'
          }}>
            {message.length}자
          </div>
          {!showDateSelector && (
            <button
              type="button"
              onClick={() => {
                if (!message.trim()) {
                  alert('먼저 메시지를 작성해주세요.');
                  document.getElementById('message-textarea')?.focus();
                  return;
                }
                setShowDateSelector(true);
                setTimeout(() => {
                  const element = document.getElementById('date-selector-section');
                  if (element) {
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - 50; // 상단 여백 50px
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }, 100);
              }}
              className="christmas-button"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '8px',
                opacity: message.trim() ? 1 : 0.6
              }}
            >
              📅 날짜 선택하기
            </button>
          )}
        </div>
      </div>

      {/* 2단계: 날짜 선택 섹션 (날짜 선택하기 버튼 클릭 시 표시) */}
      {showDateSelector && (
        <div id="date-selector-section" className="christmas-card calendar-card fade-in" style={{ marginBottom: '32px', padding: '16px' }}>
        <div style={{
          marginBottom: '12px',
          fontSize: '14px',
          color: '#666',
          fontWeight: '500'
        }}>
          12월
        </div>
        <h2 style={{
          marginTop: 0,
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          📅 날짜 선택
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '20px',
          lineHeight: '1.6'
        }}>
          메시지를 보낼 날짜를 선택해주세요.
        </p>
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
              emptyDays.push(<div key={`empty-${i}`} />);
            }
            return emptyDays;
          })()}

          {/* 달력 날짜들 */}
          {dates.map((date) => {
            const dateObj = new Date(date);
            const day = dateObj.getDate();
            const messageCount = getMessageCount(date);
            const isSelected = selectedDate === date;
            const isLockedOutside = isDateLockedOutsideService(date);
            const isToday = today === date;
            const isChristmas = day === 25;
            const unlocked = isDateUnlocked(date);
            
            return (
              <button
                key={date}
                type="button"
                className="calendar-date-button"
                onClick={() => handleDateSelect(date)}
                disabled={!unlocked}
                style={{
                  aspectRatio: '1',
                  minHeight: '45px',
                  border: isSelected 
                    ? '2px solid #c8102e' 
                    : isChristmas
                      ? '2px solid #ffb600'
                      : (isToday && !isLockedOutside)
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
                  cursor: unlocked ? 'pointer' : 'not-allowed',
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
                  transform: isChristmas ? 'scale(1.03)' : 'scale(1)',
                  opacity: unlocked ? 1 : 0.5
                }}
              >
                {isChristmas && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '11px'
                  }}>
                    🎄
                  </div>
                )}
                {isToday && !isSelected && !isChristmas && !isLockedOutside && (
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
                      : (isToday && !isLockedOutside)
                        ? '#ffb600' 
                        : '#333',
                  fontWeight: isChristmas ? 'bold' : 'bold',
                  lineHeight: '1',
                  marginTop: isChristmas ? '8px' : '0'
                }}>
                  {day}
                </div>
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
      )}

      {/* 3단계: 날짜 선택 후 제출 섹션 */}
      {message.trim() && selectedDate && (
        <div id="message-section" className="christmas-card fade-in" style={{ 
          padding: '32px', 
          overflow: 'hidden', 
          boxSizing: 'border-box', 
          width: '100%',
          marginBottom: '32px'
        }}>
          <div style={{ 
            marginBottom: '24px',
            padding: '20px',
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
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
              <button
                type='submit'
                disabled={saving || !selectedDate || message.trim().length === 0}
                className="christmas-button"
                style={{ 
                  width: '100%',
                  padding: '18px', 
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                {saving ? '⏳ 저장 중...' : '💝 메시지 남기기'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 내 캘린더 만들기 박스 (제출 완료 후에만 표시) */}
      {submitted && !message.trim() && !selectedDate && (
        <>
          <div 
            id="create-calendar-section"
            className="christmas-card"
            style={{
              marginTop: '32px',
              padding: 'clamp(32px, 8vw, 48px) clamp(24px, 6vw, 40px)',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #fff5f5, #fff)',
              border: '3px solid #c8102e',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderWidth = '4px';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(200, 16, 46, 0.15), 0 8px 24px rgba(200, 16, 46, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderWidth = '3px';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 'clamp(48px, 12vw, 64px)', marginBottom: '16px' }}>✨</div>
            <h2 style={{
              margin: 0,
              fontSize: 'clamp(20px, 5vw, 28px)',
              background: 'linear-gradient(135deg, #c8102e, #0d7d4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}>
              나도 캘린더 만들기
            </h2>
            <p style={{
              color: '#666',
              fontSize: 'clamp(14px, 3vw, 16px)',
              margin: 0,
              marginBottom: '24px'
            }}>
              나만의 어드벤트 캘린더를 만들어보세요! 💝
            </p>
            <button
              onClick={() => navigate('/?scroll=true')}
              className="christmas-button"
              style={{
                padding: 'clamp(14px, 3vw, 18px) clamp(32px, 8vw, 48px)',
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontWeight: 'bold',
                minWidth: 'clamp(200px, 50vw, 280px)',
                cursor: 'pointer'
              }}
            >
              만들러 가기 →
            </button>
          </div>

          {/* 크리스마스 카운트다운 */}
          <div className="christmas-card" style={{
            marginTop: '32px',
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
        </>
      )}

      <AdSenseController position="bottom" />
    </div>
  );
}

