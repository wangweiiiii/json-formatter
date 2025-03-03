import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HomeIcon from '@mui/icons-material/Home';

const PathNavigator = ({ currentPath, onPathClick, darkMode }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // 将路径字符串分割成数组
  const pathParts = currentPath ? currentPath.split('.') : ['root'];
  
  // 处理路径点击
  const handlePathClick = (index) => {
    if (onPathClick) {
      // 构建到指定索引的路径
      const newPath = index === 0 ? 'root' : pathParts.slice(0, index + 1).join('.');
      onPathClick(newPath);
    }
  };
  
  // 复制路径到剪贴板
  const copyPathToClipboard = () => {
    // 转换路径为JavaScript访问格式
    let jsPath = 'root';
    
    if (currentPath && currentPath !== 'root') {
      jsPath = currentPath.split('.').reduce((acc, part) => {
        // 检查是否是数组索引 (如 "array[0]")
        const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
          return `${acc}["${arrayMatch[1]}"][${arrayMatch[2]}]`;
        }
        // 普通属性
        return `${acc}["${part}"]`;
      }, '');
    }
    
    navigator.clipboard.writeText(jsPath);
    setSnackbarOpen(true);
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        p: 1,
        borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.3)' : 'rgba(240, 240, 240, 0.3)',
      }}
    >
      <Tooltip title="返回根节点">
        <IconButton 
          size="small" 
          onClick={() => handlePathClick(0)}
          sx={{ 
            mr: 1,
            color: darkMode ? 'white' : '#333',
          }}
        >
          <HomeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      {pathParts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Box 
              component="span" 
              sx={{ 
                mx: 0.5, 
                color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                userSelect: 'none'
              }}
            >
              /
            </Box>
          )}
          <Chip
            label={part}
            size="small"
            onClick={() => handlePathClick(index)}
            sx={{
              backgroundColor: darkMode ? 'rgba(74, 59, 143, 0.6)' : 'rgba(91, 95, 199, 0.6)',
              color: darkMode ? 'white' : 'white',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(93, 74, 156, 0.7)' : 'rgba(58, 139, 216, 0.7)',
              },
              my: 0.5,
            }}
          />
        </React.Fragment>
      ))}
      
      <Tooltip title="复制路径">
        <IconButton 
          size="small" 
          onClick={copyPathToClipboard}
          sx={{ 
            ml: 1,
            color: darkMode ? 'white' : '#333',
          }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          路径已复制到剪贴板
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PathNavigator; 