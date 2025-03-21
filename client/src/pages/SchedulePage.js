import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Button,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import axios from 'axios';
import authService from '../services/authService';

const API_URL = process.env.REACT_APP_API_URL;

function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const user = authService.getUser();

  useEffect(() => {
    const fetchSchedule = async () => {
      if (user?.masv) {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          console.log('Fetching schedule for:', user.masv); // Debug log
          const response = await axios.get(`${API_URL}/api/schedule/${user.masv}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('API Response:', response.data); // Debug log
          
          if (response.data && response.data.schedule) {
            // Đảm bảo dữ liệu có đúng format
            const formattedSchedule = response.data.schedule.map(item => ({
              ...item,
              Ca: parseInt(item.Ca),
              Thu: parseInt(item.Thu)
            }));
            
            console.log('Formatted Schedule:', formattedSchedule); // Debug log
            setSchedule(formattedSchedule);
            setSummary(response.data.summary);
          } else {
            setSchedule([]);
            setSummary(null);
          }
        } catch (error) {
          console.error('Lỗi khi lấy thời khóa biểu:', error);
          if (error.response) {
            console.error('Error response:', error.response.data);
          }
          setSchedule([]);
          setSummary(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSchedule();
  }, [user?.masv]);

  // Tạo mảng 4x7 để lưu thời khóa biểu (4 ca x 7 ngày)
  const createScheduleMatrix = () => {
    const matrix = Array(4).fill().map(() => Array(7).fill(''));
    const tooltipMatrix = Array(4).fill().map(() => Array(7).fill(''));
    
    if (schedule && schedule.length > 0) {
      // Tính toán ngày bắt đầu của tuần hiện tại
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Thứ 2
      startOfWeek.setHours(0, 0, 0, 0);

      // Điều chỉnh theo currentWeek
      const targetWeek = new Date(startOfWeek);
      targetWeek.setDate(startOfWeek.getDate() + (currentWeek * 7));

      // Tính ngày cuối tuần
      const endOfWeek = new Date(targetWeek);
      endOfWeek.setDate(targetWeek.getDate() + 6);

      schedule.forEach(item => {
        const ca = parseInt(item.Ca);
        const thu = parseInt(item.Thu);
        const startDate = new Date(item.ngaybatdau);
        const endDate = new Date(item.ngayketthuc);
        
        // Kiểm tra xem môn học có trong tuần này không
        const dayInWeek = new Date(targetWeek);
        dayInWeek.setDate(targetWeek.getDate() + (thu - 2)); // Chuyển từ thứ sang ngày trong tuần

        const isInDateRange = dayInWeek >= startDate && dayInWeek <= endDate;
        
        const rowIndex = ca - 1;
        const colIndex = thu - 2;
        
        if (!isNaN(rowIndex) && !isNaN(colIndex) && 
            rowIndex >= 0 && rowIndex < 4 && 
            colIndex >= 0 && colIndex < 7 && 
            isInDateRange) {
          const displayText = [
            item.tenmh,
            `Phòng: ${item.phong}`
          ].join('\n');
          matrix[rowIndex][colIndex] = displayText;

          const tooltipText = [
            `Môn học: ${item.tenmh}`,
            `Giảng viên: ${item.giangvien}`,
            `Phòng: ${item.phong}`,
            `Thời gian: ${item.thoigianhoc}`,
            `Ngày bắt đầu: ${new Date(item.ngaybatdau).toLocaleDateString('vi-VN')}`,
            `Ngày kết thúc: ${new Date(item.ngayketthuc).toLocaleDateString('vi-VN')}`
          ].join('\n');
          tooltipMatrix[rowIndex][colIndex] = tooltipText;
        }
      });
    }

    return { matrix, tooltipMatrix };
  };

  const getWeekRange = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Thứ 2
    startOfWeek.setHours(0, 0, 0, 0);

    // Điều chỉnh theo currentWeek
    const weekStart = new Date(startOfWeek);
    weekStart.setDate(startOfWeek.getDate() + (currentWeek * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return `${weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  const handleCurrentWeek = () => {
    setCurrentWeek(0);
  };

  // Debug log để kiểm tra dữ liệu
  useEffect(() => {
    console.log('Schedule data:', schedule);
    console.log('Schedule matrix:', createScheduleMatrix());
  }, [schedule, currentWeek]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const { matrix: scheduleMatrix, tooltipMatrix } = createScheduleMatrix();
  const days = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'];

  return (
    <Box sx={{ 
      p: 3,
      maxWidth: '100%',
      overflowX: 'auto',
      backgroundColor: '#f5f5f5',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarIcon sx={{ color: '#1a237e', fontSize: 32 }} />
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#1a237e', 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #1a237e 30%, #2196f3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Thời Khóa Biểu
                </Typography>
                {summary && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      color: '#666',
                      mt: 0.5
                    }}
                  >
                    Số môn học: {summary.soMonHoc} | 
                    Tổng số ca: {summary.tongSoCa}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Button
                variant="contained"
                onClick={handleCurrentWeek}
                sx={{ 
                  backgroundColor: '#1a237e',
                  color: 'white',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: '#0d47a1'
                  }
                }}
              >
                Tuần hiện tại
              </Button>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                overflow: 'hidden'
              }}>
                <IconButton 
                  onClick={handlePreviousWeek}
                  sx={{ 
                    color: '#1a237e',
                    borderRadius: 0,
                    borderRight: '1px solid #e0e0e0',
                    height: '40px',
                    width: '40px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                
                <Typography sx={{ 
                  color: '#1a237e',
                  fontWeight: 500,
                  px: 3,
                  fontSize: '0.95rem'
                }}>
                  {getWeekRange()}
                </Typography>
                
                <IconButton 
                  onClick={handleNextWeek}
                  sx={{ 
                    color: '#1a237e',
                    borderRadius: 0,
                    borderLeft: '1px solid #e0e0e0',
                    height: '40px',
                    width: '40px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden',
          minWidth: '1000px',
          backgroundColor: 'white',
          margin: '0 auto',
          maxWidth: '1200px'
        }}
      >
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  backgroundColor: '#1a237e',
                  color: 'white',
                  textAlign: 'center',
                  width: '100px',
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  fontSize: '1rem',
                  py: 1.5,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                Ca
              </TableCell>
              {days.map((day, index) => (
                <TableCell 
                  key={index}
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: '#1a237e',
                    color: 'white',
                    textAlign: 'center',
                    width: 'calc((100% - 100px) / 7)',
                    py: 1.5,
                    fontSize: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {scheduleMatrix.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: '#f8f9fa'
                  }
                }}
              >
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: '#e3f2fd',
                    textAlign: 'center',
                    width: '100px',
                    py: 1.5,
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    fontSize: '1rem',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  Ca {rowIndex + 1}
                </TableCell>
                {row.map((cell, colIndex) => (
                  <TableCell 
                    key={colIndex}
                    sx={{ 
                      textAlign: 'left',
                      whiteSpace: 'pre-line',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '120px',
                      verticalAlign: 'top',
                      background: cell ? 'linear-gradient(45deg, #e3f2fd 30%, #bbdefb 90%)' : 'white',
                      py: 2,
                      px: 3,
                      border: '1px solid #e0e0e0',
                      fontSize: '0.95rem',
                      width: 'calc((100% - 100px) / 7)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: cell ? 'linear-gradient(45deg, #bbdefb 30%, #90caf9 90%)' : '#f5f5f5',
                        transform: 'scale(1.01)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    {cell ? (
                      <Tooltip 
                        title={
                          <Box sx={{ 
                            p: 1.5,
                            backgroundColor: 'rgba(255, 249, 196, 0.95)',
                            borderRadius: 1,
                            width: 'auto',
                            minWidth: '200px',
                            maxWidth: '400px',
                            border: '1px solid #ffd54f',
                            position: 'relative'
                          }}>
                            <Typography variant="body2" sx={{ 
                              whiteSpace: 'nowrap',
                              color: '#333',
                              lineHeight: 1.6,
                              fontSize: '0.85rem',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              '& strong': {
                                color: '#1a237e',
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                              }
                            }}>
                              {tooltipMatrix[rowIndex][colIndex].split('\n').map((line, index) => {
                                const [label, value] = line.split(': ');
                                return (
                                  <Box key={index} sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                    <strong>{label}:</strong>
                                    <span style={{ marginLeft: '4px' }}>{value}</span>
                                  </Box>
                                );
                              })}
                            </Typography>
                          </Box>
                        }
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              bgcolor: 'transparent',
                              '& .MuiTooltip-arrow': {
                                display: 'none'
                              }
                            }
                          }
                        }}
                      >
                        <Box sx={{ 
                          width: '100%', 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>{cell}</Box>
                      </Tooltip>
                    ) : (
                      <Box sx={{ 
                        width: '100%', 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#999'
                      }}>
                        -
                      </Box>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default SchedulePage; 