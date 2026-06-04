import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { chatsAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Spinner, ErrorMsg } from '../../Shared';

const BACKEND_URL = 'https://market-place-api-xlwv.onrender.com';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetChatId = searchParams.get('chatId');

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');

  const socketRef = useRef(null);
  const messageEndRef = useRef(null);

  // 1. Establish global Socket connection on component load
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket'],
      upgrade: false
    });

    // Handle real-time incoming events
    socketRef.current.on('receive_message', (newMessage) => {
      // Append if message belongs to the current open chat window
      setActiveChat((currentActive) => {
        if (currentActive && currentActive._id === newMessage.chatId) {
          setMessages((prev) => {
            if (prev.some(msg => msg._id === newMessage._id)) return prev;
            return [...prev, newMessage];
          });
        }
        return currentActive;
      });

      // Refresh side list view to update text previews dynamically
      refreshConversationsList();
    });

    socketRef.current.on('error', (err) => {
      console.error('Socket server error:', err.message);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // 2. Fetch all user conversations on layout render
const refreshConversationsList = async () => {
    try {
      const data = await chatsAPI.listConversations();
      // Since your controller returns res.json({ success: true, chats }), 
      // make sure your API service handles unwrapping or read it directly:
      const chatList = data.chats || data || []; 
      setConversations(chatList);
      return chatList;
    } catch (err) {
      console.error('Failed fetching conversations:', err);
      setError('Could not load chat conversations history.');
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    refreshConversationsList().then((loadedChats) => {
      // If a chatId parameter is found in the URL, set it active immediately
      if (targetChatId && loadedChats) {
        const found = loadedChats.find(c => c._id === targetChatId);
        if (found) setActiveChat(found);
      }
    });
  }, [targetChatId]);

  // 3. Sync and fetch messages whenever the active room selection changes
  useEffect(() => {
    if (!activeChat) return;

    setLoadingMessages(true);
    chatsAPI.getMessages(activeChat._id)
      .then((data) => {
        setMessages(data.messages || []);
        // Command socket to subscribe into room channel group ID
        if (socketRef.current) {
          socketRef.current.emit('join_room', activeChat._id);
        }
      })
      .catch((err) => console.error('Error getting chat logs:', err))
      .finally(() => setLoadingMessages(false));

  }, [activeChat]);

  // 4. Smooth scrolling timeline maintainer anchor
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Send message event dispatch action handlers
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !socketRef.current) return;

    const messagePayload = {
      chatId: activeChat._id,
      senderId: user._id,
      text: text.trim()
    };

    // Emit live message to back-end socket pipe
    socketRef.current.emit('send_message', messagePayload);
    setText('');
  };












const getParticipantInfo = (chat) => {
    if (!chat || !user) return { name: 'User', avatar: '' };

    const currentUserId = user._id?.toString();

    // 1. Identify who the OTHER person is (If I am customer, pick provider. If I am provider, pick customer)
    const chatCustomerId = chat.customerId?._id?.toString() || chat.customerId?.toString();
    const chatProviderId = chat.providerId?._id?.toString() || chat.providerId?.toString();

    let counterpart = null;
    if (chatCustomerId === currentUserId) {
      counterpart = chat.providerId; // I am the customer, show provider details
    } else if (chatProviderId === currentUserId) {
      counterpart = chat.customerId; // I am the provider, show customer details
    } else {
      // Fallback fallback if IDs don't perfectly match session
      counterpart = chat.providerId || chat.customerId;
    }

    // 2. Handle cases where the backend has not populated the user profiles
    if (!counterpart) {
      return { name: 'Chat Participant', avatar: `https://ui-avatars.com/api/?name=Participant&background=e2e8f0&color=475569`, role: 'user' };
    }

    // If counterpart is just a raw ObjectId string (unpopulated backend query)
    if (typeof counterpart === 'string') {
      return { 
        name: `User (${counterpart.substring(0, 5)})`, 
        avatar: `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`, 
        role: 'user' 
      };
    }

    // 3. Extract details safely using properties from your User model
    const displayName = counterpart.name || counterpart.email || 'Anonymous User';

    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
    if (counterpart.profileImage) {
      avatarUrl = counterpart.profileImage.startsWith('http') 
        ? counterpart.profileImage 
        : `${BACKEND_URL}${counterpart.profileImage.startsWith('/') ? '' : '/'}${counterpart.profileImage}`;
    }

    return { 
      name: displayName, 
      avatar: avatarUrl, 
      role: counterpart.role || 'user' 
    };
  };










  if (loadingConversations) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4 h-[calc(100vh-5rem)] font-sans antialiased text-slate-800">
      <div className="w-full h-full bg-white border border-slate-200 rounded-2xl shadow-sm flex overflow-hidden">
        
        {/* ── LEFT: CONVERSATION PLUG LIST COLUMN ── */}
        <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Messages</h2>
          </div>

          <div className="grow overflow-y-auto divide-y divide-slate-100">
            {error && <div className="p-4"><ErrorMsg msg={error} /></div>}
            {conversations.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 italic text-center">No active chat channels found.</p>
            ) : (
              conversations.map((chat) => {
                const partner = getParticipantInfo(chat);
                const isSelected = activeChat?._id === chat._id;
                return (
                  <button
                    key={chat._id}
                    type="button"
                    onClick={() => {
                      setActiveChat(chat);
                      setSearchParams({ chatId: chat._id }); // Synchronize url context state
                    }}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${isSelected ? 'bg-amber-50/70 border-l-4 border-amber-500 pl-3' : 'hover:bg-slate-50'}`}
                  >
                    <img src={partner.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100" />
                    <div className="min-w-0 grow">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-sm text-slate-900 truncate">{partner.name}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 tracking-wider px-1.5 py-0.5 bg-slate-100 rounded-md">{partner.role}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {chat.lastMessage?.text || 'Click to begin messaging thread...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: MESSAGE FEED VIEW SPACE STACK ── */}
        <div className={`grow flex flex-col min-w-0 bg-slate-50/40 ${!activeChat ? 'hidden md:flex items-center justify-center text-slate-400 bg-slate-50/50' : 'flex'}`}>
          {activeChat ? (
            <>
              {/* Active Conversation Head Bar banner */}
              <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-3 shadow-xs">
                <button 
                  type="button"
                  onClick={() => {
                    setActiveChat(null);
                    setSearchParams({});
                  }}
                  className="md:hidden text-slate-500 font-bold hover:text-slate-800 text-lg pr-2"
                >
                  ←
                </button>
                <img src={getParticipantInfo(activeChat).avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-100 bg-slate-50" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">{getParticipantInfo(activeChat).name}</h3>
                  <span className="text-[11px] text-slate-400 font-medium capitalize">Inquire Context ID: {activeChat.serviceId?.title || 'General Marketplace Thread'}</span>
                </div>
              </div>

              {/* Central Scrolling Timeline Stream */}
              <div className="grow overflow-y-auto p-4 sm:p-6 flex flex-col gap-3">
                {loadingMessages ? (
                  <div className="my-auto"><Spinner /></div>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = msg.senderId === user._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${isOwnMessage ? 'bg-amber-600 text-white self-end rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200/80 self-start rounded-tl-none'}`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <span className={`text-[10px] mt-1 self-end font-medium block ${isOwnMessage ? 'text-amber-100' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Footer Input Box Panel form element */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your reply message here..."
                  className="grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="text-center p-8">
              <span className="text-4xl block mb-2">💬</span>
              <p className="text-sm font-semibold text-slate-500">Select a message thread room block to reveal interaction workspace views.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}



