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
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import authService from '../services/authService';

// Định nghĩa chiều rộng của sidebar khi thu gọn và mở rộng
const drawerWidth = 240;
const collapsedDrawerWidth = 70;

// Component chính MainLayout - Layout chung cho toàn bộ ứng dụng
function MainLayout({ children }) {
  // State để kiểm soát việc hiển thị/ẩn sidebar trên mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  // State để kiểm soát menu dropdown của user
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  // Kiểm tra xem có phải đang ở chế độ mobile không (màn hình < 600px)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Hook để điều hướng trang
  const navigate = useNavigate();
  // Lấy thông tin user từ localStorage
  const user = authService.getUser();

  // Xử lý đóng/mở sidebar trên mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Xử lý mở menu dropdown của user
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Xử lý đóng menu dropdown
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Xử lý đăng xuất: xóa token, thông tin user và chuyển về trang login
  const handleLogout = useCallback(() => {
    authService.logout();
    navigate('/login');
  }, [navigate]);

  // Kiểm tra token định kỳ
  useEffect(() => {
    // Kiểm tra token mỗi 60 giây
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

  // Định nghĩa các mục menu trong sidebar
  const menuItems = [
    { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
    { text: 'Thời khoá biểu', icon: <CalendarIcon />, path: '/schedule' },
    // Thêm các menu items khác ở đây
  ];

  // Component sidebar chứa logo và menu items
  const drawer = (
    <div 
      className="h-full bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <Box 
        sx={{ 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          className="w-10 h-auto"
        />
      </Box>
      
      {/* Menu Items */}
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              mx: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              '&.Mui-selected': {
                backgroundColor: '#e3f2fd',
                '&:hover': {
                  backgroundColor: '#bbdefb',
                },
                '& .MuiListItemIcon-root': {
                  color: '#1976d2',
                },
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 40,
                color: '#757575',
                transition: 'color 0.2s'
              }}
            >
              {item.icon}
            </ListItemIcon>
            {isHovered && (
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </div>
  );

  // Render layout chính
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Thanh điều hướng trên cùng */}
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          height: '64px',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar>
          {/* Nút menu cho mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ color: '#757575' }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Tiêu đề */}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: '#1976d2',
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' },
              fontSize: '1.25rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              ml: { sm: isHovered ? `${drawerWidth}px` : `${collapsedDrawerWidth}px` },
              transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            Hệ Thống Chat AI
          </Typography>

          {/* Avatar và tên user */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={handleMenu}
              className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Avatar
                src={user?.hinhanh ? `${process.env.REACT_APP_API_URL}/images/${user.hinhanh}` : null}
                alt={user?.tensv}
                sx={{ 
                  width: 32, 
                  height: 32, 
                  mr: 1,
                  border: '2px solid white'
                }}
              />
              <span className="text-white font-medium text-sm">
                {!isMobile && user?.tensv}
              </span>
            </button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }
              }}
            >
              <MenuItem 
                onClick={() => {
                  navigate('/profile');
                  handleClose();
                }}
                sx={{ py: 1 }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" sx={{ color: '#757575' }} />
                </ListItemIcon>
                <span className="text-sm">Thông tin cá nhân</span>
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => {
                  handleLogout();
                  handleClose();
                }}
                sx={{ py: 1 }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: '#757575' }} />
                </ListItemIcon>
                <span className="text-sm">Đăng xuất</span>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: isHovered ? drawerWidth : collapsedDrawerWidth }, 
          flexShrink: { sm: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Drawer cho mobile - hiển thị tạm thời */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: isHovered ? drawerWidth : collapsedDrawerWidth,
              borderRight: '1px solid #e0e0e0',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Drawer cho desktop - hiển thị cố định */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: isHovered ? drawerWidth : collapsedDrawerWidth,
              borderRight: '1px solid #e0e0e0',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Phần nội dung chính */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isHovered ? drawerWidth : collapsedDrawerWidth}px)` },
          marginTop: '64px',
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout; 