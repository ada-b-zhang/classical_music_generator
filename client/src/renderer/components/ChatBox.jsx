import React from 'react';
import { Box, Avatar, Card, CardContent, IconButton, Divider, Typography } from '@mui/material';
import { ContentCopy, Delete, FormatAlignTop, Edit } from '@mui/icons-material';

const ChatBox = ({ messages, avatarSize = 36, onCopy, onEdit, onDelete, onReduce }) => {
  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isTool = message.role === 'tool';
    
    return (
      <Box key={index} sx={{ px: 2, py: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar
            sx={{ 
              width: avatarSize, 
              height: avatarSize,
              bgcolor: isUser ? 'primary.main' : isAssistant ? 'teal.main' : 'brown.main'
            }}
          >
            {isUser ? '👤' : isAssistant ? '⚡' : '🔄'}
          </Avatar>
          
          <Card sx={{ width: '100%', maxWidth: '100%' }}>
            <CardContent>
              {Array.isArray(message.content) ? (
                message.content.map((item, i) => (
                  <Box key={i}>
                    {item.type === 'image_url' ? (
                      <Box 
                        component="img" 
                        src={item.image_url.url} 
                        alt="Shared" 
                        sx={{ maxWidth: '100%', maxHeight: '300px', mb: 2 }} 
                      />
                    ) : (
                      <Typography variant="body1">{item.text}</Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body1">{message.content}</Typography>
              )}
              
              {message.reasoning_content && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontStyle: 'italic', 
                    color: 'text.secondary', 
                    mt: 2 
                  }}
                >
                  {message.reasoning_content}
                </Typography>
              )}
              
              {/* Render tool calls if present */}
              {message.tool_calls && message.tool_calls.length > 0 && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Tool Calls:</Typography>
                  {message.tool_calls.map((tool, i) => (
                    <Box key={i} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{tool.function.name}</strong>
                        ({tool.function.arguments})
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
            
            <Divider />
            
            <Box sx={{ display: 'flex', p: 1 }}>
              <IconButton size="small" onClick={() => onCopy(message)}>
                <ContentCopy fontSize="small" />
              </IconButton>
              
              {onEdit && isUser && (
                <IconButton size="small" onClick={() => onEdit(index)}>
                  <Edit fontSize="small" />
                </IconButton>
              )}
              
              {onDelete && (
                <IconButton size="small" onClick={() => onDelete(index)}>
                  <Delete fontSize="small" />
                </IconButton>
              )}
              
              {onReduce && index > 0 && (
                <IconButton size="small" onClick={() => onReduce(index)}>
                  <FormatAlignTop fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Card>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {messages.map((message, index) => renderMessage(message, index))}
    </Box>
  );
};

export default ChatBox;