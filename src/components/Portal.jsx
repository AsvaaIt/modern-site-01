import { useState, useEffect } from "react";

// You can change these to match your actual team members
const TEAM_LEADS = ["Unassigned", "Manohar Arsid", "Laxmi Narayan Arsid"];

// Added onLogout prop to handle the logout logic from App.jsx
export default function Portal({ currentUser, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    try {
      // You should ideally pass the user token here so the server only returns allowed messages
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to load messages from server.");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleAssign = async (id, newLead) => {
    try {
      const res = await fetch(`/api/messages/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: newLead }) // The backend triggers the email based on this
      });
      
      if (res.ok) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, assigned_to: newLead } : msg
        ));
      } else {
        alert("Failed to assign lead on the server.");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      alert("Network error while assigning lead.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this message?")) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(messages.filter(msg => msg.id !== id));
      } else {
        alert("Failed to delete message on the server.");
      }
    } catch (error) {
      alert("Network error while deleting message.");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading portal data...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;

  // Filter messages based on role: Admins see all, Agents see only their own
  const displayedMessages = currentUser?.role === "admin" 
    ? messages 
    : messages.filter(msg => msg.assigned_to === currentUser?.name);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Header section updated with flexbox and logout button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #333", paddingBottom: "10px" }}>
        <h2>Lead Assignment Portal</h2>
        
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <p style={{ margin: 0 }}>Logged in as: <strong>{currentUser?.name} ({currentUser?.role})</strong></p>
          <button 
            onClick={onLogout}
            style={{ 
              padding: "6px 12px", 
              background: "#f0f0f0", 
              border: "1px solid #ccc", 
              borderRadius: "4px", 
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      {displayedMessages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "12px" }}>Name</th>
              <th style={{ padding: "12px" }}>Email</th>
              <th style={{ padding: "12px" }}>Message</th>
              <th style={{ padding: "12px" }}>Date</th>
              <th style={{ padding: "12px" }}>Assigned To</th>
              {/* Only show the Actions column header if the user is an admin */}
              {currentUser?.role === "admin" && <th style={{ padding: "12px" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {displayedMessages.map((msg) => (
              <tr key={msg.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}><strong>{msg.name}</strong></td>
                <td style={{ padding: "12px" }}><a href={`mailto:${msg.email}`}>{msg.email}</a></td>
                <td style={{ padding: "12px", maxWidth: "300px" }}>{msg.message}</td>
                <td style={{ padding: "12px", color: "#666" }}>{new Date(msg.created_at).toLocaleDateString()}</td>
                
                {/* Assignment Column: Dropdown for Admin, Text for Agents */}
                <td style={{ padding: "12px" }}>
                  {currentUser?.role === "admin" ? (
                    <select 
                      value={msg.assigned_to || "Unassigned"} 
                      onChange={(e) => handleAssign(msg.id, e.target.value)}
                      style={{ padding: "6px", borderRadius: "4px" }}
                    >
                      {TEAM_LEADS.map(lead => (
                        <option key={lead} value={lead}>{lead}</option>
                      ))}
                    </select>
                  ) : (
                    <span>{msg.assigned_to}</span>
                  )}
                </td>
                
                {/* Delete Action: Only visible to admins */}
                {currentUser?.role === "admin" && (
                  <td style={{ padding: "12px" }}>
                    <button onClick={() => handleDelete(msg.id)} style={{ background: "#ff4d4f", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}