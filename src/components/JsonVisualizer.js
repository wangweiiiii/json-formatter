import React, { useEffect, useRef, useState } from 'react';
import { Box, Alert, Paper } from '@mui/material';

const JsonVisualizer = ({ data, darkMode, className }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  
  // 绘制树形图
  const drawTreeVisualization = (ctx, jsonData, startX, startY) => {
    if (!jsonData || typeof jsonData !== 'string' && typeof jsonData !== 'object') return;
    
    try {
      // 如果是字符串，尝试解析为JSON
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (!parsedData || typeof parsedData !== 'object') {
        setError('无法可视化非对象类型的数据');
        return;
      }
      
      const isArray = Array.isArray(parsedData);
      const keys = Object.keys(parsedData);
      if (keys.length === 0) return;
      
      const nodeHeight = 30;
      const nodeWidth = 120;
      const verticalGap = 50;
      const horizontalGap = 20;
      
      // 绘制圆角矩形
      const drawRoundedRect = (x, y, width, height, radius) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };
      
      // 绘制根节点
      ctx.fillStyle = darkMode ? 'rgba(74, 59, 143, 0.8)' : 'rgba(91, 95, 199, 0.8)';
      ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      drawRoundedRect(startX, startY, nodeWidth, nodeHeight, 10);
      
      // 绘制根节点文本
      ctx.fillStyle = darkMode ? 'white' : 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isArray ? 'Array' : 'Object', startX + nodeWidth / 2, startY + nodeHeight / 2);
      
      // 计算子节点位置
      const totalChildWidth = keys.length * (nodeWidth + horizontalGap) - horizontalGap;
      let childStartX = startX + (nodeWidth - totalChildWidth) / 2;
      const childStartY = startY + nodeHeight + verticalGap;
      
      // 绘制子节点
      keys.forEach((key, index) => {
        const childX = childStartX + index * (nodeWidth + horizontalGap);
        const value = parsedData[key];
        const isChildObject = value !== null && typeof value === 'object';
        
        // 绘制连接线
        ctx.beginPath();
        ctx.moveTo(startX + nodeWidth / 2, startY + nodeHeight);
        ctx.lineTo(childX + nodeWidth / 2, childStartY);
        ctx.stroke();
        
        // 绘制子节点
        ctx.fillStyle = isChildObject 
          ? (darkMode ? 'rgba(93, 74, 156, 0.8)' : 'rgba(58, 139, 216, 0.8)')
          : (darkMode ? 'rgba(138, 101, 201, 0.8)' : 'rgba(91, 95, 199, 0.6)');
        drawRoundedRect(childX, childStartY, nodeWidth, nodeHeight, 10);
        
        // 绘制子节点文本
        ctx.fillStyle = darkMode ? 'white' : 'white';
        let displayText = isArray ? `[${key}]` : key;
        if (displayText.length > 10) {
          displayText = displayText.substring(0, 8) + '...';
        }
        ctx.fillText(displayText, childX + nodeWidth / 2, childStartY + nodeHeight / 2 - 7);
        
        // 绘制值类型
        let valueType = '';
        let displayValue = value;
        if (isChildObject) {
          valueType = Array.isArray(value) ? 'Array' : 'Object';
        } else {
          valueType = value === null ? 'null' : typeof value;
          if (typeof value === 'string' && value.length > 10) {
            displayValue = value.substring(0, 8) + '...';
          }
        }
        ctx.font = '12px Arial';
        ctx.fillText(valueType, childX + nodeWidth / 2, childStartY + nodeHeight / 2 + 7);
        
        // 递归绘制子对象
        if (isChildObject) {
          drawTreeVisualization(
            ctx, 
            value, 
            childX, 
            childStartY + nodeHeight + verticalGap
          );
        }
      });
    } catch (err) {
      console.error('Visualization error:', err);
      setError(`可视化错误: ${err.message}`);
    }
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // 重置错误状态
    setError(null);
    
    // 设置canvas尺寸
    canvas.width = container.clientWidth;
    canvas.height = Math.max(container.clientHeight, 800); // 确保有足够的高度
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 检查是否有数据
    if (!data) {
      return;
    }
    
    // 绘制可视化
    drawTreeVisualization(ctx, data, 50, 50);
  }, [data, darkMode, drawTreeVisualization]);
  
  return (
    <Paper 
      elevation={3} 
      className={className}
      sx={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        transition: 'all 0.3s ease',
        background: darkMode ? 'var(--glass-bg-color)' : 'var(--glass-bg-color)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }}
    >
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: 2
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : data ? (
          <canvas 
            ref={canvasRef} 
            style={{ 
              width: '100%',
              minHeight: '500px',
            }}
          />
        ) : (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Alert severity="info">请先格式化JSON数据以查看可视化效果</Alert>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default JsonVisualizer; 