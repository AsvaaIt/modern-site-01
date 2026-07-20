import { useState, useEffect } from "react";
import LeadProfileForm from "../components/LeadProfileForm";
import "../components/portal.css"; // Ensure this import is here!

const TEAM_LEADS = ["Unassigned", "Manohar", "Narayan"];
const LEAD_STATUSES = ["New", "Attempted Contact", "Connected", "Qualified", "Disqualified"];

export default function Portal({ currentUser, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

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

  const handleAssign = async (id, newLead) => {
    try {
      const res = await fetch(`/api/messages/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: newLead }) 
      });
      
      if (res.ok) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, assigned_to: newLead } : msg
        ));
      } else {
        alert("Failed to assign lead on the server.");
      }
    } catch (error) {
      alert("Network error while assigning lead.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/messages/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }) 
      });
      
      if (res.ok) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, status: newStatus } : msg
        ));
      } else {
        alert("Failed to update status on the server.");
      }
    } catch (error) {
      alert("Network error while updating status.");
    }
  };

  const handleUpdateLeadProfile = async (id, updatedData) => {
    try {
      const res = await fetch(`/api/messages/${id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      
      if (res.ok) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, ...updatedData } : msg
        ));
        setSelectedLead(null);
      } else {
        alert("Failed to save lead profile.");
      }
    } catch (error) {
      alert("Network error while saving.");
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

  if (loading) return <div className="portal-wrapper"><div className="empty-state">Loading portal data...</div></div>;
  if (error) return <div className="portal-wrapper"><div className="empty-state error-text">Error: {error}</div></div>;

  const displayedMessages = currentUser?.role === "admin" 
    ? messages 
    : messages.filter(msg => msg.assigned_to === currentUser?.name);

  return (
    <div className="portal-wrapper">
      <div className="portal-container">
        
        <div className="portal-header">
          <h2 className="portal-title">Lead Assignment Portal</h2>
          
          <div className="user-controls">
            <p className="user-info">Logged in as: <strong>{currentUser?.name} ({currentUser?.role})</strong></p>
            <button onClick={onLogout} className="btn-logout">Logout</button>
          </div>
        </div>
        
        {displayedMessages.length === 0 ? (
          <p className="empty-state">No messages found.</p>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedMessages.map((msg) => (
                  <tr key={msg.id}>
                    <td><strong>{msg.name}</strong></td>
                    <td><a href={`mailto:${msg.email}`} className="email-link">{msg.email}</a></td>
                    <td className="message-cell" title={msg.message}>{msg.message}</td>
                    <td className="date-cell">{new Date(msg.created_at).toLocaleDateString()}</td>
                    
                    {/* Assignment Column */}
                    <td>
                      {currentUser?.role === "admin" ? (
                        <select 
                          className="portal-select"
                          value={msg.assigned_to || "Unassigned"} 
                          onChange={(e) => handleAssign(msg.id, e.target.value)}
                        >
                          {TEAM_LEADS.map(lead => (
                            <option key={lead} value={lead}>{lead}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="static-text">{msg.assigned_to}</span>
                      )}
                    </td>

                    {/* Status Column */}
                    <td>
                      {currentUser?.name === msg.assigned_to || currentUser?.role === "admin" ? (
                        <select 
                          className="portal-select"
                          value={msg.status || "New"} 
                          onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                        >
                          {LEAD_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="static-text muted">{msg.status || "New"}</span>
                      )}
                    </td>
                    
                    {/* Actions Column */}
                    <td className="action-buttons">
                      {(currentUser?.name === msg.assigned_to || currentUser?.role === "admin") && (
                        <button onClick={() => setSelectedLead(msg)} className="btn-log">
                          Log Activity
                        </button>
                      )}

                      {currentUser?.role === "admin" && (
                        <button onClick={() => handleDelete(msg.id)} className="btn-del">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedLead && (
          <LeadProfileForm 
            lead={selectedLead} 
            onClose={() => setSelectedLead(null)} 
            onSave={handleUpdateLeadProfile} 
          />
        )}
      </div>
    </div>
  );
}