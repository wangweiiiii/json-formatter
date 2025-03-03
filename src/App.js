import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, useTheme, IconButton, createTheme, ThemeProvider } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import JsonEditor from './components/JsonEditor';
import JsonViewer from './components/JsonViewer';
import ControlPanel from './components/ControlPanel';
import './GlassmorphismEffects.css'; // 引入毛玻璃效果样式

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    // 从localStorage读取主题设置，默认为暗黑模式
    const savedMode = localStorage.getItem('jsonFormatterDarkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });

  // 创建主题
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      },
    },
  });

  // 切换暗黑/白天模式
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('jsonFormatterDarkMode', JSON.stringify(newMode));
    
    // 更新CSS变量
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  // 初始化时设置CSS变量
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load saved input from localStorage when component mounts
  useEffect(() => {
    const savedInput = localStorage.getItem('jsonFormatterInput');
    if (savedInput) {
      setInput(savedInput);
    }
  }, []);

  const handleInputChange = (value) => {
    setInput(value);
    setError('');
    // Save input to localStorage whenever it changes
    localStorage.setItem('jsonFormatterInput', value);
  };

  const handleFormat = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (err) {
      setError(`格式化错误: ${err.message}`);
    }
  };

  const handleEscape = () => {
    try {
      setOutput(JSON.stringify(input));
      setError('');
    } catch (err) {
      setError(`转义错误: ${err.message}`);
    }
  };

  const handleUnescape = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      
      // 移除开头和结尾的引号（如果有）
      let processedInput = input;
      if (input.startsWith('"') && input.endsWith('"')) {
        processedInput = input.slice(1, -1);
      }
      
      // 尝试解析转义后的字符串
      setOutput(JSON.parse(`"${processedInput}"`));
      setError('');
    } catch (err) {
      setError(`反转义错误: ${err.message}`);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    // Clear saved input from localStorage
    localStorage.removeItem('jsonFormatterInput');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <ThemeProvider theme={theme}>
      {/* 动态背景 */}
      <div className={`dynamic-bg ${darkMode ? 'dark' : 'light'}`}>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>
      
      <Container maxWidth="xl" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            align="center" 
            sx={{ 
              color: darkMode ? 'white' : '#333',
              fontWeight: '700',
              textShadow: darkMode ? '0 2px 10px rgba(0, 0, 0, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
              letterSpacing: '1px',
              flex: 1
            }}
          >
            JSON 格式化工具
          </Typography>
          
          <IconButton 
            onClick={toggleDarkMode} 
            color="inherit"
            sx={{ 
              ml: 2,
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)',
              }
            }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        
        <ControlPanel 
          onFormat={handleFormat} 
          onEscape={handleEscape} 
          onUnescape={handleUnescape} 
          onClear={handleClear} 
          onCopy={handleCopy} 
          darkMode={darkMode}
        />
        
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          flex: 1,
          minHeight: 0,
          mb: 2
        }}>
          <JsonEditor 
            value={input} 
            onChange={handleInputChange} 
            className={`glassmorphism ${darkMode ? 'dark' : 'light'}`}
            darkMode={darkMode}
          />
          <JsonViewer 
            value={output} 
            error={error}
            className={`glassmorphism ${darkMode ? 'dark' : 'light'}`}
            darkMode={darkMode}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;