import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const JsonInlineEditor = ({ 
  path, 
  value, 
  parentType, 
  keyName, 
  onUpdate, 
  onDelete, 
  onAdd,
  darkMode 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editKeyName, setEditKeyName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [valueType, setValueType] = useState('string');
  const inputRef = useRef(null);
  
  const isPrimitive = value === null || typeof value !== 'object';
  const isArray = Array.isArray(value);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (isPrimitive) {
      setEditValue(value === null ? 'null' : String(value));
    }
    setEditKeyName(keyName || '');
  }, [value, keyName, isPrimitive]);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const startEditing = () => {
    setIsEditing(true);
    handleMenuClose();
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue(value === null ? 'null' : String(value));
    setEditKeyName(keyName || '');
  };
  
  const saveEditing = () => {
    try {
      let parsedValue = editValue;
      
      // 尝试解析值
      if (editValue === 'null') {
        parsedValue = null;
      } else if (editValue === 'true') {
        parsedValue = true;
      } else if (editValue === 'false') {
        parsedValue = false;
      } else if (!isNaN(Number(editValue)) && editValue.trim() !== '') {
        parsedValue = Number(editValue);
      } else if (editValue.startsWith('{') || editValue.startsWith('[')) {
        parsedValue = JSON.parse(editValue);
      }
      
      onUpdate(path, editKeyName, parsedValue);
      setIsEditing(false);
    } catch (err) {
      alert(`无效的值: ${err.message}`);
    }
  };
  
  const handleDelete = () => {
    onDelete(path);
    handleMenuClose();
  };
  
  const openAddDialog = (type) => {
    setDialogType(type);
    setDialogOpen(true);
    setNewKeyName('');
    setNewValue('');
    setValueType('string');
    handleMenuClose();
  };
  
  const handleAddItem = () => {
    try {
      let parsedValue;
      
      // 根据选择的类型解析值
      switch (valueType) {
        case 'string':
          parsedValue = newValue;
          break;
        case 'number':
          parsedValue = Number(newValue);
          if (isNaN(parsedValue)) throw new Error('无效的数字');
          break;
        case 'boolean':
          parsedValue = newValue === 'true';
          break;
        case 'null':
          parsedValue = null;
          break;
        case 'object':
          parsedValue = {};
          break;
        case 'array':
          parsedValue = [];
          break;
        default:
          parsedValue = newValue;
      }
      
      onAdd(path, dialogType === 'property' ? newKeyName : undefined, parsedValue);
      setDialogOpen(false);
    } catch (err) {
      alert(`无效的值: ${err.message}`);
    }
  };
  
  const renderEditMode = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
      {parentType === 'object' && (
        <TextField
          size="small"
          value={editKeyName}
          onChange={(e) => setEditKeyName(e.target.value)}
          sx={{ 
            mr: 1, 
            width: '30%',
            '& .MuiOutlinedInput-root': {
              color: darkMode ? 'white' : '#333',
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              },
            },
          }}
          InputProps={{
            sx: { fontSize: '0.9rem' }
          }}
        />
      )}
      <TextField
        inputRef={inputRef}
        size="small"
        fullWidth
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        multiline={editValue && editValue.length > 30}
        maxRows={5}
        sx={{ 
          '& .MuiOutlinedInput-root': {
            color: darkMode ? 'white' : '#333',
            '& fieldset': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}
        InputProps={{
          sx: { fontSize: '0.9rem' }
        }}
      />
      <Tooltip title="保存">
        <IconButton 
          size="small" 
          onClick={saveEditing}
          sx={{ 
            ml: 1,
            color: darkMode ? 'rgba(138, 101, 201, 1)' : 'rgba(91, 95, 199, 1)',
          }}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="取消">
        <IconButton 
          size="small" 
          onClick={cancelEditing}
          sx={{ 
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
  
  const renderViewMode = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <Tooltip title="更多操作">
        <IconButton 
          size="small" 
          onClick={handleMenuOpen}
          sx={{ 
            color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              color: darkMode ? 'white' : '#333',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            visibility: 'hidden',
            '.json-line:hover &': {
              visibility: 'visible',
            }
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        {isPrimitive && (
          <MenuItem onClick={startEditing} sx={{ color: darkMode ? 'white' : '#333' }}>
            <ListItemIcon sx={{ color: darkMode ? 'white' : '#333' }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>编辑值</ListItemText>
          </MenuItem>
        )}
        
        {!isArray && parentType === 'object' && (
          <MenuItem onClick={startEditing} sx={{ color: darkMode ? 'white' : '#333' }}>
            <ListItemIcon sx={{ color: darkMode ? 'white' : '#333' }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>编辑键名</ListItemText>
          </MenuItem>
        )}
        
        {isArray && (
          <MenuItem onClick={() => openAddDialog('element')} sx={{ color: darkMode ? 'white' : '#333' }}>
            <ListItemIcon sx={{ color: darkMode ? 'white' : '#333' }}>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>添加元素</ListItemText>
          </MenuItem>
        )}
        
        {!isArray && typeof value === 'object' && value !== null && (
          <MenuItem onClick={() => openAddDialog('property')} sx={{ color: darkMode ? 'white' : '#333' }}>
            <ListItemIcon sx={{ color: darkMode ? 'white' : '#333' }}>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>添加属性</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDelete} sx={{ color: darkMode ? '#f44336' : '#f44336' }}>
          <ListItemIcon sx={{ color: darkMode ? '#f44336' : '#f44336' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
  
  const renderAddDialog = () => (
    <Dialog 
      open={dialogOpen} 
      onClose={() => setDialogOpen(false)}
      PaperProps={{
        sx: {
          backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ color: darkMode ? 'white' : '#333' }}>
        {dialogType === 'property' ? '添加属性' : '添加元素'}
      </DialogTitle>
      <DialogContent>
        {dialogType === 'property' && (
          <TextField
            autoFocus
            margin="dense"
            label="键名"
            fullWidth
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiInputLabel-root': {
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              },
              '& .MuiOutlinedInput-root': {
                color: darkMode ? 'white' : '#333',
                '& fieldset': {
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
              },
            }}
          />
        )}
        
        <Typography sx={{ mb: 1, color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
          值类型
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {['string', 'number', 'boolean', 'null', 'object', 'array'].map((type) => (
            <Button
              key={type}
              variant={valueType === type ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setValueType(type)}
              sx={{
                backgroundColor: valueType === type 
                  ? (darkMode ? 'rgba(138, 101, 201, 0.8)' : 'rgba(91, 95, 199, 0.8)') 
                  : 'transparent',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                color: valueType === type 
                  ? 'white' 
                  : (darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'),
              }}
            >
              {type}
            </Button>
          ))}
        </Box>
        
        {['string', 'number', 'boolean'].includes(valueType) && (
          <TextField
            margin="dense"
            label="值"
            fullWidth
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={
              valueType === 'boolean' 
                ? 'true 或 false' 
                : (valueType === 'number' ? '123' : '文本值')
            }
            sx={{ 
              '& .MuiInputLabel-root': {
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              },
              '& .MuiOutlinedInput-root': {
                color: darkMode ? 'white' : '#333',
                '& fieldset': {
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
              },
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setDialogOpen(false)}
          sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
        >
          取消
        </Button>
        <Button 
          onClick={handleAddItem}
          sx={{ color: darkMode ? 'rgba(138, 101, 201, 1)' : 'rgba(91, 95, 199, 1)' }}
        >
          添加
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <>
      {isEditing ? renderEditMode() : renderViewMode()}
      {renderAddDialog()}
    </>
  );
};

export default JsonInlineEditor; 