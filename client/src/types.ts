import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

export type Action =
    | { type: 'LOGIN'; user: User; token: string }
    | { type: 'LOGOUT' }
    | { type: 'SET_SOCKET'; socket: Socket }
    | { type: 'SET_USERS'; users: User[] }
    | { type: 'SET_MESSAGES'; messages: Message[] }
    | { type: 'ADD_MESSAGE'; message: Message }
    ;

export interface Message {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
}

export interface User {
    id: string;
    name: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
}

export interface AppState {
    auth: AuthState;
    currentSelectedUserId: string | null;
    messages: Message[]; // for current channel
    users: User[]; // for current channel
    socket: Socket | null;
}

export const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used inside AppProvider');
    return context;
}

export const initialState: AppState = {
    auth: { user: null, token: null },
    currentSelectedUserId: null,
    messages: [],
    users: [],
    socket: null,
};
