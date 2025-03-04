import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Snackbar, Paper } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PathNavigator = ({ currentPath, onPathClick, darkMode }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // 改进路径解析，更好地处理数组索引
  const parsePathParts = () => {
    if (!currentPath || currentPath === 'root') {
      return [{ label: 'root', fullPath: 'root' }];
    }

    const parts = [];
    let currentFullPath = '';
    
    // 分割路径，但保留数组索引格式
    const segments = currentPath.split(/\.(?![^\[]*\])/);
    
    // 添加根节点
    parts.push({ label: 'root', fullPath: 'root' });
    
    // 处理其他路径部分
    segments.forEach(segment => {
      currentFullPath = currentFullPath === 'root' ? segment : `${currentFullPath}.${segment}`;
      
      // 格式化显示标签
      let displayLabel = segment;
      
      // 检测并格式化数组索引 (例如 "items[0]" 显示为 "items[0]")
      const arrayMatch = segment.match(/^(.+)(\[\d+\])$/);
      if (arrayMatch) {
        displayLabel = `${arrayMatch[1]}${arrayMatch[2]}`;
      }
      
      parts.push({
        label: displayLabel,
        fullPath: currentFullPath
      });
    });
    
    return parts;
  };
  
  const pathParts = parsePathParts();
  
  // 处理路径点击
  const handlePathClick = (fullPath) => {
    if (onPathClick) {
      onPathClick(fullPath);
    }
  };
  
  // 复制路径到剪贴板
  const copyPathToClipboard = () => {
    // 转换路径为JavaScript访问格式
    let jsPath = 'root';
    
    if (currentPath && currentPath !== 'root') {
      jsPath = currentPath.split(/\.(?![^\[]*\])/).reduce((acc, part, index) => {
        if (index === 0) return part;
        
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
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <Tooltip title="返回根节点">
        <IconButton 
          size="small" 
          onClick={() => handlePathClick('root')}
          sx={{ 
            mr: 1,
            color: darkMode ? 'white' : '#333',
          }}
        >
          <HomeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          height: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        }
      }}>
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
              label={part.label}
              size="small"
              onClick={() => handlePathClick(part.fullPath)}
              sx={{
                backgroundColor: darkMode ? 'rgba(74, 59, 143, 0.6)' : 'rgba(91, 95, 199, 0.6)',
                color: darkMode ? 'white' : 'white',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(93, 74, 156, 0.7)' : 'rgba(58, 139, 216, 0.7)',
                },
                my: 0.5,
                maxWidth: '150px',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }
              }}
            />
          </React.Fragment>
        ))}
      </Box>
      
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
        <Paper 
          elevation={3}
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 16px',
            borderRadius: '8px',
            backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            color: darkMode ? 'white' : '#333',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(31, 38, 135, 0.1)',
          }}
        >
          <CheckCircleOutlineIcon 
            sx={{ 
              marginRight: 1.5, 
              color: darkMode ? '#4caf50' : '#2e7d32'
            }} 
          />
          路径已复制到剪贴板
        </Paper>
      </Snackbar>
    </Box>
  );
};

export default PathNavigator; 