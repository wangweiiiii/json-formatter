import React from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import UndoIcon from '@mui/icons-material/Undo';

const ControlPanel = ({ onFormat, onEscape, onUnescape, onClear, onCopy }) => {
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
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
            },
            fontWeight: 500,
            letterSpacing: '0.5px',
            padding: '8px 16px',
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.95rem',
            color: 'white'
          }}
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
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
            },
            fontWeight: 500,
            letterSpacing: '0.5px',
            padding: '8px 16px',
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.95rem',
            color: 'white'
          }}
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
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
            },
            fontWeight: 500,
            letterSpacing: '0.5px',
            padding: '8px 16px',
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.95rem',
            color: 'white'
          }}
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
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
            },
            fontWeight: 500,
            letterSpacing: '0.5px',
            padding: '8px 16px',
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.95rem',
            color: 'white'
          }}
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
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            },
            fontWeight: 500,
            letterSpacing: '0.5px',
            padding: '8px 16px',
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '0.95rem'
          }}
        >
          清空
        </Button>
      </Tooltip>
    </Box>
  );
};

export default ControlPanel; 