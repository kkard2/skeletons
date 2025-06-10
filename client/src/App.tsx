import { useReducer } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppContext, initialState, type Action, type AppState } from "./types";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import RequireAuth from "./components/RequireAuth";
import MessagesPage from "./components/MessagesPage";

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, auth: { user: action.user, token: action.token } };
        case 'LOGOUT':
            return { ...state, auth: { user: null, token: null } };
        case 'SET_USERS':
            return { ...state, users: action.users };
        case 'SET_SELECTED_USER':
            return { ...state, currentSelectedUserId: action.userId };
        case 'SET_MESSAGES':
            return { ...state, messages: action.messages };
        default:
            return state;
    }
}

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
