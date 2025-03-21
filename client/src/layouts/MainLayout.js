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

// Định nghĩa chiều rộng của sidebar
const drawerWidth = 240;

// Component chính MainLayout - Layout chung cho toàn bộ ứng dụng
function MainLayout({ children }) {
  // State để kiểm soát việc hiển thị/ẩn sidebar trên mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  // State để kiểm soát menu dropdown của user
  const [anchorEl, setAnchorEl] = useState(null);
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
    <div className="h-full bg-white">
      {/* Logo */}
      <div className="p-4">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-32 h-auto mx-auto"
        />
      </div>
      {/* Danh sách menu items */}
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

  // Render layout chính
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Thanh điều hướng trên cùng */}
      <AppBar position="fixed" className="bg-white shadow-md" sx={{ backgroundColor: '#00dbff', height: '60px' }}>
        <Toolbar>
          {/* Nút menu cho mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="text-gray-600"
          >
            <MenuIcon />
          </IconButton>
          
          {/* Tiêu đề */}
          <Typography variant="h6" noWrap component="div" className="flex-grow text-gray-800">
            {!isMobile && 'Hệ thống Chat AI'}
          </Typography>

          {/* Avatar và tên user */}
          <div className="flex items-center">
            <button
              onClick={handleMenu}
              className="flex items-center px-2 py-1 bg-blue-700 hover:bg-blue-800 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Avatar
                src={user?.hinhanh ? `${process.env.REACT_APP_API_URL}/images/${user.hinhanh}` : null}
                alt={user?.tensv}
                className="w-6 h-6 mr-2 border-2 border-white"
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

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Drawer cho desktop - hiển thị cố định */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '60px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout; 