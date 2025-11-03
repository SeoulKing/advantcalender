import React from 'react';

/**
 * Google AdSense 목업 컴포넌트
 * 실제 광고가 설정되기 전까지 표시용으로 사용
 */
export default function AdSenseMock({ 
  position = 'top',
  style = {}
}) {
  return (
    <div 
      style={{
        width: '100%',
        minHeight: '120px',
        background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        margin: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...style
      }}
    >
      <div style={{
        fontSize: '14px',
        color: '#999',
        marginBottom: '8px',
        fontWeight: '500'
      }}>
        📢 Google AdSense
      </div>
      <div style={{
        fontSize: '12px',
        color: '#bbb',
        textAlign: 'center',
        padding: '0 20px'
      }}>
        {position === 'top' && '상단 광고 영역'}
        {position === 'middle' && '중간 광고 영역'}
        {position === 'bottom' && '하단 광고 영역'}
        {!['top', 'middle', 'bottom'].includes(position) && '광고 영역'}
      </div>
      <div style={{
        position: 'absolute',
        top: '4px',
        right: '8px',
        fontSize: '10px',
        color: '#ddd',
        fontStyle: 'italic'
      }}>
        Mock
      </div>
    </div>
  );
}


