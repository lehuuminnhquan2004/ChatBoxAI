import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  TextField,
  IconButton,
  Typography,
  Fab,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import axios from 'axios';
import './ChatBox.css';

// Lấy API URL từ biến môi trường
const API_URL = process.env.REACT_APP_API_URL;

function ChatBox({ masv }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (isOpen && masv) {
        try {
          const response = await axios.get(`${API_URL}/api/chat/history/${masv}`);
          const history = response.data.map(item => [
            { text: item.nguoidung_chat, isUser: true },
            { text: item.ai_rep, isUser: false }
          ]).flat();
          setMessages(history);
        } catch (error) {
          console.error('Lỗi khi lấy lịch sử chat:', error);
        }
      }
    };

    fetchHistory();
  }, [isOpen, masv]);

  const handleSend = async () => {
    if (!input.trim() || !masv) return;

    setMessages([...messages, { text: input, isUser: true }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: input,
        masv: masv
      });

      if (response.data && response.data.response) {
        setMessages(prev => [...prev, { text: response.data.response, isUser: false }]);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      setMessages(prev => [...prev, { 
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        isUser: false 
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chatbox-container">
      {isOpen ? (
        <Paper className="chatbox-paper" elevation={3}>
          <div className="chatbox-header">
            <Typography>Chat với AI</Typography>
            <IconButton 
              size="small" 
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          <div className="chatbox-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-container ${message.isUser ? 'user' : 'ai'}`}
              >
                {!message.isUser && (
                  <Avatar className="ai-avatar">AI</Avatar>
                )}
                <div className={`message-bubble ${message.isUser ? 'user' : 'ai'}`}>
                  <Typography variant="body2">{message.text}</Typography>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="loading-message">
                <div className="message-bubble ai">
                  <Typography variant="body2">Đang trả lời...</Typography>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbox-input">
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSend}>
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </div>
        </Paper>
      ) : (
        <Fab 
          color="primary" 
          onClick={() => setIsOpen(true)}
          className="chat-fab"
        >
          <ChatIcon />
        </Fab>
      )}
    </div>
  );
}

export default ChatBox; 