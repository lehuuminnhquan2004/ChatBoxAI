import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import ChatBox from './ChatBox';
import authService from '../services/authService';

function Home() {
  const user = authService.getUser();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#1a237e' }}>
        Chào mừng, {user?.tensv}!
      </Typography>

      <Grid container spacing={3}>
        {/* Thông tin sinh viên */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img
                src={user?.hinhanh ? `${process.env.REACT_APP_API_URL}/images/${user.hinhanh}` : '/default-avatar.png'}
                alt="Avatar"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  marginRight: '1rem',
                  objectFit: 'cover'
                }}
              />
              <div>
                <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                  {user?.tensv}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {user?.masv}
                </Typography>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <span style={{ fontWeight: 'bold' }}>Lớp:</span> {user?.lop}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <span style={{ fontWeight: 'bold' }}>Chuyên ngành:</span> {user?.chuyennganh}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* Thời khoá biểu hôm nay */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold' }}>
              Lịch học hôm nay
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Chức năng đang được phát triển...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <ChatBox masv={user?.masv} />
    </Box>
  );
}

export default Home; 