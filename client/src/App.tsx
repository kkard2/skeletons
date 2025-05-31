import { useEffect, useReducer } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Socket } from 'socket.io-client';

interface Channel {
    id: string;
    name: string;
    ownerId: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
}

interface User {
    id: string;
    name: string;
}

interface AppState {
    currentChannelId: string | null;
    channels: Channel[];
    // TODO(kk): cache messages for other channels,
    //           currently need to wait round-trip to display when switching
    messages: Message[];
    users: User[];
    socket: Socket | null;
}

// idk if i like this tbh
type Action =
    | { type: 'LOGIN'; user: User; token: string }
    | { type: 'LOGOUT' }
    | { type: 'SET_CHANNELS'; channels: Channel[] }
    | { type: 'SET_CURRENT_CHANNEL'; channelId: string }
    | { type: 'SET_MESSAGES'; messages: Message[] }
    | { type: 'ADD_MESSAGE'; message: Message }
    | { type: 'DELETE_MESSAGE'; messageId: string }
    | { type: 'SET_CHANNEL_USERS'; users: ChannelUser[] }
    | { type: 'SET_SOCKET'; socket: Socket }
    | { type: 'REMOVE_CHANNEL_USER'; userId: string }
    | { type: 'ADD_CHANNEL_USER'; user: ChannelUser };

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (state.auth.token && !state.socket) {
            const socket = io('http://localhost:3000', {
                auth: { token: state.auth.token }
            });
            dispatch({ type: 'SET_SOCKET', socket });
        }
    }, [state.auth.token, state.socket]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                    <Route path="/channels/:channelId" element={<RequireAuth><ChannelView /></RequireAuth>} />
                    <Route path="*" element={<Navigate to={state.auth.user ? '/channels/c1' : '/login'} />} />
                </Routes>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;


