import React, { useEffect, useRef } from 'react';
import { Paper, Box, Typography } from '@mui/material';

const JsonEditor = ({ value, onChange, className, darkMode, hideHeader = false }) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      // 在光标位置插入4个空格
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      
      // 移动光标到插入空格后的位置
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  // 确保暗黑模式变化时重新应用样式
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.color = darkMode ? 'white' : '#333';
    }
  }, [darkMode]);

  return (
    <Paper 
      elevation={3} 
      className={className}
      sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        transition: 'all 0.3s ease',
        background: darkMode ? 'var(--glass-bg-color)' : 'var(--glass-bg-color)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderTopLeftRadius: hideHeader ? 0 : undefined,
        borderTopRightRadius: hideHeader ? 0 : undefined,
      }}
    >
      {!hideHeader && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}` }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: darkMode ? 'white' : '#333' }}>
            输入
          </Typography>
        </Box>
      )}
      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            padding: '16px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: "'Roboto Mono', monospace",
            fontSize: '14px',
            lineHeight: '1.5',
            color: darkMode ? 'white' : '#333',
            backgroundColor: 'transparent',
          }}
          spellCheck="false"
          placeholder="在此输入 JSON..."
        />
      </Box>
    </Paper>
  );
};

export default JsonEditor; 