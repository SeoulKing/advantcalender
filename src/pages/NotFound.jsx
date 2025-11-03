import React from 'react';
import { Link } from 'react-router-dom';
import AdSenseController from '../components/AdSenseController';

export default function NotFound() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#4CAF50' }}>404</h1>
      <h2 style={{ marginTop: '16px' }}>페이지를 찾을 수 없습니다</h2>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link 
        to='/' 
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#4CAF50',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '16px'
        }}
      >
        홈으로 돌아가기
      </Link>

      <AdSenseController position="bottom" />
    </div>
  );
}
