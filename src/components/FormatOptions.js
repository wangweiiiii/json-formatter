import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Switch,
  Tooltip,
  IconButton,
  Popover,
  Typography
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const FormatOptions = ({ 
  indentSize, 
  setIndentSize, 
  sortKeys, 
  setSortKeys,
  validateSchema,
  setValidateSchema,
  darkMode 
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  
  return (
    <>
      <Tooltip title="格式化选项">
        <IconButton 
          onClick={handleClick}
          sx={{ 
            color: darkMode ? 'white' : '#333',
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            },
            borderRadius: '8px',
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            p: 3,
            width: 300,
            backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: darkMode ? 'white' : '#333',
            borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            pb: 1
          }}
        >
          格式化选项
        </Typography>
        
        <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
          <InputLabel 
            id="indent-size-label"
            sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
          >
            缩进大小
          </InputLabel>
          <Select
            labelId="indent-size-label"
            value={indentSize}
            onChange={(e) => setIndentSize(e.target.value)}
            label="缩进大小"
            sx={{ 
              color: darkMode ? 'white' : '#333',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            <MenuItem value={2}>2 空格</MenuItem>
            <MenuItem value={4}>4 空格</MenuItem>
            <MenuItem value={8}>8 空格</MenuItem>
            <MenuItem value="tab">制表符</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={sortKeys} 
                onChange={(e) => setSortKeys(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: darkMode ? 'rgba(138, 101, 201, 1)' : 'rgba(91, 95, 199, 1)',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: darkMode ? 'rgba(138, 101, 201, 0.5)' : 'rgba(91, 95, 199, 0.5)',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: darkMode ? 'white' : '#333' }}>
                按键名排序
              </Typography>
            }
          />
          <Tooltip title="按字母顺序排列对象的键">
            <HelpOutlineIcon 
              fontSize="small" 
              sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }} 
            />
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={validateSchema} 
                onChange={(e) => setValidateSchema(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: darkMode ? 'rgba(138, 101, 201, 1)' : 'rgba(91, 95, 199, 1)',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: darkMode ? 'rgba(138, 101, 201, 0.5)' : 'rgba(91, 95, 199, 0.5)',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: darkMode ? 'white' : '#333' }}>
                验证 JSON Schema
              </Typography>
            }
          />
          <Tooltip title="根据提供的Schema验证JSON">
            <HelpOutlineIcon 
              fontSize="small" 
              sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }} 
            />
          </Tooltip>
        </Box>
      </Popover>
    </>
  );
};

export default FormatOptions; 