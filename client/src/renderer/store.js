import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Chat configuration state
      apiKey: '',
      apiKeyShow: false,
      url: 'https://ai.aiql.com',
      path: '/v1/chat/completions',
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      authPrefix: 'Bearer',
      contentType: 'application/json',
      maxTokensType: 'max_tokens',
      maxTokensValue: '',
      temperature: '',
      topP: '',
      method: 'POST',
      stream: true,
      mcp: false,
      
      // UI state
      configDialog: false,
      configHistory: false,
      resourceDialog: false,
      agentDialog: false,
      
      // Chat state
      messages: [],
      userMessage: '',
      images: [],
      base64Image: '',
      isGenerating: false,
      snackbar: { open: false, message: '', type: 'info' },
      
      // History state
      history: [],
      
      // Resources state
      resources: [],
      
      // Agent state
      columns: [
        {
          key: 'PROMPT',
          cards: [{ id: "1", title: "Prompt 1", description: "", state: "PROMPT" }],
          isAddVisible: false,
        },
        {
          key: 'BACKUP',
          cards: [],
          isAddVisible: false,
        }
      ],
      editingCard: null,
      editDialog: false,
      
      // Setters for state
      setApiKey: (apiKey) => set({ apiKey }),
      setApiKeyShow: (apiKeyShow) => set({ apiKeyShow }),
      setUrl: (url) => set({ url }),
      setPath: (path) => set({ path }),
      setModel: (model) => set({ model }),
      setAuthPrefix: (authPrefix) => set({ authPrefix }),
      setContentType: (contentType) => set({ contentType }),
      setMaxTokensType: (maxTokensType) => set({ maxTokensType }),
      setMaxTokensValue: (maxTokensValue) => set({ maxTokensValue }),
      setTemperature: (temperature) => set({ temperature }),
      setTopP: (topP) => set({ topP }),
      setMethod: (method) => set({ method }),
      setStream: (stream) => set({ stream }),
      setMcp: (mcp) => set({ mcp }),
      
      setConfigDialog: (configDialog) => set({ configDialog }),
      setConfigHistory: (configHistory) => set({ configHistory }),
      setResourceDialog: (resourceDialog) => set({ resourceDialog }),
      setAgentDialog: (agentDialog) => set({ agentDialog }),
      
      setMessages: (messages) => set({ messages }),
      setUserMessage: (userMessage) => set({ userMessage }),
      setImages: (images) => set({ images }),
      setBase64Image: (base64Image) => set({ base64Image }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setSnackbar: (snackbar) => set({ snackbar }),
      
      setColumns: (columns) => set({ columns }),
      setEditingCard: (editingCard) => set({ editingCard }),
      setEditDialog: (editDialog) => set({ editDialog }),
      
      // Chat actions
      sendMessage: () => {
        const { userMessage, base64Image, messages } = get();
        if (!userMessage && !base64Image) return;

        let content;
        if (base64Image) {
          content = [
            { type: "image_url", image_url: { url: base64Image } },
            { type: "text", text: userMessage || '' }
          ];
        } else {
          content = userMessage;
        }

        const newMessages = [...messages, { role: 'user', content }];
        set({ 
          messages: newMessages,
          userMessage: '',
          base64Image: '',
          images: []
        });
        
        // If this is the first message, initialize the history
        if (messages.length === 0) {
          get().initHistory(newMessages);
        }
        
        return newMessages;
      },
      
      stopGeneration: () => {
        set({ 
          isGenerating: false,
          snackbar: {
            open: true,
            message: 'Generation stopped',
            type: 'info'
          }
        });
      },
      
      clearChat: () => {
        set({ 
          messages: [],
          snackbar: {
            open: true,
            message: 'Chat cleared',
            type: 'success'
          }
        });
      },
      
      regenerateMessage: () => {
        const { messages } = get();
        if (messages.length === 0) return;
        
        // Find the last user message
        let index = messages.length - 1;
        while (index >= 0 && messages[index].role !== 'user') {
          index--;
        }
        
        // When a user message is found, truncate everything after it
        if (index >= 0) {
          set({ messages: messages.slice(0, index + 1) });
        }
      },
      
      // API interaction
      createCompletion: async (conversation) => {
        const { 
          apiKey, url, path, model, authPrefix, contentType,
          maxTokensType, maxTokensValue, temperature, topP,
          method, stream, mcp, messages, isGenerating
        } = get();
        
        try {
          set({ isGenerating: true });

          const headers = {
            'Content-Type': contentType,
          };

          if (apiKey) {
            headers.Authorization = `${authPrefix} ${apiKey}`;
          }

          const body = {
            messages: conversation,
            model: model,
            stream: stream,
          };

          if (maxTokensValue) {
            body[maxTokensType] = parseInt(maxTokensValue);
          }

          if (temperature) {
            body.temperature = parseFloat(temperature);
          }

          if (topP) {
            body.top_p = parseFloat(topP);
          }

          const request = {
            headers: headers,
            method: method,
            body: JSON.stringify(body),
          };

          const response = await fetch(url + (path ? path : ''), request);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || response.statusText);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Cannot read the stream');
          }

          // Add the assistant message
          set({
            messages: [...messages, {
              role: 'assistant',
              content: '',
              reasoning_content: '',
              tool_calls: []
            }]
          });

          let buffer = '';
          const decoder = new TextDecoder();

          const readChunk = async () => {
            const { done, value } = await reader.read();
            
            if (done || !get().isGenerating) {
              reader.releaseLock();
              set({ isGenerating: false });
              return;
            }

            const chunk = decoder.decode(value);
            if (stream) {
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta || parsed.choices[0]?.message;
                    if (content) {
                      set(state => {
                        const newMessages = [...state.messages];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (content.content) {
                          lastMessage.content += content.content;
                        }
                        if (content.reasoning_content) {
                          lastMessage.reasoning_content += content.reasoning_content;
                        }
                        if (content.tool_calls) {
                          lastMessage.tool_calls = content.tool_calls;
                        }
                        return { messages: newMessages };
                      });
                    }
                  } catch (e) {
                    console.error('Error parsing JSON:', e);
                  }
                }
              }
            } else {
              try {
                const parsed = JSON.parse(chunk);
                const content = parsed.choices[0]?.message;
                if (content) {
                  set(state => {
                    const newMessages = [...state.messages];
                    const lastMessage = newMessages[newMessages.length - 1];
                    lastMessage.content = content.content;
                    lastMessage.reasoning_content = content.reasoning_content;
                    lastMessage.tool_calls = content.tool_calls;
                    return { messages: newMessages };
                  });
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }

            // Continue reading
            await readChunk();
          };

          await readChunk();
        } catch (error) {
          console.error('Error:', error);
          set({
            snackbar: {
              open: true,
              message: `Error: ${error.message}`,
              type: 'error'
            }
          });
        } finally {
          set({ isGenerating: false });
        }
      },
      
      // History actions
      initHistory: (conversation) => {
        const date = new Date().toLocaleString('en', { timeZoneName: 'short', hour12: false });
        set(state => ({
          history: [{ id: date, history: conversation }, ...state.history]
        }));
      },
      
      addToHistory: (conversation) => {
        set(state => {
          if (state.history.length > 0) {
            const updatedHistory = [...state.history];
            updatedHistory[0].history = conversation;
            return { history: updatedHistory };
          }
          return state;
        });
      },
      
      selectHistory: (index) => {
        const { history } = get();
        set({
          messages: history[index].history,
          configHistory: false
        });
        
        const selected = history[index];
        const newHistory = history.filter((_, i) => i !== index);
        set({ history: [selected, ...newHistory] });
      },
      
      deleteHistory: (index) => {
        set(state => ({
          history: state.history.filter((_, i) => i !== index)
        }));
      },
      
      downloadHistory: (index) => {
        const { history } = get();
        const name = history[index].id.replace(/[/: ]/g, '-');
        const blob = new Blob([JSON.stringify(history[index].history, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `history-${name}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      
      downloadAllHistory: () => {
        const { history } = get();
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'history.json';
        a.click();
        URL.revokeObjectURL(url);
      },
      
      // Resources actions
      addResource: (resource) => {
        set(state => ({
          resources: [...state.resources, resource]
        }));
      },
      
      deleteResource: (name) => {
        set(state => ({
          resources: state.resources.filter(r => r.name !== name)
        }));
      },
      
      useResource: (resource) => {
        if (resource.type === 'prompt') {
          set({
            userMessage: resource.content,
            resourceDialog: false
          });
        }
      },
      
      // Agent actions
      toggleColumnAddCard: (columnIndex) => {
        set(state => {
          const newColumns = [...state.columns];
          newColumns[columnIndex].isAddVisible = !newColumns[columnIndex].isAddVisible;
          return { columns: newColumns };
        });
      },
      
      addCard: (columnIndex, title) => {
        if (!title) return;
        
        set(state => {
          const newColumns = [...state.columns];
          const column = newColumns[columnIndex];
          const newCard = {
            id: "_" + Math.random().toString(36).substring(2, 11),
            state: column.key,
            title,
            description: "",
            refFile: null,
            refText: "",
            order: -1,
          };
          
          column.cards.unshift(newCard);
          column.isAddVisible = false;
          return { columns: newColumns };
        });
      },
      
      deleteCard: (columnIndex, cardIndex) => {
        set(state => {
          const newColumns = [...state.columns];
          newColumns[columnIndex].cards.splice(cardIndex, 1);
          return { columns: newColumns };
        });
      },
      
      editCard: (card) => {
        set({
          editingCard: { ...card },
          editDialog: true
        });
      },
      
      saveCard: () => {
        const { editingCard, columns } = get();
        if (!editingCard) return;
        
        set(state => {
          const newColumns = [...state.columns];
          for (const column of newColumns) {
            for (let i = 0; i < column.cards.length; i++) {
              if (column.cards[i].id === editingCard.id) {
                column.cards[i] = { ...editingCard };
                break;
              }
            }
          }
          
          return {
            columns: newColumns,
            editDialog: false
          };
        });
      },
      
      handleDragEnd: (result) => {
        if (!result.destination) return;
        
        const { columns } = get();
        const sourceColumn = columns.find(col => col.key === result.source.droppableId);
        const destColumn = columns.find(col => col.key === result.destination.droppableId);
        
        if (!sourceColumn || !destColumn) return;
        
        set(state => {
          const newColumns = [...state.columns];
          const sourceIndex = newColumns.findIndex(col => col.key === sourceColumn.key);
          const destIndex = newColumns.findIndex(col => col.key === destColumn.key);
          
          const sourceItems = [...newColumns[sourceIndex].cards];
          const destItems = sourceIndex === destIndex 
            ? sourceItems 
            : [...newColumns[destIndex].cards];
          
          const [removed] = sourceItems.splice(result.source.index, 1);
          removed.state = destColumn.key;
          destItems.splice(result.destination.index, 0, removed);
          
          if (sourceIndex === destIndex) {
            newColumns[sourceIndex].cards = destItems;
          } else {
            newColumns[sourceIndex].cards = sourceItems;
            newColumns[destIndex].cards = destItems;
          }
          
          return { columns: newColumns };
        });
      },
      
      resetAgentState: () => {
        set({
          columns: [
            {
              key: 'PROMPT',
              cards: [{ id: "1", title: "Prompt 1", description: "", state: "PROMPT" }],
              isAddVisible: false,
            },
            {
              key: 'BACKUP',
              cards: [],
              isAddVisible: false,
            }
          ]
        });
      },

      // Config actions
      resetState: () => {
        // Reset chat configuration
        set({
          apiKey: '',
          url: 'https://ai.aiql.com',
          path: '/v1/chat/completions',
          model: 'meta-llama/Llama-3.3-70B-Instruct',
          authPrefix: 'Bearer',
          contentType: 'application/json',
          maxTokensType: 'max_tokens',
          maxTokensValue: '',
          temperature: '',
          topP: '',
          method: 'POST',
          stream: true,
          mcp: false
        });
      },
      
      // Snackbar actions
      closeSnackbar: () => {
        set({
          snackbar: { ...get().snackbar, open: false }
        });
      }
    }),
    {
      name: 'chat-app-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        url: state.url,
        path: state.path,
        model: state.model,
        authPrefix: state.authPrefix,
        contentType: state.contentType,
        maxTokensType: state.maxTokensType,
        maxTokensValue: state.maxTokensValue,
        temperature: state.temperature,
        topP: state.topP,
        method: state.method,
        stream: state.stream,
        mcp: state.mcp,
        history: state.history,
        resources: state.resources,
        columns: state.columns
      })
    }
  )
);