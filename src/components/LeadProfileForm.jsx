import { useState, useEffect } from "react";

const LEAD_STATUSES = ["New", "Attempted Contact", "Connected", "Qualified", "Disqualified"];

export default function LeadProfileForm({ lead, onClose, onSave }) {
  const [formData, setFormData] = useState({
    status: lead?.status || "New",
    budget: lead?.budget || "",
    authority: lead?.authority || "",
    need: lead?.need || "",
    timeline: lead?.timeline || "",
    notes: lead?.notes || ""
  });

  const [isSaving, setIsSaving] = useState(false);

  // Disable background scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;  
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(lead.id, formData);
    setIsSaving(false);
  };

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(2, 6, 23, 0.85)", 
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 99999,
        
        /* THE BULLETPROOF SCROLL FIX */
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", /* Prevents top cutoff */
        overflowY: "auto",        /* Scrolls the whole screen if needed */
        padding: "5vh 20px"       /* Breathing room on top and bottom */
      }}
    >
      <div 
        style={{
          margin: "auto",           /* Centers form if screen is tall enough */
          width: "100%",
          maxWidth: "1000px",       /* Prevents stretching too wide */
          background: "#0f172a",    /* Solid dark color */
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "40px",
          boxSizing: "border-box",
          position: "relative",
          color: "#f8fafc",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
        }}
      >
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "15px" }}>
          <h2 style={{ margin: 0, color: "white", fontSize: "1.75rem", textShadow: "0 0 10px rgba(56, 189, 248, 0.3)" }}>
            Lead Profile: {lead.name}
          </h2>
          <button 
            onClick={onClose} 
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "28px", cursor: "pointer", padding: "0 10px" }}
            onMouseOver={(e) => e.target.style.color = "#ef4444"}
            onMouseOut={(e) => e.target.style.color = "#94a3b8"}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
            
            {/* LEFT COLUMN: Contact Info & Status */}
            <div style={{ flex: "1 1 350px" }}>
              <h3 style={{ color: "#38bdf8", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", fontSize: "1.2rem", marginTop: 0 }}>Overview</h3>
              
              <p style={{ color: "#cbd5e1", fontSize: "1rem", margin: "10px 0" }}>
                <strong>Email:</strong> <a href={`mailto:${lead.email}`} style={{ color: "#38bdf8", textDecoration: "none" }}>{lead.email}</a>
              </p>
              
              <p style={{ color: "#cbd5e1", marginTop: "15px", marginBottom: "5px" }}><strong>Initial Message:</strong></p>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", color: "#e2e8f0", marginBottom: "25px", border: "1px solid rgba(255,255,255,0.1)", lineHeight: "1.5" }}>
                {lead.message}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem" }}>Current Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(15, 23, 42, 0.8)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontSize: "1rem", boxSizing: "border-box", cursor: "pointer" }}
                >
                  {LEAD_STATUSES.map(status => (
                    <option key={status} value={status} style={{ background: "#0f172a" }}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* RIGHT COLUMN: BANT Qualification */}
            <div style={{ flex: "1 1 350px" }}>
              <h3 style={{ color: "#38bdf8", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", fontSize: "1.2rem", marginTop: 0 }}>Qualification (BANT)</h3>
              
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem" }}>Budget: Do they have funds?</label>
                <input 
                  type="text" 
                  name="budget" 
                  value={formData.budget} 
                  onChange={handleChange} 
                  placeholder="e.g., $10k approved" 
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", background: "rgba(15, 23, 42, 0.8)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontSize: "1rem" }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem" }}>Authority: Are they the decision maker?</label>
                <input 
                  type="text" 
                  name="authority" 
                  value={formData.authority} 
                  onChange={handleChange} 
                  placeholder="e.g., Needs VP approval" 
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", background: "rgba(15, 23, 42, 0.8)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontSize: "1rem" }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem" }}>Need: What problem are we solving?</label>
                <input 
                  type="text" 
                  name="need" 
                  value={formData.need} 
                  onChange={handleChange} 
                  placeholder="e.g., Current software is too slow" 
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", background: "rgba(15, 23, 42, 0.8)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontSize: "1rem" }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", color: "#94a3b8", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem" }}>Timeline: When will they buy?</label>
                <input 
                  type="text" 
                  name="timeline" 
                  value={formData.timeline} 
                  onChange={handleChange} 
                  placeholder="e.g., Q3 2026" 
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", background: "rgba(15, 23, 42, 0.8)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontSize: "1rem" }}
                />
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: Activity Notes */}
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ color: "#38bdf8", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", fontSize: "1.2rem" }}>Activity Notes</h3>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              placeholder="Log your call notes, objections, or next steps here..."
              style={{ width: "100%", boxSizing: "border-box", padding: "16px", borderRadius: "8px", background: "rgba(15, 23, 42, 0.8)", color: "white", border: "1px solid rgba(255,255,255,0.2)", minHeight: "150px", fontSize: "1rem", fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          {/* ACTIONS */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "35px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ padding: "12px 24px", borderRadius: "8px", cursor: "pointer", background: "rgba(255,255,255,0.05)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.2)", fontSize: "1rem", fontWeight: "600" }}
              onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
              onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              style={{ padding: "12px 24px", borderRadius: "8px", cursor: "pointer", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "white", border: "none", fontSize: "1rem", fontWeight: "600" }}
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}