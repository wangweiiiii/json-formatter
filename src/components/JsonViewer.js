import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Paper, Box, Typography, Alert, IconButton } from '@mui/material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import atomOneLight from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import WrapTextIcon from '@mui/icons-material/WrapText';

// Register JSON language
SyntaxHighlighter.registerLanguage('json', json);

const JsonViewer = ({ value, error, className, darkMode }) => {
  const [collapsibleJson, setCollapsibleJson] = useState('');
  const containerRef = useRef(null);
  const [wrapLines, setWrapLines] = useState(false);
  const [isAllExpanded, setIsAllExpanded] = useState(true);

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
    
    const processValue = (value, path, level, isLast, keyName = null) => {
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
          bracketType: '['
        });
        
        // Array items
        value.forEach((item, index) => {
          const itemPath = `${path}.${index}`;
          const isLastItem = index === value.length - 1;
          processValue(item, itemPath, level + 1, isLastItem);
        });
        
        // Array closing
        lines.push({
          content: `<span class="json-bracket">]</span>${isLast ? '' : '<span class="json-comma">,</span>'}`,
          level,
          isCollapsible: false,
          path: `${path}.close`,
          isCloseBracket: true,
          bracketType: ']'
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
          bracketType: '{'
        });
        
        // Object properties
        const keys = Object.keys(value);
        keys.forEach((key, index) => {
          const propPath = `${path}.${key}`;
          const isLastProp = index === keys.length - 1;
          processValue(value[key], propPath, level + 1, isLastProp, key);
        });
        
        // Object closing
        lines.push({
          content: `<span class="json-bracket">}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`,
          level,
          isCollapsible: false,
          path: `${path}.close`,
          isCloseBracket: true,
          bracketType: '}'
        });
      } else {
        // Primitive value
        lines.push({
          content: keyName !== null 
            ? `<span class="json-key">"${keyName}"</span><span class="json-colon">: </span>${formatPrimitive(value)}${isLast ? '' : '<span class="json-comma">,</span>'}` 
            : `${formatPrimitive(value)}${isLast ? '' : '<span class="json-comma">,</span>'}`,
          level,
          isCollapsible: false,
          path
        });
      }
    };
    
    processValue(obj, 'root', 0, true);
    return lines;
  }, [formatPrimitive]);

  // Build HTML for all lines
  const buildJsonHtml = useCallback((lines) => {
    let html = '';
    lines.forEach((line, index) => {
      const indent = line.level * 20; // 20px per indent level
      const arrowHtml = line.isCollapsible 
        ? `<span class="arrow" data-path="${line.path}" style="display: inline-block; width: 16px; text-align: center;">▶</span>` 
        : '<span class="arrow-placeholder" style="display: inline-block; width: 16px;"></span>';
      
      // 确定是否应该隐藏这一行
      const isHidden = line.isCollapsible ? '' : '';
      
      html += `<div class="json-line${isHidden}" data-line="${index + 1}" data-path="${line.path}" data-level="${line.level}"`;
      
      if (line.isOpenBracket) {
        html += ` data-bracket-open="${line.bracketType}"`;
      }
      if (line.isCloseBracket) {
        html += ` data-bracket-close="${line.bracketType}"`;
      }
      
      html += `>
        <div class="line-number">${index + 1}</div>
        ${line.isCollapsible ? arrowHtml : '<span class="arrow-placeholder" style="display: inline-block; width: 16px;"></span>'}
        <div class="content" style="padding-left: ${indent}px">${line.content}</div>
      </div>`;
    });
    return html;
  }, []);

  // Setup collapsible functionality
  const setupCollapsible = useCallback(() => {
    if (!containerRef.current) return;
    
    // 先移除所有现有的事件监听器
    const oldArrows = containerRef.current.querySelectorAll('.arrow');
    oldArrows.forEach(arrow => {
      const oldClone = arrow.cloneNode(true);
      arrow.parentNode.replaceChild(oldClone, arrow);
    });
    
    // 重新获取箭头元素并添加事件监听器
    const arrows = containerRef.current.querySelectorAll('.arrow');
    
    const handleCollapse = (e) => {
      const arrow = e.target;
      const path = arrow.getAttribute('data-path');
      const jsonLine = arrow.closest('.json-line');
      const isCollapsed = arrow.classList.contains('collapsed');
      
      // Toggle arrow state
      if (isCollapsed) {
        arrow.classList.remove('collapsed');
      } else {
        arrow.classList.add('collapsed');
      }
      
      // Find the bracket type
      const bracketType = jsonLine.getAttribute('data-bracket-open');
      const closingBracket = bracketType === '{' ? '}' : ']';
      
      // Find start level
      const startLevel = parseInt(jsonLine.getAttribute('data-level'));
      
      // Get all lines
      const allLines = containerRef.current.querySelectorAll('.json-line');
      let currentLine = jsonLine.nextElementSibling;
      let foundClosing = false;
      
      // Process all lines after the clicked one
      while (currentLine && !foundClosing) {
        const currentLevel = parseInt(currentLine.getAttribute('data-level'));
        const isClosingBracket = currentLine.hasAttribute('data-bracket-close') && 
                                currentLine.getAttribute('data-bracket-close') === closingBracket &&
                                currentLevel === startLevel;
        
        if (isClosingBracket) {
          // Found the closing bracket at the same level
          foundClosing = true;
          if (isCollapsed) {
            currentLine.classList.remove('hidden');
          } else {
            currentLine.classList.add('hidden');
          }
        } else if (currentLevel > startLevel) {
          // This is a nested line, toggle visibility
          if (isCollapsed) {
            currentLine.classList.remove('hidden');
          } else {
            currentLine.classList.add('hidden');
          }
        } else {
          // Same or higher level, stop hiding
          break;
        }
        
        currentLine = currentLine.nextElementSibling;
      }
    };
    
    arrows.forEach(arrow => {
      arrow.addEventListener('click', handleCollapse);
    });
  }, []);

  // Expand all sections
  const expandAll = () => {
    if (!containerRef.current) return;
    
    // Reset all arrows to expanded state
    const arrows = containerRef.current.querySelectorAll('.arrow');
    arrows.forEach(arrow => {
      arrow.classList.remove('collapsed');
    });
    
    // Show all lines
    const allLines = containerRef.current.querySelectorAll('.json-line');
    allLines.forEach(line => {
      line.classList.remove('hidden');
    });
    
    // 更新展开状态
    setIsAllExpanded(true);
  };

  // Collapse all sections
  const collapseAll = () => {
    if (!containerRef.current) return;
    
    // Get all collapsible lines
    const collapsibleLines = containerRef.current.querySelectorAll('.json-line[data-bracket-open]');
    
    collapsibleLines.forEach(line => {
      const arrow = line.querySelector('.arrow');
      if (arrow) {
        // Set arrow to collapsed state
        arrow.classList.add('collapsed');
        
        // Get bracket type and level
        const bracketType = line.getAttribute('data-bracket-open');
        const closingBracket = bracketType === '{' ? '}' : ']';
        const startLevel = parseInt(line.getAttribute('data-level'));
        
        // Find and hide all nested lines
        let currentLine = line.nextElementSibling;
        let foundClosing = false;
        
        while (currentLine && !foundClosing) {
          const currentLevel = parseInt(currentLine.getAttribute('data-level'));
          const isClosingBracket = currentLine.hasAttribute('data-bracket-close') && 
                                  currentLine.getAttribute('data-bracket-close') === closingBracket &&
                                  currentLevel === startLevel;
          
          if (isClosingBracket) {
            // Found the closing bracket
            foundClosing = true;
            currentLine.classList.add('hidden');
          } else if (currentLevel > startLevel) {
            // This is a nested line, hide it
            currentLine.classList.add('hidden');
          } else {
            // Same or higher level, stop hiding
            break;
          }
          
          currentLine = currentLine.nextElementSibling;
        }
      }
    });
    
    // 更新展开状态
    setIsAllExpanded(false);
  };
  
  // 切换展开/折叠状态
  const toggleExpandCollapse = () => {
    if (isAllExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  };

  useEffect(() => {
    if (!value) {
      setCollapsibleJson('');
      return;
    }

    try {
      // Parse and format JSON
      const parsed = JSON.parse(value);
      const lines = generateFlatJson(parsed);
      const html = buildJsonHtml(lines);
      setCollapsibleJson(html);
      
      // Setup collapsible functionality after a small delay
      setTimeout(() => {
        setupCollapsible();
      }, 0);
    } catch (err) {
      // If parsing fails, display as is
      setCollapsibleJson(value);
    }
  }, [value, generateFlatJson, buildJsonHtml, setupCollapsible]);

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
      
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          position: 'relative',
          '& .json-viewer-container': {
            padding: '16px',
            fontFamily: "'Roboto Mono', monospace",
            fontSize: '14px',
            lineHeight: '1.5',
            color: darkMode ? 'white' : '#333',
          },
          '& .json-line': {
            display: 'flex',
            alignItems: 'flex-start',
          },
          '& .line-number': {
            color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
            textAlign: 'right',
            paddingRight: '16px',
            userSelect: 'none',
            minWidth: '40px',
          },
          '& .line-content': {
            display: 'flex',
            alignItems: 'flex-start',
            flex: 1,
          },
          '& .indent': {
            width: '20px',
            height: '20px',
            flexShrink: 0,
          },
          '& .toggle-arrow': {
            color: darkMode ? 'white' : '#333',
            fontSize: '10px',
            cursor: 'pointer',
            flexShrink: 0,
          },
          '& .arrow-placeholder': {
            visibility: 'hidden',
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
            marginRight: '5px',
            color: darkMode ? 'white' : '#333',
            transition: 'transform 0.2s ease',
            transform: 'rotate(90deg)',
            display: 'inline-block',
          },
          '& .arrow.collapsed': {
            transform: 'rotate(0deg)',
          },
          '& .hidden': {
            display: 'none',
          },
        }}
      >
        {collapsibleJson ? (
          <div className="json-viewer-container" dangerouslySetInnerHTML={{ __html: collapsibleJson }} />
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
    </Paper>
  );
};

export default JsonViewer;