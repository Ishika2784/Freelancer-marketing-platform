import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { api } from "../utils/api";

const SOCKET_URL = "http://localhost:5000";

function fmt(date) {
  const d = new Date(date), now = new Date();
  const s = (now - d) / 1000;
  if (s < 60)    return "now";
  if (s < 3600)  return `${Math.floor(s/60)}m`;
  if (s < 86400) return d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

export default function ChatBubble({ user }) {
  const [open, setOpen]           = useState(false);
  const [view, setView]           = useState("list"); // "list" | "chat"
  const [convs, setConvs]         = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState("");
  const [sending, setSending]     = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [typing, setTyping]       = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const socketRef  = useRef(null);
  const typingTimer = useRef(null);
  const myId = user?._id;

  // ── Socket ────────────────────────────────────────────────────
  useEffect(() => {
    if (!myId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("register", myId));
    socket.on("new_message", (msg) => {
      const fromId = (msg.from?._id || msg.from)?.toString();
      if (fromId === activeConv?.user?._id) {
        setMessages(p => [...p, msg]);
      }
      loadConvs();
    });
    socket.on("typing", ({ from }) => {
      if (from === activeConv?.user?._id) {
        setTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(false), 2000);
      }
    });
    return () => socket.disconnect();
  }, [myId, activeConv]);

  // ── Load hired conversations ──────────────────────────────────
  const loadConvs = useCallback(async () => {
    try {
      const r = await api.get("/chat/conversations");
      setConvs(r.data);
      setUnreadTotal(r.data.reduce((s, c) => s + (c.unread || 0), 0));
    } catch {}
  }, []);

  useEffect(() => { if (user) loadConvs(); }, [user, loadConvs]);

  // Auto-open chat if URL has ?with= param (after hire redirect)
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const withId = params.get("with");
    if (!withId) return;
    // Wait for convs to load then open
    const tryOpen = async () => {
      try {
        const r = await api.get("/chat/conversations");
        setConvs(r.data);
        setUnreadTotal(r.data.reduce((s, c) => s + (c.unread || 0), 0));
        const conv = r.data.find(c => c.user._id === withId);
        if (conv) {
          setOpen(true);
          openChat(conv);
        } else {
          // Conversation exists via messages, fetch user profile directly
          const uRes = await api.get(`/user/profile/${withId}`);
          const fakeConv = { user: uRes.data, lastMessage: "", lastAt: new Date(), unread: 0 };
          setOpen(true);
          openChat(fakeConv);
        }
      } catch {}
    };
    tryOpen();
  }, [user]);

  // Poll every 10s when closed
  useEffect(() => {
    if (!user || open) return;
    const t = setInterval(loadConvs, 10000);
    return () => clearInterval(t);
  }, [user, open, loadConvs]);

  const openChat = async (conv) => {
    setActiveConv(conv);
    setView("chat");
    try {
      const r = await api.get(`/chat/${conv.user._id}`);
      setMessages(r.data);
      loadConvs();
    } catch {}
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv || sending) return;
    const draft = text.trim();
    setText("");
    setSending(true);
    try {
      const r = await api.post(`/chat/${activeConv.user._id}`, { text: draft });
      setMessages(p => [...p, r.data]);
      loadConvs();
    } catch { setText(draft); }
    finally { setSending(false); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (socketRef.current && activeConv) {
      socketRef.current.emit("typing", { to: activeConv.user._id, from: myId });
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (!user) return null;

  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9000, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 }}>

      {/* ── Chat window ── */}
      {open && (
        <div style={{
          width: 340, height: 480,
          background:"#fff", borderRadius:20,
          boxShadow:"0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
          display:"flex", flexDirection:"column", overflow:"hidden",
          border:"1.5px solid #f1f5f9",
          animation:"bubbleIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#f97316,#ea580c)", padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
            {view === "chat" && (
              <button onClick={() => { setView("list"); setActiveConv(null); setMessages([]); }}
                style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", width:28, height:28, borderRadius:"50%", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                ←
              </button>
            )}
            <div style={{ flex:1 }}>
              <div style={{ color:"#fff", fontWeight:800, fontSize:14 }}>
                {view === "chat" ? activeConv?.user?.name : "Messages"}
              </div>
              <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11 }}>
                {view === "chat" ? "● Online" : `${convs.length} conversation${convs.length !== 1 ? "s" : ""}`}
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", width:28, height:28, borderRadius:"50%", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
              ×
            </button>
          </div>

          {/* Body */}
          {view === "list" ? (
            <div style={{ flex:1, overflowY:"auto" }}>
              {convs.length === 0 ? (
                <div style={{ padding:"40px 20px", textAlign:"center", color:"#94a3b8" }}>
                  <div style={{ fontSize:"2rem", marginBottom:8 }}>💬</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>No conversations yet</div>
                  <div style={{ fontSize:12, marginTop:4 }}>Hire a freelancer to start chatting</div>
                </div>
              ) : convs.map(c => (
                <div key={c.user._id} onClick={() => openChat(c)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer", borderBottom:"1px solid #f8fafc", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ width:40, height:40, borderRadius:12, background:"#6366f1", color:"#fff", fontWeight:800, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative" }}>
                    {c.user.name?.charAt(0).toUpperCase()}
                    <div style={{ position:"absolute", bottom:0, right:0, width:9, height:9, borderRadius:"50%", background:"#10b981", border:"2px solid #fff" }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontWeight:700, fontSize:13, color:"#1a1a2e" }}>{c.user.name}</span>
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
              ))}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:4, background:"#f8fafc" }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign:"center", color:"#94a3b8", padding:"30px 0", fontSize:13 }}>
                    Say hello to {activeConv?.user?.name}! 👋
                  </div>
                ) : messages.map((m, i) => {
                  const isMe = (m.from?._id || m.from)?.toString() === myId;
                  return (
                    <div key={m._id || i} style={{ display:"flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems:"flex-end", gap:6 }}>
                      {!isMe && (
                        <div style={{ width:24, height:24, borderRadius:8, background:"#6366f1", color:"#fff", fontWeight:800, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:2 }}>
                          {activeConv?.user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ maxWidth:"72%", display:"flex", flexDirection:"column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                        <div style={{
                          padding:"8px 12px",
                          borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: isMe ? "linear-gradient(135deg,#f97316,#ea580c)" : "#fff",
                          color: isMe ? "#fff" : "#1a1a2e",
                          border: isMe ? "none" : "1.5px solid #e2e8f0",
                          boxShadow: isMe ? "0 3px 10px rgba(249,115,22,0.25)" : "0 2px 6px rgba(0,0,0,0.05)",
                          fontSize:13, lineHeight:1.5, wordBreak:"break-word",
                        }}>
                          {m.text}
                        </div>
                        <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>
                          {fmt(m.createdAt)}{isMe && " ✓✓"}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {typing && (
                  <div style={{ display:"flex", alignItems:"flex-end", gap:6 }}>
                    <div style={{ width:24, height:24, borderRadius:8, background:"#6366f1", color:"#fff", fontWeight:800, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {activeConv?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:"16px 16px 16px 4px", padding:"8px 14px", boxShadow:"0 2px 6px rgba(0,0,0,0.05)" }}>
                      <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                        {[0,1,2].map(i => (
                          <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:"#94a3b8", animation:`typingDot 1.2s ${i*0.2}s infinite` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMsg} style={{ padding:"10px 12px", borderTop:"1.5px solid #f1f5f9", background:"#fff", display:"flex", gap:8, alignItems:"center" }}>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(e); } }}
                  placeholder="Type a message…"
                  style={{ flex:1, padding:"9px 14px", borderRadius:100, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", background:"#f8fafc", color:"#1a1a2e" }}
                  onFocus={e => e.target.style.borderColor = "#f97316"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
                <button type="submit" disabled={sending || !text.trim()}
                  style={{ width:36, height:36, borderRadius:"50%", border:"none", background: text.trim() ? "linear-gradient(135deg,#f97316,#ea580c)" : "#f1f5f9", color: text.trim() ? "#fff" : "#94a3b8", display:"flex", alignItems:"center", justifyContent:"center", cursor: text.trim() ? "pointer" : "default", boxShadow: text.trim() ? "0 3px 10px rgba(249,115,22,0.3)" : "none", transition:"all 0.18s", fontSize:15, flexShrink:0 }}>
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ── Floating bubble button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width:54, height:54, borderRadius:"50%",
          background:"linear-gradient(135deg,#f97316,#ea580c)",
          border:"none", color:"#fff", fontSize:22,
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", boxShadow:"0 8px 24px rgba(249,115,22,0.45)",
          transition:"transform 0.2s, box-shadow 0.2s",
          position:"relative",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.1)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(249,115,22,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(249,115,22,0.45)"; }}
      >
        {open ? "×" : "💬"}
        {!open && unreadTotal > 0 && (
          <div style={{ position:"absolute", top:-2, right:-2, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:800, minWidth:18, height:18, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px", border:"2px solid #fff" }}>
            {unreadTotal}
          </div>
        )}
      </button>

      <style>{`
        @keyframes bubbleIn {
          from { opacity:0; transform:scale(0.85) translateY(16px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes typingDot {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          30% { transform:translateY(-4px); opacity:1; }
        }
      `}</style>
    </div>
  );
}
