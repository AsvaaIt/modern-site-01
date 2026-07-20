import { useState, useEffect } from "react";

// You can change these to match your actual team members
const TEAM_LEADS = ["Unassigned", "Manohar Arsid", "Laxmi Narayan Arsid"];

export default function Portal() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all messages on initial load
  const fetchMessages = async () => {
    try {
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

  // Update assigned lead in database and UI
  const handleAssign = async (id, newLead) => {
    try {
      const res = await fetch(`/api/messages/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: newLead })
      });
      
      if (res.ok) {
        // Update the UI immediately without refreshing the page
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

  // Delete message from database and UI
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this message?")) {
      return;
    }

    try {
      const res = await fetch(`/api/messages/${id}`, { 
        method: "DELETE" 
      });
      
      if (res.ok) {
        // Remove the deleted message from the UI
        setMessages(messages.filter(msg => msg.id !== id));
      } else {
        alert("Failed to delete message on the server.");
      }
    } catch (error) {
      console.error("Deletion error:", error);
      alert("Network error while deleting message.");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading portal data...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "10px" }}>Lead Assignment Portal</h2>
      
      {messages.length === 0 ? (
        <p>No messages found in the database.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "12px" }}>Name</th>
              <th style={{ padding: "12px" }}>Email</th>
              <th style={{ padding: "12px" }}>Message</th>
              <th style={{ padding: "12px" }}>Date</th>
              <th style={{ padding: "12px" }}>Assigned To</th>
              <th style={{ padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}><strong>{msg.name}</strong></td>
                <td style={{ padding: "12px" }}>
                  <a href={`mailto:${msg.email}`} style={{ color: "#0066cc", textDecoration: "none" }}>
                    {msg.email}
                  </a>
                </td>
                <td style={{ padding: "12px", maxWidth: "300px" }}>{msg.message}</td>
                <td style={{ padding: "12px", color: "#666" }}>
                  {new Date(msg.created_at).toLocaleDateString()}
                </td>
                
                {/* Assignment Dropdown */}
                <td style={{ padding: "12px" }}>
                  <select 
                    value={msg.assigned_to || "Unassigned"} 
                    onChange={(e) => handleAssign(msg.id, e.target.value)}
                    style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                  >
                    {TEAM_LEADS.map(lead => (
                      <option key={lead} value={lead}>{lead}</option>
                    ))}
                  </select>
                </td>
                
                {/* Delete Action */}
                <td style={{ padding: "12px" }}>
                  <button 
                    onClick={() => handleDelete(msg.id)}
                    style={{ 
                      background: "#ff4d4f", 
                      color: "white", 
                      border: "none", 
                      padding: "6px 12px", 
                      cursor: "pointer", 
                      borderRadius: "4px",
                      fontWeight: "bold"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}