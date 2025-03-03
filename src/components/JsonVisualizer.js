import React, { useEffect, useRef } from 'react';
import { Box, Typography, Alert } from '@mui/material';

const JsonVisualizer = ({ data, darkMode }) => {
  const canvasRef = useRef(null);
  
  // 绘制树形图
  const drawTreeVisualization = (ctx, data, startX, startY, width, height) => {
    if (!data || typeof data !== 'object') return;
    
    const isArray = Array.isArray(data);
    const keys = Object.keys(data);
    if (keys.length === 0) return;
    
    const nodeHeight = 30;
    const nodeWidth = 120;
    const verticalGap = 50;
    const horizontalGap = 20;
    
    // 绘制根节点
    ctx.fillStyle = darkMode ? 'rgba(74, 59, 143, 0.8)' : 'rgba(91, 95, 199, 0.8)';
    ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    
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
      const value = data[key];
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
      if (isChildObject) {
        valueType = Array.isArray(value) ? 'Array' : 'Object';
      } else {
        valueType = value === null ? 'null' : typeof value;
        if (valueType === 'string' && value.length > 10) {
          value = value.substring(0, 8) + '...';
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
          childStartY + nodeHeight + verticalGap, 
          nodeWidth, 
          nodeHeight
        );
      }
    });
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // 设置canvas尺寸
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      // 解析JSON数据
      const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
      
      // 绘制可视化
      drawTreeVisualization(ctx, jsonData, 50, 50, canvas.width - 100, canvas.height - 100);
    } catch (err) {
      console.error('Visualization error:', err);
    }
  }, [data, darkMode]);
  
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      overflow: 'auto',
      backgroundColor: darkMode ? 'rgba(18, 18, 18, 0.5)' : 'rgba(245, 245, 245, 0.5)',
    }}>
      {data ? (
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            minHeight: '500px',
          }}
        />
      ) : (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Alert severity="info">请先格式化JSON数据以查看可视化效果</Alert>
        </Box>
      )}
    </Box>
  );
};

export default JsonVisualizer; 