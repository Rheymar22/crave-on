import { useState, useRef, useEffect } from "react";

const QUICK_REPLIES = [
  "What's on the menu?",
  "What are your hours?",
  "Do you offer delivery?",
  "What's your best seller?",
];

export default function CraveOnChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! Welcome to Crave On! I'm your AI assistant. How can I help you today?",
      showQuick: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendToN8n = async (userMessage, currentHistory) => {
    const response = await fetch("http://localhost:5678/webhook/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        history: currentHistory,
      }),
    });
    const data = await response.json();
    return { reply: data.reply, updatedHistory: data.history };
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: msg }]);
    setLoading(true);
    try {
      const { reply, updatedHistory } = await sendToN8n(msg, history);
      setHistory(updatedHistory);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I'm having trouble connecting. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ position: "fixed", bottom: "24px", right: "24px", width: "56px", height: "56px", borderRadius: "50%", background: "#1a1208", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", zIndex: 1000 }}
        aria-label="Open chat"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
        )}
      </button>

      {open && (
        <div style={{ position: "fixed", bottom: "90px", right: "24px", width: "360px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 999, display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
          <div style={{ background: "#1a1208", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#c8a96e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600", color: "#1a1208", flexShrink: 0 }}>C</div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#f5e6c8" }}>Crave On Assistant</p>
              <p style={{ margin: 0, fontSize: "11px", color: "#c8a96e", display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4caf82", display: "inline-block" }}></span>
                Online · Replies instantly
              </p>
            </div>
          </div>

          <div ref={bodyRef} style={{ background: "#fff", height: "340px", overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", flexDirection: msg.sender === "user" ? "row-reverse" : "row", maxWidth: "85%" }}>
                  {msg.sender === "bot" && (
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#c8a96e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "600", color: "#1a1208", flexShrink: 0 }}>C</div>
                  )}
                  <div style={{ padding: "9px 13px", borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: "13px", lineHeight: "1.55", background: msg.sender === "user" ? "#1a1208" : "#f5f5f3", color: msg.sender === "user" ? "#f5e6c8" : "#1a1208", border: msg.sender === "bot" ? "0.5px solid #e5e5e0" : "none" }}>
                    {msg.text}
                  </div>
                </div>
                {msg.showQuick && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px", marginLeft: "34px" }}>
                    {QUICK_REPLIES.map((q, qi) => (
                      <button key={qi} onClick={() => sendMessage(q)} style={{ background: "transparent", border: "0.5px solid #c8a96e", color: "#c8a96e", padding: "4px 11px", borderRadius: "20px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#c8a96e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "600", color: "#1a1208" }}>C</div>
                <div style={{ display: "flex", gap: "4px", padding: "10px 14px", background: "#f5f5f3", border: "0.5px solid #e5e5e0", borderRadius: "18px 18px 18px 4px" }}>
                  {[0, 1, 2].map((d) => (
                    <div key={d} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#c8a96e", animation: "bounce 1.2s infinite", animationDelay: `${d * 0.2}s` }}></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: "#fff", borderTop: "0.5px solid #e5e5e0", padding: "0.75rem 1rem", display: "flex", gap: "8px", alignItems: "center" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask about our menu..." style={{ flex: 1, border: "0.5px solid #e5e5e0", borderRadius: "24px", padding: "9px 14px", fontSize: "13px", fontFamily: "inherit", background: "#f5f5f3", color: "#1a1208", outline: "none" }} />
            <button onClick={() => sendMessage()} disabled={loading} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1a1208", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="15" height="15" fill="#c8a96e" viewBox="0 0 24 24"><path d="M2 21L23 12 2 3v7l15 2-15 2v7z"/></svg>
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }`}</style>
    </>
  );
}