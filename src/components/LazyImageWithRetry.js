// LazyImageWithRetry.js
import React, { useState, useEffect } from 'react';

const gateways = [
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  // Add more gateways as needed
];

const LazyImageWithRetry = ({ src, alt, retryCount = 3, retryInterval = 2000 }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);

  const updateSrcWithNextGateway = () => {
    const nextIndex = (currentGatewayIndex + 1) % gateways.length;
    setCurrentGatewayIndex(nextIndex);
    return src.replace('https://ipfs.io/ipfs/', gateways[nextIndex]);
  };

  useEffect(() => {
    const image = new Image();
    let imageSrc = attempts === 0 ? src : updateSrcWithNextGateway();
    image.src = imageSrc;
    image.onload = () => {
      setLoaded(true);
      setError(false);
    };
    image.onerror = () => {
      if (attempts < retryCount) {
        setTimeout(() => {
          setAttempts(attempts + 1);
          setError(true);
          setLoaded(false);
        }, retryInterval * attempts);
      }
    };
  }, [src, attempts, retryCount, retryInterval, currentGatewayIndex]);

  if (error && attempts >= retryCount) {
    return <div>Error loading image</div>;
  }

  return (
    <img
      src={attempts === 0 ? src : src.replace('https://ipfs.io/ipfs/', gateways[currentGatewayIndex])}
      alt={alt}
      style={{ display: loaded ? 'block' : 'none' }}
    />
  );
};

export default LazyImageWithRetry;
