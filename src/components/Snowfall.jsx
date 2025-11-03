import React, { useEffect } from 'react';

export default function Snowfall() {
  useEffect(() => {
    const createSnowflake = () => {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.innerHTML = '❄';
      snowflake.style.left = Math.random() * 100 + '%';
      snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
      snowflake.style.opacity = Math.random();
      document.body.appendChild(snowflake);

      setTimeout(() => {
        snowflake.remove();
      }, 5000);
    };

    // 초기 눈송이 생성
    for (let i = 0; i < 30; i++) {
      setTimeout(() => createSnowflake(), i * 200);
    }

    // 지속적으로 눈송이 생성
    const interval = setInterval(() => {
      createSnowflake();
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return null;
}


