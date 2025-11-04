import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createCalendar, getCalendar, findCalendarByName, checkCalendarNameExists } from '../lib/firestore';
import { saveCalendarLink, getCalendarLinks, generateCalendarLink, generateGuestLink } from '../lib/localStorage';
import { isFirebaseAvailable } from '../lib/mockStorage';
import AdSenseController from '../components/AdSenseController';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [myCalendars, setMyCalendars] = useState([]);
  const [calendarDataMap, setCalendarDataMap] = useState({});
  const [isMockMode, setIsMockMode] = useState(!isFirebaseAvailable());
  
  // 캘린더 생성 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [calendarName, setCalendarName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 캘린더 찾기 상태
  const [showFindModal, setShowFindModal] = useState(false);
  const [findName, setFindName] = useState('');
  const [findPassword, setFindPassword] = useState('');
  const [finding, setFinding] = useState(false);
  const [daysUntilChristmas, setDaysUntilChristmas] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadMyCalendars();
    setIsMockMode(!isFirebaseAvailable());
  }, []);

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // 초기 설정
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // URL 파라미터로 스크롤 처리
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('scroll') === 'true') {
      setTimeout(() => {
        const element = document.getElementById('create-calendar');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // URL에서 파라미터 제거
          window.history.replaceState({}, '', '/');
        }
      }, 100);
    }
  }, [location.search]);

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

  useEffect(() => {
    // 각 캘린더의 실제 데이터와 메시지 개수 로드
    if (myCalendars.length > 0) {
      loadCalendarData();
    }
  }, [myCalendars]);

  // 페이지 포커스 시 메시지 개수 새로고침
  useEffect(() => {
    const handleFocus = () => {
      if (myCalendars.length > 0) {
        loadCalendarData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [myCalendars]);

  const loadMyCalendars = () => {
    const calendars = getCalendarLinks();
    // 최신순으로 정렬 (updatedAt 우선, 없으면 createdAt 사용)
    const sortedCalendars = [...calendars].sort((a, b) => {
      const aDate = a.updatedAt || a.createdAt || '';
      const bDate = b.updatedAt || b.createdAt || '';
      return new Date(bDate) - new Date(aDate); // 최신 것이 먼저
    });
    setMyCalendars(sortedCalendars);
  };

  const loadCalendarData = async () => {
    const calendars = getCalendarLinks();
    const dataMap = {};
    
    // 모든 캘린더 데이터를 병렬로 로드
    await Promise.all(
      calendars.map(async (cal) => {
        try {
          const calendarData = await getCalendar(cal.id);
          if (calendarData) {
            // 총 메시지 개수 계산
            const totalMessages = calculateTotalMessages(calendarData.messages);
            dataMap[cal.id] = {
              ...calendarData,
              totalMessages
            };
          }
        } catch (error) {
          console.error(`캘린더 ${cal.id} 로드 실패:`, error);
          dataMap[cal.id] = { totalMessages: 0 };
        }
      })
    );
    
    setCalendarDataMap(dataMap);
  };

  // 메시지 총 개수 계산 함수
  const calculateTotalMessages = (messages) => {
    if (!messages || typeof messages !== 'object') {
      return 0;
    }
    
    let total = 0;
    Object.values(messages).forEach((dateMessages) => {
      if (Array.isArray(dateMessages)) {
        total += dateMessages.length;
      } else if (dateMessages) {
        // 예전 형식 (단일 메시지) 호환성
        total += 1;
      }
    });
    
    return total;
  };

  const handleCreateClick = () => {
    // 이미 캘린더가 있는지 확인
    if (myCalendars.length > 0) {
      const existingCalendar = myCalendars[0];
      const confirmCreate = window.confirm(
        `이미 캘린더가 존재합니다.\n\n기존 캘린더: ${existingCalendar.title || `캘린더 ${existingCalendar.id.slice(0, 8)}`}\n\n정말로 새 캘린더를 만들겠습니까?\n\n(한 사람당 하나의 캘린더만 가질 수 있습니다.)`
      );
      
      if (!confirmCreate) {
        return;
      }
      
      // 기존 캘린더 제거
      const links = getCalendarLinks();
      const filteredLinks = links.filter(link => link.id !== existingCalendar.id);
      localStorage.setItem('advent_calendar_links', JSON.stringify(filteredLinks));
      loadMyCalendars();
    }
    
    setShowCreateModal(true);
  };

  const handleCreateCalendar = async () => {
    // 유효성 검사
    if (!calendarName.trim()) {
      alert('캘린더 이름을 입력해주세요.');
      return;
    }
    
    if (!password || password.length < 4) {
      alert('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    setLoading(true);
    try {
      // 이름 중복 체크
      console.log('[Home] 1. 캘린더 이름 중복 체크 시작:', calendarName.trim());
      const nameExists = await checkCalendarNameExists(calendarName.trim());
      console.log('[Home] 2. 캘린더 이름 중복 체크 결과:', nameExists);
      
      if (nameExists) {
        alert('❌ 이미 사용 중인 캘린더 이름입니다.\n\n다른 이름을 사용해주세요.');
        setLoading(false);
        return;
      }
      
      console.log('[Home] 3. 캘린더 생성 함수 호출 시도:', { name: calendarName.trim(), password });
      const calendarId = await createCalendar(calendarName.trim(), password);
      console.log('[Home] 4. 캘린더 생성 완료, ID:', calendarId);
      saveCalendarLink(calendarId, calendarName.trim());
      
      console.log('✅ 캘린더 생성 완료:', calendarId);
      alert('🎉 캘린더가 생성되었습니다!\n\n이름과 비밀번호를 잊어버리지 마세요!');
      
      // 폼 초기화
      setCalendarName('');
      setPassword('');
      setConfirmPassword('');
      setShowCreateModal(false);
      
      loadMyCalendars();
      navigate(`/calendar/${calendarId}`);
    } catch (error) {
      console.error('[Home] 5. 캘린더 생성 과정에서 심각한 에러 발생:', error);
      alert(`❌ 캘린더 생성에 실패했습니다.\n\n자세한 내용은 브라우저 콘솔을 확인해주세요.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFindCalendar = async () => {
    const trimmedName = findName.trim();
    
    if (!trimmedName || !findPassword) {
      alert('이름과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    if (findPassword.length < 4) {
      alert('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    
    setFinding(true);
    try {
      console.log('🔍 캘린더 찾기 시도:', { 
        name: trimmedName, 
        passwordLength: findPassword.length 
      });
      
      const calendar = await findCalendarByName(trimmedName, findPassword);
      
      if (calendar && calendar.id) {
        // 캘린더 찾기 성공 - 캘린더 이름 우선순위: calendar.calendarName > trimmedName
        const calendarTitle = calendar.calendarName || trimmedName;
        console.log('✅ 캘린더 찾기 성공:', {
          id: calendar.id,
          calendarName: calendar.calendarName,
          trimmedName: trimmedName,
          finalTitle: calendarTitle
        });
        
        // localStorage에 저장 (이름 업데이트 포함)
        saveCalendarLink(calendar.id, calendarTitle);
        
        // 즉시 홈 화면 업데이트를 위해 캘린더 목록 다시 로드
        loadMyCalendars();
        
        alert('✅ 캘린더를 찾았습니다!');
        
        // 폼 초기화
        setFindName('');
        setFindPassword('');
        setShowFindModal(false);
        
        // 홈에서 확인할 수 있도록 잠시 대기 후 캘린더 페이지로 이동
        setTimeout(() => {
          navigate(`/calendar/${calendar.id}`);
        }, 100);
      } else {
        console.warn('❌ 캘린더를 찾을 수 없음 - 결과:', calendar);
        alert('❌ 캘린더를 찾을 수 없습니다.\n\n확인사항:\n1. 이름이 정확한지 확인해주세요\n2. 비밀번호가 정확한지 확인해주세요\n3. 브라우저 콘솔(F12)에서 자세한 정보를 확인할 수 있습니다.');
      }
    } catch (error) {
      console.error('❌ 캘린더 찾기 에러:', error);
      alert(`❌ 캘린더를 찾는 중 오류가 발생했습니다.\n\n${error.message || '알 수 없는 오류'}\n\n브라우저 콘솔(F12)을 확인해주세요.`);
    } finally {
      setFinding(false);
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('✅ 링크가 복사되었습니다!');
  };

  return (
    <div className="fade-in">
      {/* 목업 모드 알림 */}
      {isMockMode && (
        <div style={{
          background: '#fff3cd',
          border: '2px solid #ffb600',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>📦</div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            목업 모드로 작동 중
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            Firebase 설정이 없어 localStorage로 저장됩니다. 테스트 용도로 사용 가능합니다.
          </div>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'clamp(20px, 5vw, 32px)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: 'clamp(24px, 8vw, 36px)',
            background: 'linear-gradient(135deg, #c8102e, #0d7d4e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            크리스마스를 기다리며
          </h1>
          <p style={{ color: '#666', marginTop: '8px', fontSize: 'clamp(14px, 3vw, 16px)' }}>
            하루하루 메시지를 읽을 수 있게 가족과 친구들에게 메시지를 전달하세요!
            <br />
            메시지는 잠겨있다가 해당 날짜가 되면 볼 수 있게 됩니다.
          </p>
        </div>
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

      {/* 새 캘린더 만들기 섹션 */}
      <div id="create-calendar" className="christmas-card fade-in" style={{
        marginBottom: '32px',
        padding: 'clamp(24px, 8vw, 40px) clamp(16px, 5vw, 24px)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fff5f5, #fff)',
        border: '3px solid #c8102e'
      }}>
        <div style={{ fontSize: 'clamp(32px, 15vw, 48px)', marginBottom: '16px' }}>✨</div>
        <h2 style={{
          margin: 0,
          marginBottom: '12px',
          fontSize: 'clamp(20px, 6vw, 28px)',
          fontWeight: 'bold',
          color: '#c8102e'
        }}>
          새 캘린더 만들기
        </h2>
        <p style={{
          color: '#666',
          fontSize: 'clamp(14px, 3vw, 16px)',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          이름과 비밀번호를 설정하여 나만의 어드벤트 캘린더를 만들어보세요!
        </p>
        <button
          onClick={handleCreateClick}
          disabled={loading}
          className="christmas-button"
          style={{
            padding: 'clamp(12px, 4vw, 18px) clamp(32px, 10vw, 48px)',
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontWeight: 'bold',
            minWidth: 'clamp(160px, 40vw, 200px)'
          }}
        >
          {loading ? '⏳ 생성 중...' : '✨ 새 캘린더 만들기'}
        </button>
      </div>

      {/* 캘린더 찾기 섹션 */}
      <div className="christmas-card fade-in" style={{
        marginBottom: '32px',
        padding: '24px'
      }}>
        <h2 style={{
          margin: 0,
          marginBottom: '16px',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          🔍 내 캘린더 찾기
        </h2>
        <p style={{
          color: '#666',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          링크를 잃어버렸다면 캘린더 이름과 비밀번호로 찾을 수 있습니다.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="캘린더 이름"
            value={findName}
            onChange={(e) => setFindName(e.target.value)}
            style={{
              flex: '1 1 200px',
              minWidth: '100%',
              padding: '12px',
              fontSize: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={findPassword}
            onChange={(e) => setFindPassword(e.target.value)}
            style={{
              flex: '1 1 200px',
              minWidth: '100%',
              padding: '12px',
              fontSize: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={handleFindCalendar}
            disabled={finding}
            className="christmas-button"
            style={{
              flex: '1 1 200px',
              minWidth: '100%',
              padding: '12px 24px',
              fontSize: '16px',
              whiteSpace: 'nowrap'
            }}
          >
            {finding ? '⏳ 찾는 중...' : '🔍 찾기'}
          </button>
        </div>
      </div>

      {myCalendars.length === 0 ? (
        <div className="christmas-card fade-in" style={{
          textAlign: 'center',
          padding: '80px 20px',
          marginTop: '24px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎁</div>
          <h2 style={{ 
            fontSize: '24px', 
            color: '#333', 
            marginBottom: '16px',
            fontWeight: 'bold'
          }}>
            아직 캘린더가 없습니다
          </h2>
          <p style={{ 
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            위의 <span style={{ color: '#c8102e', fontWeight: 'bold' }}>"✨ 새 캘린더 만들기"</span> 버튼을 눌러<br />
            12월 어드벤트 캘린더를 만들어보세요!
          </p>
        </div>
      ) : (
        <div style={{
          maxWidth: '600px',
          margin: '32px auto 0',
          width: '100%'
        }}>
          {myCalendars.slice(0, 1).map((cal) => (
            <div
              key={cal.id}
              className="christmas-card fade-in"
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '32px' }}>📅</div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {cal.title || `캘린더 ${cal.id.slice(0, 8)}`}
                  </h3>
                </div>
                
                {/* 메시지 개수 표시 */}
                <div style={{
                  background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '2px solid #0d7d4e'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#0d7d4e',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>💌</span>
                    <span>
                      {calendarDataMap[cal.id]?.totalMessages ?? '...'}개
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  margin: 0,
                  marginBottom: '16px',
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  📤 내 캘린더 공유하기
                </h4>

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
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexDirection: 'row', alignItems: 'center' }}>
                  <input
                    type='text'
                    value={generateGuestLink(cal.id)}
                    readOnly
                    style={{
                      flex: 1,
                      minWidth: 0,
                      maxWidth: '100%',
                      padding: '12px',
                      fontSize: 'clamp(11px, 3vw, 13px)',
                      border: '2px solid #c8102e',
                      borderRadius: '8px',
                      background: '#fff',
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => handleCopyLink(generateGuestLink(cal.id))}
                    style={{
                      padding: '12px 20px',
                      background: '#c8102e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      boxSizing: 'border-box'
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
                  내가 받은 메시지를 확인할 수 있는 링크입니다. 이 링크를 따로 저장해서 쉽게 메시지를 확인할 수 있습니다.
                </div>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'row', alignItems: 'center' }}>
                  <input
                    type='text'
                    value={generateCalendarLink(cal.id)}
                    readOnly
                    style={{
                      flex: 1,
                      minWidth: 0,
                      maxWidth: '100%',
                      padding: '12px',
                      fontSize: 'clamp(11px, 3vw, 13px)',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      background: '#f9f9f9',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => handleCopyLink(generateCalendarLink(cal.id))}
                    style={{
                      padding: '12px 20px',
                      background: '#757575',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    복사
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate(`/calendar/${cal.id}`)}
                  className="christmas-button christmas-button-green"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '16px'
                  }}
                >
                  🗓️ 캘린더 보기
                </button>
                
                <button
                  onClick={() => navigate(`/guest/${cal.id}`)}
                  className="christmas-button"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '16px'
                  }}
                >
                  ✉️ 메시지 쓰기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdSenseController position="bottom" />

      {/* 캘린더 생성 모달 */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setShowCreateModal(false)}
        >
          <div className="christmas-card" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '32px',
            boxSizing: 'border-box'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              margin: 0,
              marginBottom: '24px',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'center'
            }}>
              ✨ 새 캘린더 만들기
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#333'
              }}>
                캘린더 이름 *
              </label>
              <input
                type="text"
                value={calendarName}
                onChange={(e) => setCalendarName(e.target.value)}
                placeholder="예: 우리 가족 캘린더"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#333'
              }}>
                비밀번호 * (최소 4자)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="링크를 잃어버렸을 때 사용합니다"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#333'
              }}>
                비밀번호 확인 *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCalendarName('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="christmas-button secondary"
                style={{
                  flex: 1,
                  padding: '14px',
                  fontSize: '16px'
                }}
              >
                취소
              </button>
              <button
                onClick={handleCreateCalendar}
                disabled={loading}
                className="christmas-button"
                style={{
                  flex: 1,
                  padding: '14px',
                  fontSize: '16px'
                }}
              >
                {loading ? '⏳ 생성 중...' : '✨ 생성하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
