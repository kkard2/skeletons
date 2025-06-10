import { createContext, useContext } from "react";

export type Action =
    | { type: 'LOGIN'; user: User; token: string }
    | { type: 'LOGOUT' }
    | { type: 'SET_USERS'; users: User[] }
    | { type: 'SET_SELECTED_USER'; userId: string }
    | { type: 'SET_MESSAGES'; messages: Message[] }
    ;

export interface Message {
    _id: string;
    content: string;
    senderId: string;
    timestamp: string;
}

export interface User {
    _id: string;
    username: string;
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
};
