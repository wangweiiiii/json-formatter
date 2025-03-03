import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const JsonEditor = ({ value, onChange, className }) => {
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

  return (
    <Paper 
      elevation={3} 
      className={className}
      sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'white' }}>
          输入
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请输入 JSON 字符串..."
          spellCheck="false"
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
            color: 'white',
            backgroundColor: 'transparent',
          }}
        />
      </Box>
    </Paper>
  );
};

export default JsonEditor; 