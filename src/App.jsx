import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Snowfall from './components/Snowfall';

export default function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Snowfall />
      <nav className="christmas-header" style={{ 
        padding: '20px', 
        marginBottom: '0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link 
            to='/' 
            style={{ 
              textDecoration: 'none', 
              color: 'white',
              fontSize: 'clamp(16px, 4vw, 24px)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(6px, 2vw, 12px)'
            }}
          >
            <span>디지털 어드벤트 캘린더</span>
          </Link>
        </div>
      </nav>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(12px, 3vw, 24px)', 
        position: 'relative', 
        zIndex: 1 
      }}>
        <Outlet />
      </div>
    </div>
  );
}
