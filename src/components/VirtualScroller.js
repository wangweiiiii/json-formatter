import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const VirtualScroller = ({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  overscan = 5,
  className,
  style
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(height);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  // 计算可见区域
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEndIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  // 获取可见项
  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex + 1);
  
  // 计算总高度
  const totalHeight = items.length * itemHeight;
  
  // 计算可见项的偏移量
  const offsetY = visibleStartIndex * itemHeight;
  
  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        height: height,
        overflow: 'auto',
        position: 'relative',
        ...style
      }}
      onScroll={handleScroll}
    >
      <Box
        sx={{
          height: `${totalHeight}px`,
          position: 'relative',
          willChange: 'transform',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleStartIndex + index;
            return (
              <Box
                key={actualIndex}
                sx={{
                  height: `${itemHeight}px`,
                  boxSizing: 'border-box',
                }}
              >
                {renderItem(item, actualIndex)}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualScroller; 