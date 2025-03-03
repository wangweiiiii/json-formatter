import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Paper, Box, Typography, Alert, IconButton, Divider } from '@mui/material';
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

const JsonViewer = ({ value, error, className, darkMode, onUpdate }) => {
  const [collapsibleJson, setCollapsibleJson] = useState('');
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

  // Generate a flat structure with proper indentation
  const generateFlatJson = useCallback((obj) => {
    const lines = [];
    
    const processValue = (value, path, level, isLast, keyName = null, parentType = null) => {
      if (Array.isArray(value)) {
        // Array opening
        lines.push({
          content: keyName !== null 
            ? `<span class="json-key">"${keyName}"</span><span class="json-colon">: </span><span class="json-bracket">[</span>` 
            : '<span class="json-bracket">[</span>',
          level,
          isCollapsible: value.length > 0,
          path,
          isOpenBracket: true,
          bracketType: '[',
          value: value,
          keyName,
          parentType
        });
        
        // Array items
        value.forEach((item, index) => {
          const itemPath = `${path}.${index}`;
          const isLastItem = index === value.length - 1;
          processValue(item, itemPath, level + 1, isLastItem, null, 'array');
        });
        
        // Array closing
        lines.push({
          content: `<span class="json-bracket">]</span>${isLast ? '' : '<span class="json-comma">,</span>'}`,
          level,
          isCollapsible: false,
          path: `${path}.close`,
          isCloseBracket: true,
          bracketType: ']',
          value: value,
          keyName,
          parentType
        });
      } else if (typeof value === 'object' && value !== null) {
        // Object opening
        lines.push({
          content: keyName !== null 
            ? `<span class="json-key">"${keyName}"</span><span class="json-colon">: </span><span class="json-bracket">{</span>` 
            : '<span class="json-bracket">{</span>',
          level,
          isCollapsible: Object.keys(value).length > 0,
          path,
          isOpenBracket: true,
          bracketType: '{',
          value: value,
          keyName,
          parentType
        });
        
        // Object properties
        const keys = Object.keys(value);
        keys.forEach((key, index) => {
          const propPath = `${path}.${key}`;
          const isLastProp = index === keys.length - 1;
          processValue(value[key], propPath, level + 1, isLastProp, key, 'object');
        });
        
        // Object closing
        lines.push({
          content: `<span class="json-bracket">}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`,
          level,
          isCollapsible: false,
          path: `${path}.close`,
          isCloseBracket: true,
          bracketType: '}',
          value: value,
          keyName,
          parentType
        });
      } else {
        // Primitive value
        lines.push({
          content: keyName !== null 
            ? `<span class="json-key">"${keyName}"</span><span class="json-colon">: </span>${formatPrimitive(value)}${isLast ? '' : '<span class="json-comma">,</span>'}` 
            : `${formatPrimitive(value)}${isLast ? '' : '<span class="json-comma">,</span>'}`,
          level,
          isCollapsible: false,
          path,
          value,
          keyName,
          parentType
        });
      }
    };
    
    processValue(obj, 'root', 0, true);
    return lines;
  }, [formatPrimitive]);

  // 处理路径点击
  const handlePathClick = useCallback((path) => {
    setCurrentPath(path);
    
    // 找到对应的行并滚动到该位置
    if (containerRef.current) {
      const targetLine = containerRef.current.querySelector(`[data-path="${path}"]`);
      if (targetLine) {
        targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);

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

  // 渲染单个JSON行
  const renderJsonLine = useCallback((line, index) => {
    const indent = line.level * 20; // 20px per indent level
    const arrowHtml = line.isCollapsible 
      ? `<span class="arrow" data-path="${line.path}" style="display: inline-block; width: 16px; text-align: center; cursor: pointer;">▶</span>` 
      : '<span class="arrow-placeholder" style="display: inline-block; width: 16px;"></span>';
    
    return (
      <div 
        className={`json-line ${line.path === selectedNodePath ? 'selected' : ''}`} 
        data-line={index + 1} 
        data-path={line.path} 
        data-level={line.level}
        data-bracket-open={line.isOpenBracket ? line.bracketType : undefined}
        data-bracket-close={line.isCloseBracket ? line.bracketType : undefined}
        onClick={(e) => handleNodeSelect(line, e)}
        style={{ cursor: 'pointer' }}
      >
        <div className="line-number">{index + 1}</div>
        <div className="line-content">
          <div 
            className="arrow-container" 
            dangerouslySetInnerHTML={{ __html: line.isCollapsible ? arrowHtml : '<span class="arrow-placeholder" style="display: inline-block; width: 16px;"></span>' }}
          />
          <div className="content" style={{ paddingLeft: `${indent}px` }} dangerouslySetInnerHTML={{ __html: line.content }} />
        </div>
      </div>
    );
  }, [selectedNodePath]);

  // 展开所有节点
  const expandAll = useCallback(() => {
    if (!containerRef.current) return;
    
    // 重置所有箭头为展开状态
    const arrows = containerRef.current.querySelectorAll('.arrow');
    arrows.forEach(arrow => {
      arrow.classList.remove('collapsed');
    });
    
    // 显示所有行
    const allLines = containerRef.current.querySelectorAll('.json-line');
    allLines.forEach(line => {
      line.classList.remove('hidden');
    });
    
    // 更新展开状态
    setIsAllExpanded(true);
  }, []);

  // 折叠所有节点
  const collapseAll = useCallback(() => {
    if (!containerRef.current) return;
    
    // 获取所有可折叠行
    const collapsibleLines = containerRef.current.querySelectorAll('.json-line[data-bracket-open]');
    
    collapsibleLines.forEach(line => {
      const arrow = line.querySelector('.arrow');
      if (arrow) {
        // 设置箭头为折叠状态
        arrow.classList.add('collapsed');
        
        // 获取括号类型和层级
        const bracketType = line.getAttribute('data-bracket-open');
        const closingBracket = bracketType === '{' ? '}' : ']';
        const startLevel = parseInt(line.getAttribute('data-level'));
        
        // 查找并隐藏所有嵌套行
        let currentLine = line.nextElementSibling;
        let foundClosing = false;
        
        while (currentLine && !foundClosing) {
          const currentLevel = parseInt(currentLine.getAttribute('data-level'));
          const isClosingBracket = currentLine.hasAttribute('data-bracket-close') && 
                                  currentLine.getAttribute('data-bracket-close') === closingBracket &&
                                  currentLevel === startLevel;
          
          if (isClosingBracket) {
            // 找到闭合括号
            foundClosing = true;
            currentLine.classList.add('hidden');
          } else if (currentLevel > startLevel) {
            // 这是嵌套行，隐藏它
            currentLine.classList.add('hidden');
          } else {
            // 同级或更高级别，停止隐藏
            break;
          }
          
          currentLine = currentLine.nextElementSibling;
        }
      }
    });
    
    // 更新展开状态
    setIsAllExpanded(false);
  }, []);
  
  // 切换展开/折叠状态
  const toggleExpandCollapse = useCallback(() => {
    if (isAllExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  }, [isAllExpanded, collapseAll, expandAll]);

  // 设置折叠功能
  const setupCollapsible = useCallback(() => {
    if (!containerRef.current) return;
    
    // 获取所有箭头元素
    const arrows = containerRef.current.querySelectorAll('.arrow');
    
    const handleCollapse = (e) => {
      const arrow = e.target;
      const path = arrow.getAttribute('data-path');
      const jsonLine = arrow.closest('.json-line');
      const isCollapsed = arrow.classList.contains('collapsed');
      
      // 切换箭头状态
      if (isCollapsed) {
        arrow.classList.remove('collapsed');
      } else {
        arrow.classList.add('collapsed');
      }
      
      // 查找括号类型
      const bracketType = jsonLine.getAttribute('data-bracket-open');
      const closingBracket = bracketType === '{' ? '}' : ']';
      
      // 查找起始层级
      const startLevel = parseInt(jsonLine.getAttribute('data-level'));
      
      // 获取所有行
      const allLines = containerRef.current.querySelectorAll('.json-line');
      let currentLine = jsonLine.nextElementSibling;
      let foundClosing = false;
      
      // 处理点击行之后的所有行
      while (currentLine && !foundClosing) {
        const currentLevel = parseInt(currentLine.getAttribute('data-level'));
        const isClosingBracket = currentLine.hasAttribute('data-bracket-close') && 
                                currentLine.getAttribute('data-bracket-close') === closingBracket &&
                                currentLevel === startLevel;
        
        if (isClosingBracket) {
          // 找到同级别的闭合括号
          foundClosing = true;
          if (isCollapsed) {
            currentLine.classList.remove('hidden');
          } else {
            currentLine.classList.add('hidden');
          }
        } else if (currentLevel > startLevel) {
          // 这是嵌套行，切换可见性
          if (isCollapsed) {
            currentLine.classList.remove('hidden');
          } else {
            currentLine.classList.add('hidden');
          }
        } else {
          // 同级或更高级别，停止隐藏
          break;
        }
        
        currentLine = currentLine.nextElementSibling;
      }
      
      // 阻止事件冒泡，防止触发节点选择
      e.stopPropagation();
    };
    
    // 为每个箭头添加点击事件
    arrows.forEach(arrow => {
      // 移除旧的事件监听器
      const oldClone = arrow.cloneNode(true);
      arrow.parentNode.replaceChild(oldClone, arrow);
      
      // 添加新的事件监听器
      oldClone.addEventListener('click', handleCollapse);
    });
  }, []);

  // 解析JSON并生成行
  useEffect(() => {
    if (!value) {
      setCollapsibleJson('');
      setJsonData(null);
      setJsonLines([]);
      return;
    }

    try {
      // 解析JSON
      const parsed = JSON.parse(value);
      setJsonData(parsed);
      
      // 生成行数据
      const lines = generateFlatJson(parsed);
      setJsonLines(lines);
      
      // 设置展开状态
      setTimeout(() => {
        if (containerRef.current) {
          setupCollapsible();
          if (!isAllExpanded) {
            collapseAll();
          }
        }
      }, 10);
    } catch (err) {
      // 如果解析失败，保持原样显示
      setCollapsibleJson(value);
      setJsonData(null);
      setJsonLines([]);
    }
  }, [value, generateFlatJson, setupCollapsible, collapseAll, isAllExpanded]);

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

  return (
    <Paper 
      elevation={3} 
      className={className}
      sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        transition: 'all 0.3s ease',
        background: darkMode ? 'var(--glass-bg-color)' : 'var(--glass-bg-color)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
      }}
    >
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
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={toggleExpandCollapse}
            sx={{ 
              color: darkMode ? 'white' : '#333',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            {isAllExpanded ? <UnfoldLessIcon fontSize="small" /> : <UnfoldMoreIcon fontSize="small" />}
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => setWrapLines(!wrapLines)}
            sx={{ 
              color: darkMode ? 'white' : '#333',
              backgroundColor: wrapLines ? (darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)') : (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <WrapTextIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ m: 2, mb: 0 }}>
          {error}
        </Alert>
      )}
      
      {/* 路径导航器 */}
      <PathNavigator 
        currentPath={currentPath} 
        onPathClick={handlePathClick} 
        darkMode={darkMode} 
      />
      
      <Divider sx={{ borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />
      
      {/* JSON内容区域 */}
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1, 
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'transparent',
          '& .json-line': {
            display: 'flex',
            alignItems: 'flex-start',
            padding: '2px 0',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            },
            '&.selected': {
              backgroundColor: darkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
            }
          },
          '& .line-number': {
            color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
            textAlign: 'right',
            paddingRight: '8px',
            userSelect: 'none',
            minWidth: '40px',
            fontSize: '12px',
          },
          '& .line-content': {
            display: 'flex',
            alignItems: 'center',
            flex: 1,
          },
          '& .arrow-container': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
          },
          '& .content': {
            flex: '1 1 auto',
            whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
            wordBreak: wrapLines ? 'break-word' : 'normal',
            overflowWrap: wrapLines ? 'break-word' : 'normal',
            color: darkMode ? 'white' : '#333',
          },
          '& .json-comma': {
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          },
          '& .json-colon': {
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          },
          '& .json-key': {
            color: darkMode ? '#ff9966' : '#e07c4c',
          },
          '& .json-string': {
            color: darkMode ? '#98c379' : '#50a14f',
          },
          '& .json-number': {
            color: darkMode ? '#d19a66' : '#c18401',
          },
          '& .json-boolean': {
            color: darkMode ? '#56b6c2' : '#0184bc',
          },
          '& .json-null': {
            color: darkMode ? '#56b6c2' : '#0184bc',
          },
          '& .json-bracket': {
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          },
          '& .arrow': {
            cursor: 'pointer',
            userSelect: 'none',
            color: darkMode ? 'white' : '#333',
            transition: 'transform 0.2s ease',
            transform: 'rotate(90deg)',
            display: 'inline-block',
            width: '16px',
            height: '16px',
            textAlign: 'center',
            lineHeight: '16px',
            fontSize: '12px',
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }
          },
          '& .arrow.collapsed': {
            transform: 'rotate(0deg)',
          },
          '& .hidden': {
            display: 'none',
          },
        }}
      >
        {jsonLines.length > 0 ? (
          renderVirtualizedContent
        ) : (
          <SyntaxHighlighter 
            language="json" 
            style={darkMode ? atomOneDark : atomOneLight}
            customStyle={{
              margin: 0,
              padding: '16px',
              backgroundColor: 'transparent',
              height: '100%',
              color: darkMode ? 'white' : '#333',
              background: 'transparent',
            }}
            showLineNumbers
            wrapLines={wrapLines}
            wrapLongLines={wrapLines}
            lineNumberStyle={{
              textAlign: 'right',
              paddingRight: '16px',
              color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
            }}
          >
            {value || ''}
          </SyntaxHighlighter>
        )}
      </Box>
      
      {/* 内联编辑器 */}
      {selectedNode && onUpdate && (
        <JsonInlineEditor
          path={selectedNodePath}
          value={selectedNodeValue}
          parentType={selectedNodeParentType}
          keyName={selectedNodeKey}
          onUpdate={handleJsonUpdate}
          onDelete={(path) => handleJsonUpdate(path, null, 'delete')}
          onAdd={(path, newValue) => handleJsonUpdate(path, newValue, 'add')}
          darkMode={darkMode}
        />
      )}
    </Paper>
  );
};

export default JsonViewer;