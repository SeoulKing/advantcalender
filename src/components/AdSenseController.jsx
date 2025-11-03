import React from 'react';
import AdSense from './AdSense';
import AdSenseMock from './AdSenseMock';

/**
 * 환경 변수에 따라 실제 AdSense 또는 Mock을 표시하는 통합 컴포넌트
 * VITE_ADSENSE_ENABLED=true로 설정하면 실제 광고 표시
 */
export default function AdSenseController({ 
  adSlot,
  position = 'middle',
  style = {}
}) {
  const useRealAdSense = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;

  // AdSense가 활성화되어 있고 Publisher ID가 설정되어 있으면 실제 광고 표시
  if (useRealAdSense && publisherId) {
    return <AdSense adSlot={adSlot} style={style} />;
  }

  // 그 외에는 Mock 표시
  return <AdSenseMock position={position} style={style} />;
}

