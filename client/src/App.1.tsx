import { useReducer } from "react";

export function App() {
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

