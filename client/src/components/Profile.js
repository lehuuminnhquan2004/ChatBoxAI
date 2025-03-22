import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Avatar, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Fade, Zoom } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import MainLayout from '../layouts/MainLayout';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    sdt: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Fetch user data when component mounts
  const fetchUserData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.masv) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/students/${storedUser.masv}`
      );
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setEditData({
          sdt: userData.sdt || '',
          email: userData.email || '',
        });
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData));
        setError(''); // Clear any existing errors
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use stored user data as fallback
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
        setEditData({
          sdt: storedUser.sdt || '',
          email: storedUser.email || '',
        });
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('masv', user.masv);

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/students/upload-avatar`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          // Update user data immediately
          const updatedUser = { ...user, hinhanh: response.data.filename };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          setSuccess('Cập nhật ảnh đại diện thành công!');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEdit = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Vui lòng đăng nhập lại');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Validate phone number
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(editData.sdt)) {
        setError('Số điện thoại không hợp lệ (phải có 10 chữ số)');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        setError('Email không hợp lệ');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/students/${storedUser.masv}`,
        {
          sdt: editData.sdt,
          email: editData.email
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        setSuccess('Lưu thông tin thành công!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Lưu thông tin không thành công!';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Add handler for closing edit dialog
  const handleCloseEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset edit data to current user values
    setEditData({
      sdt: user?.sdt || '',
      email: user?.email || ''
    });
  };

  // Show loading state while fetching initial data
  if (!user) {
    return (
      <MainLayout>
        <Box className="p-6 flex justify-center items-center">
          <Typography>Đang tải thông tin...</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Fade in={true} timeout={800}>
        <Box className="p-6">
          <Paper className="profile-paper p-8 max-w-3xl mx-auto" elevation={4}>
            <Typography variant="h4" className="text-center mb-6 font-bold profile-title">
              📚 Hồ sơ sinh viên
            </Typography>

            {error && (
              <Zoom in={true}>
                <Typography 
                  color="error" 
                  className="alert error mb-4 text-center"
                  style={{
                    padding: '10px',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                    marginBottom: '20px'
                  }}
                >
                  {error}
                </Typography>
              </Zoom>
            )}

            {success && (
              <Zoom in={true}>
                <Typography 
                  color="success" 
                  className="alert success mb-4 text-center"
                  style={{
                    padding: '10px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '4px',
                    marginBottom: '20px'
                  }}
                >
                  {success}
                </Typography>
              </Zoom>
            )}

            <Grid container spacing={4}>
              {/* Avatar và thông tin cơ bản */}
              <Grid item xs={12} className="flex justify-center mb-4 relative">
                <div 
                  className="avatar-container"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <Avatar
                    src={user?.hinhanh ? `${process.env.REACT_APP_API_URL}/images/${user.hinhanh}` : '/default-avatar.png'}
                    alt="Avatar"
                    className={`profile-avatar ${isHovered ? 'avatar-hovered' : ''}`}
                    sx={{ width: 150, height: 150 }}
                  />
                  <input
                    accept="image/*"
                    type="file"
                    id="icon-button-file"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <Fade in={isHovered}>
                    <label htmlFor="icon-button-file" className="avatar-upload-button">
                      <IconButton 
                        color="primary" 
                        aria-label="upload picture" 
                        component="span"
                        className="bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                  </Fade>
                </div>
              </Grid>

              {/* Thông tin chi tiết */}
              <Grid item xs={12}>
                <Box className="info-container space-y-4">
                  <InfoRow label="Họ và tên" value={user?.tensv} />
                  <InfoRow label="Lớp" value={user?.lop} />
                  <InfoRow label="Mã số sinh viên" value={user?.masv} />
                  <InfoRow label="Giới tính" value={user?.gioitinh} />
                  <InfoRow label="Ngày sinh" value={user?.ngaysinh} />
                  <InfoRow label="Chuyên ngành" value={user?.chuyennganh} />
                  <InfoRow 
                    label="Số điện thoại" 
                    value={user?.sdt}
                    editable
                    onClick={() => setIsEditing(true)}
                  />
                  <InfoRow 
                    label="Email" 
                    value={user?.email}
                    editable
                    onClick={() => setIsEditing(true)}
                  />
                </Box>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} className="flex justify-center gap-4">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                  className="action-button edit-button"
                  startIcon={<EditIcon />}
                >
                  Chỉnh sửa thông tin liên hệ
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => navigate('/change-password')}
                  className="action-button password-button"
                >
                  Đổi mật khẩu
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>

      {/* Dialog chỉnh sửa thông tin */}
      <Dialog 
        open={isEditing} 
        onClose={handleCloseEdit}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            padding: '16px'
          }
        }}
      >
        <DialogTitle
          style={{
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1976d2',
            paddingBottom: '16px',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          Chỉnh sửa thông tin liên hệ
        </DialogTitle>
        <DialogContent style={{ marginTop: '20px', marginBottom: '10px' }}>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <TextField
              fullWidth
              label="Số điện thoại"
              value={editData.sdt}
              onChange={(e) => setEditData({ ...editData, sdt: e.target.value })}
              variant="outlined"
              InputProps={{
                style: {
                  borderRadius: '8px',
                  fontSize: '16px'
                }
              }}
              InputLabelProps={{
                style: {
                  fontSize: '16px'
                }
              }}
            />
            <TextField
              fullWidth
              label="Email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              variant="outlined"
              InputProps={{
                style: {
                  borderRadius: '8px',
                  fontSize: '16px'
                }
              }}
              InputLabelProps={{
                style: {
                  fontSize: '16px'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions 
          style={{
            padding: '16px',
            borderTop: '1px solid #e0e0e0',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          <Button 
            onClick={handleCloseEdit}
            variant="outlined"
            style={{
              borderRadius: '8px',
              padding: '8px 24px',
              fontSize: '16px',
              textTransform: 'none',
              borderColor: '#1976d2',
              color: '#1976d2'
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleEdit}
            variant="contained" 
            color="primary"
            style={{
              borderRadius: '8px',
              padding: '8px 24px',
              fontSize: '16px',
              textTransform: 'none',
              backgroundColor: '#1976d2'
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

// Component hiển thị từng dòng thông tin
function InfoRow({ label, value, editable, onClick }) {
  return (
    <Box 
      className={`info-row ${editable ? 'editable' : ''}`}
      onClick={onClick}
    >
      <Typography className="info-label">{label}:</Typography>
      <Typography className="info-value">{value}</Typography>
      {editable && (
        <Typography color="primary" className="edit-indicator">
          <EditIcon fontSize="small" className="edit-icon" />
          Chỉnh sửa
        </Typography>
      )}
    </Box>
  );
}

export default Profile; 