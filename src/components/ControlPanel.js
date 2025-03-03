import React from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import UndoIcon from '@mui/icons-material/Undo';

const ControlPanel = ({ onFormat, onEscape, onUnescape, onClear, onCopy, darkMode }) => {
  // 根据暗黑模式设置按钮样式
  const buttonStyle = {
    background: darkMode ? 'rgba(74, 59, 143, 0.6)' : 'rgba(91, 95, 199, 0.6)',
    backdropFilter: 'blur(10px)',
    boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      background: darkMode ? 'rgba(93, 74, 156, 0.7)' : 'rgba(58, 139, 216, 0.7)',
      transform: 'translateY(-2px)',
      boxShadow: darkMode ? '0 6px 16px rgba(0, 0, 0, 0.25)' : '0 6px 16px rgba(0, 0, 0, 0.15)',
    },
    fontWeight: 500,
    letterSpacing: '0.5px',
    padding: '8px 16px',
    borderRadius: '12px',
    textTransform: 'none',
    fontSize: '0.95rem',
    color: darkMode ? '#e0e0e0' : 'white'
  };

  const outlinedButtonStyle = {
    ...buttonStyle,
    background: darkMode ? 'rgba(45, 43, 110, 0.4)' : 'rgba(91, 95, 199, 0.3)',
    border: darkMode ? '1px solid rgba(138, 101, 201, 0.5)' : '1px solid rgba(58, 139, 216, 0.5)',
    '&:hover': {
      ...buttonStyle['&:hover'],
      border: darkMode ? '1px solid rgba(138, 101, 201, 0.7)' : '1px solid rgba(58, 139, 216, 0.7)',
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 2, 
      mb: 3,
      justifyContent: 'center'
    }}>
      <Tooltip title="格式化并美化 JSON">
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<FormatAlignLeftIcon />}
          onClick={onFormat}
          className="glassmorphism-button"
          sx={buttonStyle}
        >
          格式化
        </Button>
      </Tooltip>
      
      <Tooltip title="转义 JSON 字符串">
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<CodeIcon />}
          onClick={onEscape}
          className="glassmorphism-button"
          sx={buttonStyle}
        >
          转义
        </Button>
      </Tooltip>
      
      <Tooltip title="反转义 JSON 字符串">
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<UndoIcon />}
          onClick={onUnescape}
          className="glassmorphism-button"
          sx={buttonStyle}
        >
          反转义
        </Button>
      </Tooltip>
      
      <Tooltip title="复制结果到剪贴板">
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<ContentCopyIcon />}
          onClick={onCopy}
          className="glassmorphism-button"
          sx={buttonStyle}
        >
          复制结果
        </Button>
      </Tooltip>
      
      <Tooltip title="清空输入和输出">
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<ClearAllIcon />}
          onClick={onClear}
          className="glassmorphism-button"
          sx={outlinedButtonStyle}
        >
          清空
        </Button>
      </Tooltip>
    </Box>
  );
};

export default ControlPanel; 