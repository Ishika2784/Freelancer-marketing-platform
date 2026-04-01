import { useState, useEffect, createContext, useContext, useCallback } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type==="error" ? "#fff1f2" : t.type==="warn" ? "#fffbeb" : "#f0fdf4",
            border: `1.5px solid ${t.type==="error"?"#fecdd3":t.type==="warn"?"#fde68a":"#bbf7d0"}`,
            color: t.type==="error" ? "#be123c" : t.type==="warn" ? "#b45309" : "#15803d",
            padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            display: "flex", alignItems: "center", gap: 10, minWidth: 260, maxWidth: 380,
            animation: "toastIn .25s ease",
          }}>
            <span>{t.type==="error"?"❌":t.type==="warn"?"⚠️":"✅"}</span>
            {t.msg}
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
