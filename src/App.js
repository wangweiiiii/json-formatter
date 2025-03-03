import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import JsonEditor from './components/JsonEditor';
import JsonViewer from './components/JsonViewer';
import ControlPanel from './components/ControlPanel';
import './GlassmorphismEffects.css'; // 引入毛玻璃效果样式

function App() {
  const theme = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

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
    <>
      {/* 动态背景 */}
      <div className="dynamic-bg">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>
      
      <Container maxWidth="xl" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          gutterBottom 
          sx={{ 
            color: 'white',
            fontWeight: '700',
            mb: 4,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            letterSpacing: '1px',
          }}
        >
          JSON 格式化工具
        </Typography>
        
        <ControlPanel 
          onFormat={handleFormat} 
          onEscape={handleEscape} 
          onUnescape={handleUnescape} 
          onClear={handleClear} 
          onCopy={handleCopy} 
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
            className="glassmorphism"
          />
          <JsonViewer 
            value={output} 
            error={error}
            className="glassmorphism"
          />
        </Box>
      </Container>
    </>
  );
}

export default App;