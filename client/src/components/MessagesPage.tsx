import { useEffect, useState } from "react";
import { useAppContext, type Message, type User } from "../types";
import "../App.css";

export default function MessagesPage() {
    const { state, dispatch } = useAppContext();
    const { auth, currentSelectedUserId, messages, users } = state;
    const [newMessage, setNewMessage] = useState("");
    const [newConversationName, setNewConversationName] = useState("");
    const [error, setError] = useState("");
    const selectedUser = users.find(user => user._id == currentSelectedUserId);

    useEffect(() => {
        const fetchData = () => {
            console.log("Fetching messages for:", currentSelectedUserId);
            if (currentSelectedUserId !== null) {
                fetch(`/api/messages?otherUserId=${encodeURIComponent(currentSelectedUserId)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                    },
                })
                    .then(res => res.json())
                    .then(data => {
                        const { messages } = data;
                        dispatch({ type: "SET_MESSAGES", messages });
                    })
                    .catch(() => { });
            }

            fetch('/api/messages/conversations', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            })
                .then(res => res.json())
                .then(data => {
                    const { conversations } = data;
                    if (conversations) {
                        dispatch({ type: "SET_USERS", users: conversations });
                    }
                })
                .catch(() => { });
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, [currentSelectedUserId]);

    function sendMessage() {
        if (!newMessage.trim() || !auth.user || !currentSelectedUserId) return;

        const messagePayload = {
            content: newMessage.trim(),
            receiverId: currentSelectedUserId,
        };

        fetch('/api/messages/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messagePayload)
        });

        setNewMessage("");
    }

    function startNewConversation() {
        setError("");
        const trimmedName = newConversationName.trim();
        if (!trimmedName) return;

        fetch('/api/messages/conversations/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: trimmedName })
        })
            .then(async res => {
                const data = await res.json();
                if (res.ok) {
                    setError("");
                } else {
                    setError(data.error || "Unknown error");
                }
            })
            .catch(() => {
                setError("Unknown error");
            });
    }

    return (
        <div className="messages-container">
            <div className="users-list">
                <div className="new-conversation">
                    <input
                        type="text"
                        value={newConversationName}
                        onChange={(e) => setNewConversationName(e.target.value)}
                        placeholder="Start new conversation"
                        onKeyDown={(e) => e.key === "Enter" && startNewConversation()}
                    />
                    <button onClick={startNewConversation}>Start</button>
                    {error && <div className="error-message messages-error-message">{error}</div>}
                </div>
                {users.map((user) => (
                    <div
                        key={user._id}
                        className={`user-item ${user._id === currentSelectedUserId ? "selected" : ""}`}
                        onClick={() => {
                            console.log(JSON.stringify(user));
                            return dispatch({ type: "SET_SELECTED_USER", userId: user._id });
                        }}
                    >
                        {user.username}
                    </div>
                ))}
            </div>
            <div className="chat-window">
                <div className="messages-list">
                    {messages
                        .map((m) => (
                            <div
                                key={m._id}
                                className={`message-item ${m.senderId === auth.user?._id ? "sent" : "received"
                                    }`}
                            >
                                <div className="message-content">{m.content}</div>
                                <div className="message-time">{new Date(m.timestamp).toLocaleTimeString()}</div>
                            </div>
                        ))}
                </div>
                <div className="message-input">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={selectedUser ? `Message to ${selectedUser.username}` : "Select user"}
                        disabled={!selectedUser}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button onClick={sendMessage}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
