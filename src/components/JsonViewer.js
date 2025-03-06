import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Paper, Box, Typography, Alert, IconButton, Divider, Button } from '@mui/material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import atomOneLight from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import WrapTextIcon from '@mui/icons-material/WrapText';
import VirtualScroller from './VirtualScroller';
import PathNavigator from './PathNavigator';
import JsonInlineEditor from './JsonInlineEditor';

// Register JSON language
SyntaxHighlighter.registerLanguage('json', json);

const JsonViewer = ({ value, error, className, darkMode, onUpdate, hideHeader = false }) => {
  const [jsonData, setJsonData] = useState(null);
  const [jsonLines, setJsonLines] = useState([]);
  const containerRef = useRef(null);
  const [wrapLines, setWrapLines] = useState(false);
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  const [currentPath, setCurrentPath] = useState('root');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodePath, setSelectedNodePath] = useState(null);
  const [selectedNodeValue, setSelectedNodeValue] = useState(null);
  const [selectedNodeParentType, setSelectedNodeParentType] = useState(null);
  const [selectedNodeKey, setSelectedNodeKey] = useState(null);

  // Format primitive values with proper styling
  const formatPrimitive = useCallback((value) => {
    if (typeof value === 'string') {
      return `<span class="json-string">"${value}"</span>`;
    } else if (typeof value === 'number') {
      return `<span class="json-number">${value}</span>`;
    } else if (typeof value === 'boolean') {
      return `<span class="json-boolean">${value}</span>`;
    } else if (value === null) {
      return `<span class="json-null">null</span>`;
    }
    return JSON.stringify(value);
  }, []);

  // 生成扁平化的JSON结构
  const generateFlatJson = useCallback((jsonObj) => {
    const lines = [];
    let lineIndex = 0;
    
    const processValue = (value, path = 'root', level = 0, isLast = true, keyName = null) => {
      if (value === null) {
        // 处理null值
        const content = keyName ? `"${keyName}": null${isLast ? '' : ','}` : `null${isLast ? '' : ','}`;
        lines.push({
          content,
          level,
          path,
          isCollapsible: false,
          isCollapsed: false,
          lineIndex: lineIndex++
        });
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // 处理对象
        const keys = Object.keys(value);
        
        // 添加开括号行
        const openContent = keyName ? `"${keyName}": {${keys.length === 0 ? '}' + (isLast ? '' : ',') : ''}` : '{';
        const openPath = path;
        lines.push({
          content: openContent,
          level,
          path: openPath,
          isCollapsible: keys.length > 0,
          isCollapsed: false,
          isOpenBracket: keys.length > 0,
          bracketType: '{',
          lineIndex: lineIndex++
        });
        
        // 如果对象为空，不需要添加闭括号行
        if (keys.length === 0 && !keyName) {
          lines[lines.length - 1].content += isLast ? '' : ',';
          return;
        }
        
        // 如果对象为空且有键名，已经在开括号行添加了闭括号
        if (keys.length === 0 && keyName) {
          return;
        }
        
        // 处理对象的每个属性
        keys.forEach((key, index) => {
          const isLastProperty = index === keys.length - 1;
          processValue(value[key], `${path}.${key}`, level + 1, isLastProperty, key);
        });
        
        // 添加闭括号行
        const closeContent = `}${isLast ? '' : ','}`;
        lines.push({
          content: closeContent,
          level,
          path: openPath,
          isCollapsible: false,
          isCollapsed: false,
          isCloseBracket: true,
          bracketType: '}',
          lineIndex: lineIndex++
        });
      } else if (Array.isArray(value)) {
        // 处理数组
        // 添加开括号行
        const openContent = keyName ? `"${keyName}": [${value.length === 0 ? ']' + (isLast ? '' : ',') : ''}` : '[';
        const openPath = path;
        lines.push({
          content: openContent,
          level,
          path: openPath,
          isCollapsible: value.length > 0,
          isCollapsed: false,
          isOpenBracket: value.length > 0,
          bracketType: '[',
          lineIndex: lineIndex++
        });
        
        // 如果数组为空，不需要添加闭括号行
        if (value.length === 0 && !keyName) {
          lines[lines.length - 1].content += isLast ? '' : ',';
          return;
        }
        
        // 如果数组为空且有键名，已经在开括号行添加了闭括号
        if (value.length === 0 && keyName) {
          return;
        }
        
        // 处理数组的每个元素
        value.forEach((item, index) => {
          const isLastItem = index === value.length - 1;
          processValue(item, `${path}[${index}]`, level + 1, isLastItem);
        });
        
        // 添加闭括号行
        const closeContent = `]${isLast ? '' : ','}`;
        lines.push({
          content: closeContent,
          level,
          path: openPath,
          isCollapsible: false,
          isCollapsed: false,
          isCloseBracket: true,
          bracketType: ']',
          lineIndex: lineIndex++
        });
      } else {
        // 处理基本类型值
        let formattedValue = formatPrimitive(value);
        const content = keyName ? `"${keyName}": ${formattedValue}${isLast ? '' : ','}` : `${formattedValue}${isLast ? '' : ','}`;
        lines.push({
          content,
          level,
          path,
          isCollapsible: false,
          isCollapsed: false,
          lineIndex: lineIndex++
        });
      }
    };
    
    processValue(jsonObj);
    return lines;
  }, [formatPrimitive]);

  // 检查父级是否折叠
  const isParentCollapsed = useCallback((path, lines) => {
    // 如果是根节点，则不会被隐藏
    if (path === 'root') return false;
    
    // 查找所有可能的父路径
    const pathParts = path.split('.');
    
    // 从最近的父级开始检查
    for (let i = pathParts.length - 1; i > 0; i--) {
      const parentPath = pathParts.slice(0, i).join('.');
      const parentLine = lines.find(l => l.path === parentPath);
      
      // 如果找到父级且父级已折叠，则当前行应该隐藏
      if (parentLine && parentLine.isCollapsible && parentLine.isCollapsed) {
        return true;
      }
    }
    
    // 检查数组索引路径
    if (path.includes('[')) {
      const arrayPath = path.substring(0, path.lastIndexOf('['));
      const arrayLine = lines.find(l => l.path === arrayPath);
      
      if (arrayLine && arrayLine.isCollapsible && arrayLine.isCollapsed) {
        return true;
      }
    }
    
    return false;
  }, []);

  // 处理折叠/展开
  const handleCollapse = useCallback((arrow, line) => {
    if (!containerRef.current) return;
    
    // 获取当前行和相关信息
    const lineElement = arrow.closest('.json-line');
    if (!lineElement) return;
    
    // 确定当前折叠状态 - 直接从DOM元素的transform属性判断
    const currentTransform = arrow.style.transform || '';
    const isCurrentlyCollapsed = !currentTransform.includes('rotate(90deg)');
    
    // 切换折叠状态
    const newCollapsedState = !isCurrentlyCollapsed;
    
    // 更新箭头旋转
    arrow.style.transform = newCollapsedState ? 'rotate(0deg)' : 'rotate(90deg)';
    
    // 更新 jsonLines 中对应行的 isCollapsed 状态
    setJsonLines(prevLines => {
      return prevLines.map(l => {
        if (l.path === line.path) {
          return { ...l, isCollapsed: newCollapsedState };
        }
        return l;
      });
    });
    
    // 获取当前行的级别和路径
    const currentLevel = parseInt(lineElement.getAttribute('data-level') || '0');
    const currentPath = lineElement.getAttribute('data-path');
    
    // 找到所有需要隐藏/显示的行
    const allLines = containerRef.current.querySelectorAll('.json-line');
    let inTargetSection = false;
    let affectedLines = [];
    
    // 遍历所有行，找出受影响的行
    for (let i = 0; i < allLines.length; i++) {
      const l = allLines[i];
      const path = l.getAttribute('data-path');
      const level = parseInt(l.getAttribute('data-level') || '0');
      
      // 如果找到当前行，标记开始处理子行
      if (path === currentPath) {
        inTargetSection = true;
        continue; // 跳过当前行
      }
      
      // 如果在目标区域内
      if (inTargetSection) {
        // 如果遇到同级或更高级的行，结束处理
        if (level <= currentLevel) {
          inTargetSection = false;
          break;
        }
        
        // 添加到受影响的行
        affectedLines.push(l);
      }
    }
    
    // 应用可见性变化 - 简化逻辑
    affectedLines.forEach(l => {
      if (newCollapsedState) {
        // 折叠 - 隐藏所有子行
        l.classList.add('hidden');
      } else {
        // 展开 - 只显示直接子行
        const lineLevel = parseInt(l.getAttribute('data-level') || '0');
        if (lineLevel === currentLevel + 1) {
          l.classList.remove('hidden');
        }
      }
    });
    
    // 检查是否所有行都已展开
    setTimeout(() => {
      if (containerRef.current) {
        const allArrows = containerRef.current.querySelectorAll('.arrow');
        const allExpanded = Array.from(allArrows).every(a => {
          const transform = a.style.transform || '';
          return transform.includes('rotate(90deg)');
        });
        setIsAllExpanded(allExpanded);
      }
    }, 0);
  }, []);

  // 处理路径点击
  const handlePathClick = useCallback((path) => {
    setCurrentPath(path);
    
    // 找到对应的行并滚动到该位置
    if (containerRef.current) {
      const targetLine = containerRef.current.querySelector(`[data-path="${path}"]`);
      if (targetLine) {
        // 移除所有选中状态
        const allLines = containerRef.current.querySelectorAll('.json-line');
        allLines.forEach(line => line.classList.remove('selected'));
        
        // 添加当前选中状态
        targetLine.classList.add('selected');
        
        // 确保目标行可见（如果被折叠了，需要展开）
        const pathParts = path.split(/\.(?![^\[]*\])/);
        let currentPath = '';
        
        // 从根节点开始，确保每一级路径都是展开的
        for (let i = 0; i < pathParts.length; i++) {
          if (i === 0) {
            currentPath = pathParts[i];
          } else {
            currentPath = `${currentPath}.${pathParts[i]}`;
          }
          
          // 找到对应的箭头并确保展开
          const arrow = containerRef.current.querySelector(`.arrow[data-path="${currentPath}"]`);
          if (arrow) {
            const isCollapsed = arrow.style.transform !== 'rotate(90deg)';
            if (isCollapsed) {
              // 找到对应的行
              const line = jsonLines.find(l => l.path === currentPath);
              if (line && line.isCollapsible) {
                handleCollapse(arrow, line);
              }
            }
          }
        }
        
        // 滚动到目标行
        setTimeout(() => {
          targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        // 更新选中节点信息
        const matchingLine = jsonLines.find(l => l.path === path);
        if (matchingLine) {
          setSelectedNode(matchingLine);
          setSelectedNodePath(path);
          
          // 提取父类型和键名
          const pathParts = path.split('.');
          const keyName = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;
          
          // 检查是否是数组元素
          const isArrayItem = keyName && keyName.includes('[');
          const parentType = isArrayItem ? 'array' : 'object';
          
          setSelectedNodeParentType(parentType);
          setSelectedNodeKey(keyName);
        }
      }
    }
  }, [jsonLines, handleCollapse]);

  // 处理节点选择
  const handleNodeSelect = useCallback((line, event) => {
    // 防止冒泡到父元素
    event.stopPropagation();
    
    // 设置选中的节点信息
    setSelectedNode(line);
    setSelectedNodePath(line.path);
    setSelectedNodeValue(line.value);
    setSelectedNodeParentType(line.parentType);
    setSelectedNodeKey(line.keyName);
    
    // 更新当前路径
    setCurrentPath(line.path);
  }, []);

  // 处理JSON更新
  const handleJsonUpdate = useCallback((path, newValue, operation = 'update') => {
    if (!jsonData || !onUpdate) return;
    
    // 克隆当前JSON数据
    const newData = JSON.parse(JSON.stringify(jsonData));
    
    // 解析路径
    const pathParts = path.split('.').filter(part => part !== 'root' && part !== 'close');
    
    // 根据操作类型处理
    if (operation === 'delete') {
      // 删除操作
      if (pathParts.length === 0) {
        // 不能删除根节点
        return;
      }
      
      // 找到父节点和要删除的键
      const parentPath = pathParts.slice(0, -1);
      const keyToDelete = pathParts[pathParts.length - 1];
      
      // 遍历到父节点
      let parent = newData;
      for (const part of parentPath) {
        parent = parent[part];
        if (parent === undefined) return; // 路径无效
      }
      
      // 删除键
      if (Array.isArray(parent)) {
        parent.splice(parseInt(keyToDelete), 1);
      } else {
        delete parent[keyToDelete];
      }
    } else if (operation === 'add') {
      // 添加操作
      const { key, value } = newValue;
      
      // 找到父节点
      let parent = newData;
      for (const part of pathParts) {
        parent = parent[part];
        if (parent === undefined) return; // 路径无效
      }
      
      // 添加新键值对
      if (Array.isArray(parent)) {
        parent.push(value);
      } else {
        parent[key] = value;
      }
    } else {
      // 更新操作
      if (pathParts.length === 0) {
        // 更新根节点
        onUpdate(JSON.stringify(newValue, null, 2));
        return;
      }
      
      // 找到父节点和要更新的键
      const parentPath = pathParts.slice(0, -1);
      const keyToUpdate = pathParts[pathParts.length - 1];
      
      // 遍历到父节点
      let parent = newData;
      for (const part of parentPath) {
        parent = parent[part];
        if (parent === undefined) return; // 路径无效
      }
      
      // 更新键值
      parent[keyToUpdate] = newValue;
    }
    
    // 调用更新回调
    onUpdate(JSON.stringify(newData, null, 2));
  }, [jsonData, onUpdate]);

  // 展开所有
  const expandAll = useCallback(() => {
    setJsonLines(prevLines => {
      const newLines = prevLines.map(line => ({
        ...line,
        isCollapsed: false
      }));
      
      // 强制重新渲染所有行
      setTimeout(() => {
        if (containerRef.current) {
          try {
            // 更新所有行的可见性
            const allLines = containerRef.current.querySelectorAll('.json-line');
            allLines.forEach(line => {
              line.classList.remove('hidden');
            });
            
            // 更新所有箭头的旋转状态
            const allArrows = containerRef.current.querySelectorAll('.arrow');
            allArrows.forEach(arrow => {
              if (arrow) {
                arrow.style.transform = 'rotate(90deg)';
              }
            });
          } catch (err) {
            console.error('展开所有行时出错:', err);
          }
        }
      }, 50);
      
      return newLines;
    });
    
    setIsAllExpanded(true);
  }, []);
  
  // 折叠所有
  const collapseAll = useCallback(() => {
    setJsonLines(prevLines => {
      const newLines = prevLines.map(line => ({
        ...line,
        isCollapsed: line.isCollapsible
      }));
      
      // 强制重新渲染所有行
      setTimeout(() => {
        if (containerRef.current) {
          try {
            // 更新所有行的可见性
            const allLines = containerRef.current.querySelectorAll('.json-line');
            allLines.forEach(line => {
              const level = parseInt(line.getAttribute('data-level') || '0');
              const isOpenBracket = line.hasAttribute('data-bracket-open');
              
              // 只保留第一级的开括号行可见
              if (level > 0 || (level === 0 && !isOpenBracket)) {
                line.classList.add('hidden');
              } else {
                line.classList.remove('hidden');
              }
            });
            
            // 更新所有箭头的旋转状态
            const allArrows = containerRef.current.querySelectorAll('.arrow');
            allArrows.forEach(arrow => {
              if (arrow) {
                arrow.style.transform = 'rotate(0deg)';
              }
            });
          } catch (err) {
            console.error('折叠所有行时出错:', err);
          }
        }
      }, 50);
      
      return newLines;
    });
    
    setIsAllExpanded(false);
  }, []);

  // 渲染单个JSON行
  const renderJsonLine = useCallback((line, index) => {
    try {
      const isSelected = selectedNodePath === line.path;
      const lineClass = `json-line ${isSelected ? 'selected' : ''} ${line.hidden ? 'hidden' : ''}`;
      
      // 确保isCollapsed是布尔值
      const isCollapsed = Boolean(line.isCollapsed);
      
      // 箭头旋转角度 - 确保始终有明确的值
      const arrowRotation = isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)';
      
      // 箭头HTML
      let arrowHtml = '';
      if (line.isCollapsible) {
        arrowHtml = `
          <span class="arrow-container" data-path="${line.path}">
            <span class="arrow" style="transform: ${arrowRotation};" data-path="${line.path}">▶</span>
          </span>
        `;
      } else {
        arrowHtml = '<span class="arrow-placeholder"></span>';
      }
      
      // 格式化内容，添加语法高亮
      let formattedContent = line.content;
      
      // 处理键值对
      if (line.content.includes('"') && line.content.includes(':')) {
        const parts = line.content.split(':');
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        
        formattedContent = `<span class="json-key">${key}</span><span class="json-colon">: </span>`;
        
        // 处理值部分
        if (value.startsWith('{') || value.startsWith('[')) {
          formattedContent += `<span class="json-bracket">${value.charAt(0)}</span>${value.substring(1)}`;
        } else if (value.includes('"')) {
          formattedContent += `<span class="json-string">${value}</span>`;
        } else if (['true', 'false'].includes(value.replace(',', ''))) {
          formattedContent += `<span class="json-boolean">${value}</span>`;
        } else if (value === 'null' || value === 'null,') {
          formattedContent += `<span class="json-null">${value}</span>`;
        } else if (!isNaN(parseFloat(value))) {
          formattedContent += `<span class="json-number">${value}</span>`;
        } else {
          formattedContent += value;
        }
      } 
      // 处理字符串值
      else if (line.content.includes('"')) {
        formattedContent = `<span class="json-string">${line.content}</span>`;
      } 
      // 处理对象括号
      else if (line.content === '{' || line.content === '{,' || line.content === '}' || line.content === '},') {
        formattedContent = `<span class="json-bracket">${line.content.charAt(0)}</span>${line.content.substring(1)}`;
      } 
      // 处理数组括号
      else if (line.content === '[' || line.content === '[,' || line.content === ']' || line.content === '],') {
        formattedContent = `<span class="json-bracket">${line.content.charAt(0)}</span>${line.content.substring(1)}`;
      } 
      // 处理布尔值
      else if (['true', 'false', 'true,', 'false,'].includes(line.content)) {
        formattedContent = `<span class="json-boolean">${line.content}</span>`;
      } 
      // 处理null值
      else if (line.content === 'null' || line.content === 'null,') {
        formattedContent = `<span class="json-null">${line.content}</span>`;
      } 
      // 处理数字
      else if (!isNaN(parseFloat(line.content))) {
        formattedContent = `<span class="json-number">${line.content}</span>`;
      }
      
      // 处理逗号
      if (formattedContent.endsWith(',')) {
        formattedContent = formattedContent.substring(0, formattedContent.length - 1) + '<span class="json-comma">,</span>';
      }
      
      // 行内容
      const content = `
        <div class="${lineClass}" 
             data-path="${line.path}" 
             data-level="${line.level}" 
             ${line.isOpenBracket ? `data-bracket-open="${line.bracketType}"` : ''} 
             ${line.isCloseBracket ? `data-bracket-close="${line.bracketType}"` : ''}>
          <span class="line-number">${index + 1}</span>
          <span class="line-content">
            ${arrowHtml}
            <span class="content" style="padding-left: ${line.level * 20}px">${formattedContent}</span>
          </span>
        </div>
      `;
      
      return content;
    } catch (err) {
      console.error('渲染JSON行时出错:', err, line);
      return `<div class="json-line error">Error rendering line: ${err.message}</div>`;
    }
  }, [selectedNodePath]);

  // 切换展开/折叠状态
  const toggleExpandCollapse = useCallback(() => {
    if (isAllExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  }, [isAllExpanded, expandAll, collapseAll]);

  // 解析JSON并生成行
  useEffect(() => {
    if (!value) {
      setJsonData(null);
      setJsonLines([]);
      return;
    }

    try {
      // 解析JSON
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      setJsonData(parsed);
      
      // 生成行数据
      const lines = generateFlatJson(parsed);
      setJsonLines(lines);
      
      // 设置展开状态 - 使用setTimeout确保DOM已更新
      setTimeout(() => {
        if (containerRef.current) {
          // 默认展开所有
          expandAll();
          setIsAllExpanded(true);
        }
      }, 200); // 增加延迟时间，确保DOM已完全渲染
    } catch (err) {
      // 如果解析失败，保持原样显示
      console.error('JSON解析错误:', err);
      setJsonData(null);
      setJsonLines([]);
    }
  }, [value, generateFlatJson, expandAll]);

  // 确保暗黑模式变化时重新应用样式
  useEffect(() => {
    if (containerRef.current) {
      if (darkMode) {
        containerRef.current.classList.add('dark-mode');
        containerRef.current.classList.remove('light-mode');
      } else {
        containerRef.current.classList.add('light-mode');
        containerRef.current.classList.remove('dark-mode');
      }
    }
  }, [darkMode]);

  // 使用虚拟滚动优化性能
  const renderVirtualizedContent = useMemo(() => {
    if (jsonLines.length === 0) return null;
    
    return (
      <VirtualScroller
        items={jsonLines}
        height="100%"
        itemHeight={24} // 每行高度
        renderItem={renderJsonLine}
        overscan={20}
        style={{
          backgroundColor: 'transparent',
          fontFamily: "'Roboto Mono', monospace",
          fontSize: '14px',
          lineHeight: '1.5',
          color: darkMode ? 'white' : '#333',
        }}
      />
    );
  }, [jsonLines, renderJsonLine, darkMode]);

  // 定义样式对象
  const styles = useMemo(() => ({
    container: {
      fontFamily: "'Roboto Mono', monospace",
      fontSize: '14px',
      lineHeight: '1.5',
      color: darkMode ? 'white' : '#333',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative',
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease'
    },
    header: {
      display: hideHeader ? 'none' : 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px',
      borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
      background: 'transparent',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    pathNavigatorContainer: {
      position: 'sticky',
      top: hideHeader ? 0 : '40px',
      zIndex: 9,
      width: '100%',
      background: darkMode ? 'rgba(30, 30, 30, 0.3)' : 'rgba(240, 240, 240, 0.3)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    headerTitle: {
      margin: 0,
      fontSize: '14px',
      fontWeight: 'medium',
      color: darkMode ? 'white' : '#333'
    },
    headerActions: {
      display: 'flex',
      gap: '8px'
    },
    button: {
      padding: '4px 8px',
      background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      color: darkMode ? 'white' : '#333',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      padding: '8px 0',
      position: 'relative',
      flex: 1,
      overflow: 'auto'
    },
    error: {
      color: '#e74c3c',
      padding: '16px',
      fontFamily: "'Roboto Mono', monospace",
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }
  }), [darkMode, hideHeader]);

  // 渲染JSON并设置事件监听器
  useEffect(() => {
    if (!containerRef.current || !jsonLines.length) return;
    
    // 渲染JSON行
    const htmlContent = jsonLines.map((line, index) => renderJsonLine(line, index)).join('');
    containerRef.current.innerHTML = htmlContent;
    
    // 添加内联样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .json-line {
        display: flex;
        align-items: flex-start;
        padding: 2px 0;
        font-family: 'Roboto Mono', monospace;
        white-space: pre;
      }
      
      .json-line.selected {
        background: ${darkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)'};
      }
      
      .json-line.hidden {
        display: none;
      }
      
      .line-number {
        display: inline-block;
        min-width: 40px;
        text-align: right;
        padding-right: 10px;
        color: ${darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
        user-select: none;
      }
      
      .line-content {
        display: flex;
        align-items: center;
        flex: 1;
      }
      
      .arrow-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-right: 4px;
        cursor: pointer;
        user-select: none;
      }
      
      .arrow-placeholder {
        display: inline-block;
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
      
      .arrow {
        display: inline-block;
        transform: rotate(90deg);
        transition: transform 0.2s ease;
        font-size: 10px;
        line-height: 1;
        color: ${darkMode ? 'white' : '#333'};
      }
      
      .content {
        padding-left: 4px;
        flex: 1;
        color: ${darkMode ? 'white' : '#333'};
      }
      
      /* 语法高亮 */
      .json-key {
        color: ${darkMode ? '#ff9966' : '#e07c4c'};
      }
      
      .json-string {
        color: ${darkMode ? '#98c379' : '#50a14f'};
      }
      
      .json-number {
        color: ${darkMode ? '#d19a66' : '#c18401'};
      }
      
      .json-boolean {
        color: ${darkMode ? '#56b6c2' : '#0184bc'};
      }
      
      .json-null {
        color: ${darkMode ? '#56b6c2' : '#0184bc'};
      }
      
      .json-bracket {
        color: ${darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
      }
      
      .json-comma {
        color: ${darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
      }
      
      .json-colon {
        color: ${darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
      }
    `;
    
    // 将样式添加到容器内部，而不是document.head
    containerRef.current.appendChild(styleElement);
    
    // 设置行点击事件
    const lines = containerRef.current.querySelectorAll('.json-line');
    lines.forEach(line => {
      line.addEventListener('click', (e) => {
        if (e.target.closest('.arrow-container')) return; // 忽略箭头点击
        
        const path = line.getAttribute('data-path');
        setSelectedNodePath(path);
        setCurrentPath(path); // 更新当前路径，用于PathNavigator
        
        // 设置选中的节点信息
        const matchingLine = jsonLines.find(l => l.path === path);
        if (matchingLine) {
          setSelectedNode(matchingLine);
          
          // 提取父类型和键名
          const pathParts = path.split('.');
          const keyName = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;
          
          // 检查是否是数组元素
          const isArrayItem = keyName && keyName.includes('[');
          const parentType = isArrayItem ? 'array' : 'object';
          
          setSelectedNodeParentType(parentType);
          setSelectedNodeKey(keyName);
        }
        
        // 移除所有选中状态
        lines.forEach(l => l.classList.remove('selected'));
        // 添加当前选中状态
        line.classList.add('selected');
      });
    });
    
    // 设置箭头点击事件
    const arrows = containerRef.current.querySelectorAll('.arrow-container');
    arrows.forEach(arrowContainer => {
      arrowContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        
        const arrow = arrowContainer.querySelector('.arrow');
        if (!arrow) return;
        
        const path = arrow.getAttribute('data-path');
        const line = jsonLines.find(l => l.path === path);
        
        if (line && line.isCollapsible) {
          handleCollapse(arrow, line);
        }
      });
    });
    
    // 初始化时检查是否所有行都已展开
    const allArrows = containerRef.current.querySelectorAll('.arrow');
    const allExpanded = Array.from(allArrows).every(a => a.style.transform.includes('rotate(90'));
    setIsAllExpanded(allExpanded);
    
    // 清理函数
    return () => {
      // 移除事件监听器
      lines.forEach(line => {
        line.removeEventListener('click', () => {});
      });
      
      arrows.forEach(arrow => {
        arrow.removeEventListener('click', () => {});
      });
      
      // 不需要移除样式元素，因为它是容器的子元素，会随容器一起被移除
    };
  }, [jsonLines, renderJsonLine, handleCollapse, darkMode]);

  return (
    <div className={`${className}`} style={{ height: '100%', width: '100%' }}>
      <div style={styles.container} className="output-glassmorphism">
        {!hideHeader && (
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: darkMode ? 'white' : '#333' }}>
              输出
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={isAllExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
              onClick={toggleExpandCollapse}
              sx={{ 
                color: darkMode ? 'white' : '#333',
                fontSize: '12px',
                textTransform: 'none'
              }}
            >
              {isAllExpanded ? "全部折叠" : "全部展开"}
            </Button>
          </Box>
        )}
        
        {/* 添加路径导航器，使用固定定位 */}
        <div style={styles.pathNavigatorContainer}>
          <PathNavigator 
            currentPath={currentPath} 
            onPathClick={handlePathClick} 
            darkMode={darkMode} 
          />
        </div>
        
        <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {error ? (
            <div style={styles.error}>{error}</div>
          ) : (
            <div ref={containerRef} style={{ padding: '16px' }}></div>
          )}
        </Box>
      </div>
    </div>
  );
};

export default JsonViewer;