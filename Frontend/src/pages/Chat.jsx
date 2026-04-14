import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { api } from "../utils/api";
import { useToast } from "../components/Toast";

const SOCKET_URL = "http://localhost:5000";

function fmt(date) {
  const d = new Date(date), now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

function Avatar({ name, size = 36, color = "#6366f1" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: color, color: "#fff",
      fontWeight: 800, fontSize: size * 0.42,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, userSelect: "none",
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

export default function Chat({ currentUser }) {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId]           = useState(searchParams.get("with") || null);
  const [activeUser, setActiveUser]       = useState(null);
  const [messages, setMessages]           = useState([]);
  const [text, setText]                   = useState("");
  const [sending, setSending]             = useState(false);
  const [typing, setTyping]               = useState(false);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const socketRef  = useRef(null);
  const typingTimer = useRef(null);
  const myId = currentUser?._id;

  // ── Socket setup ──────────────────────────────────────────────
  useEffect(() => {
    if (!myId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("register", myId));

    socket.on("new_message", (msg) => {
      // Only add if it's from the active conversation
      const fromId = msg.from?._id || msg.from;
      if (fromId?.toString() === activeId) {
        setMessages(prev => [...prev, msg]);
      }
      // Refresh conversation list for unread badge
      loadConversations();
    });

    socket.on("typing", ({ from }) => {
      if (from === activeId) {
        setTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => { socket.disconnect(); };
  }, [myId, activeId]);

  // ── Data loaders ──────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const r = await api.get("/chat/conversations");
      setConversations(r.data);
    } catch {}
  }, []);

  const loadMessages = useCallback(async (userId) => {
    setLoadingMsgs(true);
    try {
      const [msgRes, userRes] = await Promise.all([
        api.get(`/chat/${userId}`),
        api.get(`/user/profile/${userId}`),
      ]);
      setMessages(msgRes.data);
      setActiveUser(userRes.data);
    } catch { toast("Failed to load messages", "error"); }
    finally { setLoadingMsgs(false); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
      setSearchParams({ with: activeId });
      inputRef.current?.focus();
    }
  }, [activeId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ── Send ──────────────────────────────────────────────────────
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId || sending) return;
    const draft = text.trim();
    setText("");
    setSending(true);
    try {
      const r = await api.post(`/chat/${activeId}`, { text: draft });
      setMessages(m => [...m, r.data]);
      loadConversations();
    } catch { toast("Failed to send", "error"); setText(draft); }
    finally { setSending(false); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (socketRef.current && activeId) {
      socketRef.current.emit("typing", { to: activeId, from: myId });
    }
  };

  // ── Group messages by date ────────────────────────────────────
  const grouped = messages.reduce((acc, m) => {
    const day = new Date(m.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  return (
    <div style={{ display:"flex", height:"calc(100vh - 96px)", borderRadius:16, overflow:"hidden", border:"1.5px solid #e2e8f0", background:"#fff", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
      <div style={{ width:300, borderRight:"1.5px solid #f1f5f9", display:"flex", flexDirection:"column", background:"#fafafa", flexShrink:0 }}>
        {/* Header */}
        <div style={{ padding:"20px 18px 14px", borderBottom:"1px solid #f1f5f9" }}>
          <div style={{ fontSize:"1rem", fontWeight:800, color:"#1a1a2e", marginBottom:2 }}>Messages</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</div>
        </div>

        {/* Conversation list */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {conversations.length === 0 ? (
            <div style={{ padding:"40px 20px", textAlign:"center", color:"#94a3b8" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:10 }}>💬</div>
              <div style={{ fontSize:13, fontWeight:600 }}>No conversations yet</div>
              <div style={{ fontSize:12, marginTop:4 }}>Hire a freelancer to start chatting</div>
            </div>
          ) : conversations.map(c => {
            const isActive = activeId === c.user._id;
            return (
              <div
                key={c.user._id}
                onClick={() => setActiveId(c.user._id)}
                style={{
                  display:"flex", alignItems:"center", gap:12, padding:"13px 16px",
                  cursor:"pointer", borderBottom:"1px solid #f1f5f9",
                  background: isActive ? "#fff7ed" : "transparent",
                  borderLeft: `3px solid ${isActive ? "#f97316" : "transparent"}`,
                  transition:"all 0.15s",
                }}
              >
                <div style={{ position:"relative" }}>
                  <Avatar name={c.user.name} size={42} color={isActive ? "#f97316" : "#6366f1"} />
                  <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:"50%", background:"#10b981", border:"2px solid #fafafa" }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
                    <span style={{ fontWeight:700, fontSize:13.5, color:"#1a1a2e" }}>{c.user.name}</span>
                    <span style={{ fontSize:10, color:"#94a3b8" }}>{fmt(c.lastAt)}</span>
                  </div>
                  <div style={{ fontSize:12, color: c.unread > 0 ? "#1a1a2e" : "#94a3b8", fontWeight: c.unread > 0 ? 600 : 400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {c.lastMessage}
                  </div>
                </div>
                {c.unread > 0 && (
                  <div style={{ background:"#f97316", color:"#fff", fontSize:10, fontWeight:800, minWidth:18, height:18, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px", flexShrink:0 }}>
                    {c.unread}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ CHAT AREA ════════════════════════════════════════════ */}
      {!activeId ? (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14, background:"#fafafa" }}>
          <div style={{ width:72, height:72, borderRadius:20, background:"#fff7ed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", boxShadow:"0 4px 20px rgba(249,115,22,0.15)" }}>💬</div>
          <div style={{ fontSize:16, fontWeight:700, color:"#1a1a2e" }}>Your Messages</div>
          <div style={{ fontSize:13, color:"#94a3b8", textAlign:"center", maxWidth:240 }}>Select a conversation from the left or hire a freelancer to start chatting.</div>
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#fff" }}>

          {/* Chat header */}
          <div style={{ padding:"14px 20px", borderBottom:"1.5px solid #f1f5f9", display:"flex", alignItems:"center", gap:14, background:"#fff" }}>
            {activeUser ? (
              <>
                <div style={{ position:"relative" }}>
                  <Avatar name={activeUser.name} size={44} color="#f97316" />
                  <div style={{ position:"absolute", bottom:1, right:1, width:10, height:10, borderRadius:"50%", background:"#10b981", border:"2px solid #fff" }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:"#1a1a2e" }}>{activeUser.name}</div>
                  <div style={{ fontSize:11, color:"#10b981", fontWeight:600 }}>● Online · {activeUser.role === "freelancer" ? "Freelancer" : "Client"}</div>
                </div>
                {activeUser.hourlyRate && (
                  <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"4px 10px", fontSize:12, fontWeight:700, color:"#15803d" }}>
                    ₹{activeUser.hourlyRate}/hr
                  </div>
                )}
              </>
            ) : <div style={{ color:"#94a3b8", fontSize:13 }}>Loading…</div>}
          </div>

          {/* Messages area */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:2, background:"#f8fafc" }}>
            {loadingMsgs ? (
              <div style={{ textAlign:"center", color:"#94a3b8", padding:60 }}>Loading messages…</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign:"center", color:"#94a3b8", padding:60 }}>
                <div style={{ fontSize:"2rem", marginBottom:8 }}>👋</div>
                <div style={{ fontWeight:600, fontSize:14 }}>Say hello to {activeUser?.name}!</div>
                <div style={{ fontSize:12, marginTop:4 }}>This is the beginning of your conversation.</div>
              </div>
            ) : (
              Object.entries(grouped).map(([day, dayMsgs]) => (
                <div key={day}>
                  {/* Date separator */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, margin:"16px 0 12px" }}>
                    <div style={{ flex:1, height:1, background:"#e2e8f0" }} />
                    <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600, whiteSpace:"nowrap", padding:"2px 10px", background:"#f1f5f9", borderRadius:100 }}>{day}</span>
                    <div style={{ flex:1, height:1, background:"#e2e8f0" }} />
                  </div>

                  {dayMsgs.map((m, i) => {
                    const isMe = (m.from?._id || m.from)?.toString() === myId;
                    const prevMsg = dayMsgs[i - 1];
                    const prevIsMe = prevMsg ? (prevMsg.from?._id || prevMsg.from)?.toString() === myId : null;
                    const showAvatar = !isMe && prevIsMe !== false;

                    return (
                      <div key={m._id || i} style={{ display:"flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 3, alignItems:"flex-end", gap:8 }}>
                        {/* Other user avatar */}
                        {!isMe && (
                          <div style={{ width:28, flexShrink:0 }}>
                            {showAvatar && <Avatar name={activeUser?.name} size={28} color="#6366f1" />}
                          </div>
                        )}

                        {/* Bubble */}
                        <div style={{ maxWidth:"62%", display:"flex", flexDirection:"column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                          <div style={{
                            padding:"10px 14px",
                            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: isMe ? "linear-gradient(135deg,#f97316,#ea580c)" : "#fff",
                            color: isMe ? "#fff" : "#1a1a2e",
                            border: isMe ? "none" : "1.5px solid #e2e8f0",
                            boxShadow: isMe ? "0 4px 12px rgba(249,115,22,0.25)" : "0 2px 8px rgba(0,0,0,0.05)",
                            fontSize: 13.5,
                            lineHeight: 1.55,
                            wordBreak: "break-word",
                          }}>
                            {m.text}
                          </div>
                          <div style={{ fontSize:10, color:"#94a3b8", marginTop:3, paddingLeft:2, paddingRight:2 }}>
                            {fmt(m.createdAt)}{isMe && " · ✓✓"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginTop:4 }}>
                <Avatar name={activeUser?.name} size={28} color="#6366f1" />
                <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:"18px 18px 18px 4px", padding:"10px 16px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#94a3b8", animation:`typingDot 1.2s ${i*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <form onSubmit={sendMessage} style={{ padding:"12px 16px", borderTop:"1.5px solid #f1f5f9", background:"#fff", display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ flex:1, display:"flex", alignItems:"center", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:100, padding:"0 16px", transition:"border-color 0.18s" }}
              onFocusCapture={e => e.currentTarget.style.borderColor = "#f97316"}
              onBlurCapture={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            >
              <input
                ref={inputRef}
                value={text}
                onChange={handleTyping}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                placeholder={`Message ${activeUser?.name || ""}…`}
                style={{ flex:1, padding:"11px 0", border:"none", background:"transparent", fontSize:14, outline:"none", fontFamily:"inherit", color:"#1a1a2e" }}
              />
            </div>
            <button
              type="submit"
              disabled={sending || !text.trim()}
              style={{
                width:44, height:44, borderRadius:"50%", border:"none",
                background: text.trim() ? "linear-gradient(135deg,#f97316,#ea580c)" : "#f1f5f9",
                color: text.trim() ? "#fff" : "#94a3b8",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor: text.trim() ? "pointer" : "default",
                boxShadow: text.trim() ? "0 4px 12px rgba(249,115,22,0.35)" : "none",
                transition:"all 0.18s", fontSize:18, flexShrink:0,
              }}
            >
              {sending ? "…" : "➤"}
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes typingDot {
          0%,60%,100% { transform: translateY(0); opacity:0.4; }
          30% { transform: translateY(-4px); opacity:1; }
        }
      `}</style>
    </div>
  );
}
