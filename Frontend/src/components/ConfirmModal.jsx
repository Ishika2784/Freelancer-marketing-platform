export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:9000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20
    }}>
      <div style={{
        background:"#fff", borderRadius:18, padding:"32px 36px", maxWidth:400, width:"100%",
        boxShadow:"0 20px 60px rgba(0,0,0,0.2)", textAlign:"center"
      }}>
        <div style={{fontSize:"2.5rem", marginBottom:12}}>⚠️</div>
        <h3 style={{fontSize:"1.1rem", fontWeight:800, color:"#1a1a2e", margin:"0 0 10px"}}>{message}</h3>
        <p style={{fontSize:13.5, color:"#64748b", margin:"0 0 24px"}}>This action cannot be undone.</p>
        <div style={{display:"flex", gap:10, justifyContent:"center"}}>
          <button onClick={onCancel} style={{
            padding:"10px 24px", borderRadius:10, border:"1.5px solid #e2e8f0",
            background:"#fff", color:"#475569", fontWeight:600, fontSize:14, cursor:"pointer"
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding:"10px 24px", borderRadius:10, border:"none",
            background:"#ef4444", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer"
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
