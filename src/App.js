import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton, createTheme, ThemeProvider, Tabs, Tab } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import JsonEditor from './components/JsonEditor';
import JsonViewer from './components/JsonViewer';
import ControlPanel from './components/ControlPanel';
import FormatOptions from './components/FormatOptions';
import JsonVisualizer from './components/JsonVisualizer';
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
  const [indentSize, setIndentSize] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [validateSchema, setValidateSchema] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
    
    // 强制重新渲染输出区域
    if (output) {
      const tempOutput = output;
      setOutput('');
      setTimeout(() => {
        setOutput(tempOutput);
      }, 10);
    }
  };

  // 初始化时设置CSS变量
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // 确保暗黑模式状态在组件重新渲染时保持一致
  useEffect(() => {
    const checkAndUpdateTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const expectedTheme = darkMode ? 'dark' : 'light';
      
      if (currentTheme !== expectedTheme) {
        document.documentElement.setAttribute('data-theme', expectedTheme);
      }
    };
    
    // 初始检查
    checkAndUpdateTheme();
    
    // 添加事件监听器，在DOM变化时检查主题
    const observer = new MutationObserver(checkAndUpdateTheme);
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, [darkMode]);

  // Load saved input from localStorage when component mounts
  useEffect(() => {
    const savedInput = localStorage.getItem('jsonFormatterInput');
    if (savedInput) {
      setInput(savedInput);
    }
    
    // 加载保存的格式化选项
    const savedIndentSize = localStorage.getItem('jsonFormatterIndentSize');
    if (savedIndentSize) {
      setIndentSize(parseInt(savedIndentSize));
    }
    
    const savedSortKeys = localStorage.getItem('jsonFormatterSortKeys');
    if (savedSortKeys) {
      setSortKeys(JSON.parse(savedSortKeys));
    }
    
    const savedValidateSchema = localStorage.getItem('jsonFormatterValidateSchema');
    if (savedValidateSchema) {
      setValidateSchema(JSON.parse(savedValidateSchema));
    }
  }, []);

  const handleInputChange = (value) => {
    setInput(value);
    setError('');
    // Save input to localStorage whenever it changes
    localStorage.setItem('jsonFormatterInput', value);
  };

  // 处理格式化选项变更
  const handleIndentSizeChange = (size) => {
    setIndentSize(size);
    localStorage.setItem('jsonFormatterIndentSize', size);
    // 如果已经有输出，重新格式化
    if (output) {
      try {
        const parsed = JSON.parse(output);
        setOutput(JSON.stringify(parsed, null, size));
      } catch (err) {
        // 忽略错误
      }
    }
  };

  const handleSortKeysChange = (sort) => {
    setSortKeys(sort);
    localStorage.setItem('jsonFormatterSortKeys', JSON.stringify(sort));
    // 如果已经有输出，重新格式化
    if (output) {
      try {
        const parsed = JSON.parse(output);
        if (sort) {
          // 排序键
          const sortedOutput = sortJsonKeys(parsed);
          setOutput(JSON.stringify(sortedOutput, null, indentSize));
        } else {
          // 不排序，保持原样
          setOutput(JSON.stringify(parsed, null, indentSize));
        }
      } catch (err) {
        // 忽略错误
      }
    }
  };

  const handleValidateSchemaChange = (validate) => {
    setValidateSchema(validate);
    localStorage.setItem('jsonFormatterValidateSchema', JSON.stringify(validate));
  };

  // 递归排序JSON对象的键
  const sortJsonKeys = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sortJsonKeys);
    }
    
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortJsonKeys(obj[key]);
        return result;
      }, {});
  };

  const handleFormat = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      
      let parsed = JSON.parse(input);
      
      // 如果启用了键排序
      if (sortKeys) {
        parsed = sortJsonKeys(parsed);
      }
      
      // 使用设置的缩进大小
      setOutput(JSON.stringify(parsed, null, indentSize));
      setError('');
      
      // 确保在格式化后重新应用暗黑模式设置
      document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    } catch (err) {
      setError(`格式化错误: ${err.message}`);
    }
  };

  const handleEscape = () => {
    try {
      setOutput(JSON.stringify(input));
      setError('');
      
      // 确保在转义后重新应用暗黑模式设置
      document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
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
      
      // 确保在反转义后重新应用暗黑模式设置
      document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
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
    
    // 确保在清空后重新应用暗黑模式设置
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  // 处理JSON更新（从内联编辑器）
  const handleJsonUpdate = (newValue) => {
    setOutput(newValue);
  };

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormatOptions 
              indentSize={indentSize}
              setIndentSize={handleIndentSizeChange}
              sortKeys={sortKeys}
              setSortKeys={handleSortKeysChange}
              validateSchema={validateSchema}
              setValidateSchema={handleValidateSchemaChange}
              darkMode={darkMode}
            />
            
            <IconButton 
              onClick={toggleDarkMode} 
              color="inherit"
              sx={{ 
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
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
          
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ 
                mb: 1,
                '& .MuiTab-root': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  '&.Mui-selected': {
                    color: darkMode ? 'white' : '#1976d2',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: darkMode ? 'white' : '#1976d2',
                }
              }}
            >
              <Tab label="JSON 视图" />
              <Tab label="可视化" />
            </Tabs>
            
            <Box sx={{ flex: 1, display: activeTab === 0 ? 'flex' : 'none' }}>
              <JsonViewer 
                value={output} 
                error={error}
                className={`glassmorphism ${darkMode ? 'dark' : 'light'}`}
                darkMode={darkMode}
                onUpdate={handleJsonUpdate}
              />
            </Box>
            
            <Box sx={{ flex: 1, display: activeTab === 1 ? 'flex' : 'none' }}>
              <JsonVisualizer 
                data={output}
                darkMode={darkMode}
                className={`glassmorphism ${darkMode ? 'dark' : 'light'}`}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;