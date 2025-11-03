import React, { useEffect } from 'react';

const PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXX';

export default function AdSense({ 
  adSlot = '1234567890',  // 기본 광고 슬롯 ID
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {}
}) {
  useEffect(() => {
    try {
      ((window.adsbygoogle = window.adsbygoogle || [])).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100px', 
      margin: '20px 0',
      textAlign: 'center',
      ...style 
    }}>
      <ins
        className='adsbygoogle'
        style={{
          display: 'block',
          width: '100%'
        }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
}


