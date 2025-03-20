import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import authService from '../services/authService';

function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = useCallback(() => {
    authService.logout();
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    // Kiểm tra token mỗi 10 giây
    const interval = setInterval(async () => {
      try {
        console.log('Đang kiểm tra token...');
        const isValid = await authService.verifyToken();
        console.log('Token hợp lệ:', isValid);
        if (!isValid) {
          handleLogout();
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra token:', error);
        // Nếu lỗi mạng, không tự động đăng xuất
        if (error.message !== 'Network Error') {
          handleLogout();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [handleLogout]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
    { text: 'Thời khoá biểu', icon: <CalendarIcon />, path: '/schedule' },
    // Thêm các menu items khác ở đây
  ];

  const drawer = (
    <div className="h-full bg-white">
      <div className="p-4">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-32 h-auto mx-auto"
        />
      </div>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            className="hover:bg-gray-100"
          >
            <ListItemIcon className="text-gray-600">
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" className="bg-white shadow-md" sx={{ backgroundColor: '#00dbff', height: '60px' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="text-gray-600"
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" className="flex-grow text-gray-800">
            {!isMobile && 'Hệ thống Chat AI'}
          </Typography>

          <div className="flex items-center">
            <button
              onClick={handleMenu}
              className="flex items-center px-3 py-1.5 bg-blue-700 hover:bg-blue-800 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Avatar
                src={user?.hinhanh ? `${process.env.REACT_APP_API_URL}/images/${user.hinhanh}` : null}
                alt={user?.tensv}
                className="w-8 h-8 mr-2 border-2 border-white"
              />
              {!isMobile && (
                <span className="text-white font-medium">{user?.tensv}</span>
              )}
            </button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              className="mt-2"
            >
              <MenuItem onClick={() => {
                navigate('/profile');
                handleClose();
              }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <span>Thông tin cá nhân</span>
              </MenuItem>
              <MenuItem onClick={() => {
                handleLogout();
                handleClose();
              }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <span>Đăng xuất</span>
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout; 