// BELOW: chatgpt slop
/*
// client/src/App.tsx

import React, { useEffect, useReducer, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import type { JSX } from 'react/jsx-runtime';
import { io, Socket } from 'socket.io-client';

/////////////////////
// Types

interface User {
    id: string;
    username: string;
    roles: string[]; // e.g. ['admin']
}

interface Channel {
    id: string;
    name: string;
    ownerId: string;
}

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    deleted: boolean;
    timestamp: string;
}

interface ChannelUser {
    id: string;
    username: string;
    roles: string[]; // e.g. ['owner']
}

interface AuthState {
    user: User | null;
    token: string | null;
}

interface AppState {
    auth: AuthState;
    channels: Channel[];
    currentChannelId: string | null;
    messages: Message[];
    channelUsers: ChannelUser[];
    socket: Socket | null;
}

type Action =
    | { type: 'LOGIN'; user: User; token: string }
    | { type: 'LOGOUT' }
    | { type: 'SET_CHANNELS'; channels: Channel[] }
    | { type: 'SET_CURRENT_CHANNEL'; channelId: string }
    | { type: 'SET_MESSAGES'; messages: Message[] }
    | { type: 'ADD_MESSAGE'; message: Message }
    | { type: 'DELETE_MESSAGE'; messageId: string }
    | { type: 'SET_CHANNEL_USERS'; users: ChannelUser[] }
    | { type: 'SET_SOCKET'; socket: Socket }
    | { type: 'REMOVE_CHANNEL_USER'; userId: string }
    | { type: 'ADD_CHANNEL_USER'; user: ChannelUser };

//////////////////////
// Context & Reducer

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

const initialState: AppState = {
    auth: { user: null, token: null },
    channels: [],
    currentChannelId: null,
    messages: [],
    channelUsers: [],
    socket: null,
};

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, auth: { user: action.user, token: action.token } };
        case 'LOGOUT':
            if (state.socket) state.socket.disconnect();
            return { ...initialState, socket: null };
        case 'SET_CHANNELS':
            return { ...state, channels: action.channels };
        case 'SET_CURRENT_CHANNEL':
            return { ...state, currentChannelId: action.channelId, messages: [], channelUsers: [] };
        case 'SET_MESSAGES':
            return { ...state, messages: action.messages };
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.message] };
        case 'DELETE_MESSAGE':
            return {
                ...state,
                messages: state.messages.map(m =>
                    m.id === action.messageId ? { ...m, content: '[deleted]', deleted: true } : m
                )
            };
        case 'SET_CHANNEL_USERS':
            return { ...state, channelUsers: action.users };
        case 'SET_SOCKET':
            return { ...state, socket: action.socket };
        case 'REMOVE_CHANNEL_USER':
            return { ...state, channelUsers: state.channelUsers.filter(u => u.id !== action.userId) };
        case 'ADD_CHANNEL_USER':
            return { ...state, channelUsers: [...state.channelUsers, action.user] };
        default:
            return state;
    }
}

function useAppContext() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used inside AppProvider');
    return context;
}

///////////////////////
// API placeholders

async function apiLogin(username: string, password: string): Promise<{ user: User; token: string }> {
    // Replace with real API call
    return { user: { id: 'u1', username, roles: [] }, token: 'fake-jwt-token' };
}

async function apiFetchChannels(token: string): Promise<Channel[]> {
    // Replace with real API call
    return [
        { id: 'c1', name: 'General', ownerId: 'u1' },
        { id: 'c2', name: 'Random', ownerId: 'u2' }
    ];
}

async function apiFetchMessages(token: string, channelId: string): Promise<Message[]> {
    // Replace with real API call
    return [];
}

async function apiFetchChannelUsers(token: string, channelId: string): Promise<ChannelUser[]> {
    // Replace with real API call
    return [];
}

//////////////////////
// Components

function LoginPage() {
    const { dispatch } = useAppContext();
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as typeof e.target & {
            username: { value: string };
            password: { value: string };
        };
        const username = form.username.value;
        const password = form.password.value;

        const { user, token } = await apiLogin(username, password);
        dispatch({ type: 'LOGIN', user, token });
        navigate('/channels/c1');
    };

    return (
        <form onSubmit={onSubmit}>
            <input name="username" placeholder="Username" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
    );
}

function ChannelListDrawer() {
    const { state, dispatch } = useAppContext();

    const onSelect = (id: string) => {
        dispatch({ type: 'SET_CURRENT_CHANNEL', channelId: id });
    };

    return (
        <div style={{ width: 200, borderRight: '1px solid #ccc' }}>
            <h3>Channels</h3>
            <ul>
                {state.channels.map(c => (
                    <li key={c.id}>
                        <button
                            style={{ fontWeight: c.id === state.currentChannelId ? 'bold' : 'normal' }}
                            onClick={() => onSelect(c.id)}
                        >
                            {c.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MessageView() {
    const { state, dispatch } = useAppContext();

    const onDelete = (messageId: string) => {
        if (!state.auth.user) return;
        const message = state.messages.find(m => m.id === messageId);
        if (!message || message.senderId !== state.auth.user.id) return;
        dispatch({ type: 'DELETE_MESSAGE', messageId });
        // TODO: notify server
    };

    return (
        <div style={{ flex: 1, padding: 10, overflowY: 'auto', height: '100vh' }}>
            {state.messages.map(m => (
                <div key={m.id} style={{ marginBottom: 8, opacity: m.deleted ? 0.5 : 1 }}>
                    <b>{m.senderName}</b>: {m.content}
                    {!m.deleted && m.senderId === state.auth.user?.id && (
                        <button onClick={() => onDelete(m.id)} style={{ marginLeft: 8 }}>
                            Delete
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

function UserListDrawer() {
    const { state } = useAppContext();
    return (
        <div style={{ width: 200, borderLeft: '1px solid #ccc' }}>
            <h3>Users</h3>
            <ul>
                {state.channelUsers.map(u => (
                    <li key={u.id}>{u.username}</li>
                ))}
            </ul>
        </div>
    );
}

function MessageInput() {
    const { state, dispatch } = useAppContext();
    const [text, setText] = React.useState('');

    const send = () => {
        if (!text.trim() || !state.socket || !state.currentChannelId) return;

        const message: Partial<Message> = {
            senderId: state.auth.user!.id,
            senderName: state.auth.user!.username,
            content: text.trim(),
            deleted: false,
            timestamp: new Date().toISOString()
        };

        state.socket.emit('send-message', { channelId: state.currentChannelId, message });
        setText('');
    };

    return (
        <div style={{ padding: 8, borderTop: '1px solid #ccc', display: 'flex' }}>
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ flex: 1 }}
                placeholder="Type a message"
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        send();
                    }
                }}
            />
            <button onClick={send}>Send</button>
        </div>
    );
}

function ChannelView() {
    const { state, dispatch } = useAppContext();
    const { channelId } = useParams<{ channelId: string }>();

    useEffect(() => {
        if (!state.auth.token || !channelId) return;

        dispatch({ type: 'SET_CURRENT_CHANNEL', channelId });

        (async () => {
            const messages = await apiFetchMessages(state.auth.token!, channelId);
            dispatch({ type: 'SET_MESSAGES', messages });
            const users = await apiFetchChannelUsers(state.auth.token!, channelId);
            dispatch({ type: 'SET_CHANNEL_USERS', users });
        })();

        if (state.socket) {
            state.socket.emit('join-channel', channelId);

            state.socket.off('new-message');
            state.socket.on('new-message', (message: Message) => {
                if (message.deleted) dispatch({ type: 'DELETE_MESSAGE', messageId: message.id });
                else dispatch({ type: 'ADD_MESSAGE', message });
            });

            state.socket.off('user-joined');
            state.socket.on('user-joined', (user: ChannelUser) => {
                dispatch({ type: 'ADD_CHANNEL_USER', user });
            });

            state.socket.off('user-left');
            state.socket.on('user-left', (userId: string) => {
                dispatch({ type: 'REMOVE_CHANNEL_USER', userId });
            });
        }
    }, [channelId, state.auth.token, dispatch, state.socket]);

    if (!channelId) return null;

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <ChannelListDrawer />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <MessageView />
                <MessageInput />
            </div>
            <UserListDrawer />
        </div>
    );
}

function SettingsPage() {
    // Stub: password change UI
    return <div>Change Password Page (to implement)</div>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
    const { state } = useAppContext();
    if (!state.auth.user) return <Navigate to="/login" />;
    return children;
}

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (state.auth.token && !state.socket) {
            const socket = io('http://localhost:3000', {
                auth: { token: state.auth.token }
            });
            dispatch({ type: 'SET_SOCKET', socket });
        }
    }, [state.auth.token, state.socket]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                    <Route path="/channels/:channelId" element={<RequireAuth><ChannelView /></RequireAuth>} />
                    <Route path="*" element={<Navigate to={state.auth.user ? '/channels/c1' : '/login'} />} />
                </Routes>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
*/
