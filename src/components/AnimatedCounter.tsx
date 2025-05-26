import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const AnimatedCounter = ({ 
  value, 
  prefix = '', 
  suffix = '', 
  decimals = 2,
  className = ''
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const startValue = displayValue;
      const endValue = value;
      const duration = 500; // 500ms
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Используем easeOutQuad для более естественной анимации
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentValue = startValue + (endValue - startValue) * easeProgress;

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value]);

  const formatValue = (val: number) => {
    if (decimals === 0) {
      return val.toLocaleString();
    }
    return val.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  return (
    <span className={`${className} ${isAnimating ? 'animate-value-change' : ''}`}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
};

export default AnimatedCounter; 