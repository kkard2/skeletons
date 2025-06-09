import { useEffect, useState } from "react";
import { useAppContext, type Message, type User } from "../types";
import "../App.css";

export default function MessagesPage() {
    const { state, dispatch } = useAppContext();
    const { auth, currentSelectedUserId, messages, users, socket } = state;
    const [newMessage, setNewMessage] = useState("");

    // Listen for incoming messages via socket
    useEffect(() => {
        if (!socket) return;

        function onMessageReceived(message: Message) {
            dispatch({ type: "ADD_MESSAGE", message });
        }

        socket.on("message", onMessageReceived);
        return () => {
            socket.off("message", onMessageReceived);
        };
    }, [socket, dispatch]);

    function sendMessage() {
        if (!newMessage.trim() || !auth.user || !currentSelectedUserId || !socket) return;

        const messagePayload = {
            content: newMessage.trim(),
            receiverId: currentSelectedUserId,
            timestamp: new Date().toISOString(),
        };

        socket.emit("message", messagePayload);
        dispatch({ type: "ADD_MESSAGE", message: messagePayload }); // optimistic update
        setNewMessage("");
    }

    const selectedUser = users.find((u) => u.id === currentSelectedUserId);

    return (
        <div className="messages-container">
            <div className="users-list">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className={`user-item ${user.id === currentSelectedUserId ? "selected" : ""}`}
                        onClick={() => dispatch({ type: "SET_SELECTED_USER", userId: user.id })}
                    >
                        {user.name}
                    </div>
                ))}
            </div>
            <div className="chat-window">
                <div className="messages-list">
                    {messages
                        .filter((m) =>
                            [auth.user?.id, currentSelectedUserId].includes(m.senderId)
                        )
                        .map((m) => (
                            <div
                                key={m.id}
                                className={`message-item ${
                                    m.senderId === auth.user?.id ? "sent" : "received"
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
                        placeholder={selectedUser ? `Message to ${selectedUser.name}` : "Select user"}
                        disabled={!selectedUser}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button onClick={sendMessage} disabled={!newMessage.trim() || !selectedUser}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
