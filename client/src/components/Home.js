import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import ChatBox from './ChatBox';

function Home() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <MainLayout>
      <Box className="p-6">
        <Typography variant="h4" className="mb-6 text-gray-800">
          Chào mừng, {user?.tensv}!
        </Typography>

        <Grid container spacing={3}>
          {/* Thông tin sinh viên */}
          <Grid item xs={12} md={4}>
            <Paper className="p-4 shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src={user?.hinhanh ? `${process.env.REACT_APP_API_URL}/images/${user.hinhanh}` : '/default-avatar.png'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full mr-4"
                />
                <div>
                  <Typography variant="h6" className="text-gray-800">
                    {user?.tensv}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {user?.masv}
                  </Typography>
                </div>
              </div>
              <div className="space-y-2">
                <Typography variant="body2" className="text-gray-600">
                  <span className="font-medium">Lớp:</span> {user?.lop}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  <span className="font-medium">Chuyên ngành:</span> {user?.chuyennganh}
                </Typography>
              </div>
            </Paper>
          </Grid>

          {/* Thời khoá biểu hôm nay */}
          <Grid item xs={12} md={8}>
            <Paper className="p-4 shadow-md">
              <Typography variant="h6" className="mb-4 text-gray-800">
                Lịch học hôm nay
              </Typography>
              <Typography variant="body1" className="text-gray-600">
                Chức năng đang được phát triển...
              </Typography>
            </Paper>
          </Grid>

          
        </Grid>
      </Box>
      <ChatBox masv={user.masv} />
    </MainLayout>
      
  );
}

export default Home; 