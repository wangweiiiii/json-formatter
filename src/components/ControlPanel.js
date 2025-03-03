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
        >
          清空
        </Button>
      </Tooltip>
    </Box>
  );
};

export default ControlPanel; 