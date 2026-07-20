import express from "express";
import http from "http";
import { Server } from "socket.io";
import useragent from "useragent";
import geoip from "geoip-lite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import nodemailer from "nodemailer";

dotenv.config({
  path: path.join(process.cwd(), ".env")
});

console.log("ENV CHECK");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");
console.log("EMAIL_TO:", process.env.EMAIL_TO);
console.log("SAMBANOVA_KEY:", process.env.SAMBANOVA_API_KEY ? "Loaded" : "Missing"); // AI Key Check

// =======================
// Email Configuration
// =======================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // false for Port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  authMethod: 'LOGIN',
  tls: {
    rejectUnauthorized: false
  }
});

// Test the connection immediately on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ SMTP Connection Failed:");
    console.log(error.message);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
});

const app = express();
console.log("✅ THIS IS MY SERVER.JS");
const server = http.createServer(app);

// =======================
// Middleware
// =======================
app.use(express.json());

app.use((req, res, next) => {
  console.log("Origin:", req.headers.origin);
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  next();
});

app.use(cors());

// =======================
// Socket.IO
// =======================
const io = new Server(server, {
  cors: {
    origin: "http://192.168.29.15",
    methods: ["GET", "POST"],
  },
});

// =======================
// SQLite Setup
// =======================
const db = new sqlite3.Database("./app.db");

// Visitors table
db.exec(`
CREATE TABLE IF NOT EXISTS visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT,
  ip TEXT,
  url TEXT,
  method TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  country TEXT,
  city TEXT
);
`);

// Contacts table (UPDATED schema with BANT and Status)
db.exec(`
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  assigned_to TEXT DEFAULT 'Unassigned',
  status TEXT DEFAULT 'New',
  budget TEXT DEFAULT '',
  authority TEXT DEFAULT '',
  need TEXT DEFAULT '',
  timeline TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// AUTO-MIGRATION: Safely add new columns to existing contacts table if they are missing
const newColumns = [
  { name: 'status', def: "'New'" },
  { name: 'budget', def: "''" },
  { name: 'authority', def: "''" },
  { name: 'need', def: "''" },
  { name: 'timeline', def: "''" },
  { name: 'notes', def: "''" }
];

db.all("PRAGMA table_info(contacts)", (err, columns) => {
  if (!err && columns) {
    const existingColNames = columns.map(c => c.name);
    newColumns.forEach(col => {
      if (!existingColNames.includes(col.name)) {
        db.run(`ALTER TABLE contacts ADD COLUMN ${col.name} TEXT DEFAULT ${col.def}`, (alterErr) => {
          if (alterErr) console.error(`Error adding ${col.name}:`, alterErr);
          else console.log(`✅ Database Migration: Added missing column '${col.name}' to contacts table`);
        });
      }
    });
  }
});

// Users table (For Admin / Agent portal access)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  role TEXT NOT NULL
);
`);

// Auto-seed default users if table is empty (for testing)
db.get("SELECT count(*) as count FROM users", (err, row) => {
  if (row && row.count === 0) {
    db.run(`INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')`);
    db.run(`INSERT INTO users (username, password, role) VALUES ('Manohar', 'agent123', 'agent')`);
    db.run(`INSERT INTO users (username, password, role) VALUES ('Narayan', 'agent123', 'agent')`);
    console.log("✅ Seeded default Admin and Agent users into database");
  }
});

// =======================
// Visitor Tracking Middleware
// =======================
app.use(async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const agent = useragent.parse(req.headers["user-agent"]);
    const geo = geoip.lookup(ip) || {};

    const visitorInfo = {
      timestamp: new Date().toISOString(),
      ip,
      url: req.originalUrl,
      method: req.method,
      browser: agent.toAgent(),
      os: agent.os.toString(),
      device: agent.device.toString(),
      country: geo.country || "Unknown",
      city: geo.city || "Unknown",
    };

    db.run(
      `INSERT INTO visitors
       (timestamp, ip, url, method, browser, os, device, country, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        visitorInfo.timestamp,
        visitorInfo.ip,
        visitorInfo.url,
        visitorInfo.method,
        visitorInfo.browser,
        visitorInfo.os,
        visitorInfo.device,
        visitorInfo.country,
        visitorInfo.city,
      ],
      (err) => {
        if (err) console.error("Visitor insert error:", err);
      }
    );

    io.emit("new-visitor", visitorInfo);
  } catch (err) {
    console.error("Visitor tracking error:", err);
  }

  next();
});

// =======================
// Portal Login API 
// =======================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT id, username, role FROM users WHERE username = ? AND password = ?", 
    [username, password], 
    (err, user) => {
      if (err) {
        console.error("Login DB error:", err);
        return res.status(500).json({ error: "Server error" });
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.username,
          role: user.role
        }
      });
    }
  );
});

// =======================
// Contact Form + Email
// =======================
app.post("/api/contact", async (req, res) => {
  console.log("Contact request received:", req.body);

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    db.run(
      `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`,
      [name, email, message],
      async function (err) {
        if (err) {
          console.error("Contact insert error:", err);
          return res.status(500).json({
            error: "Server error",
          });
        }

        try {
          // 1. Send email to Admin
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_TO,
            replyTo: email,
            subject: "New Contact Form Submission",
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
              <hr>
              <p>Submitted on ${new Date().toLocaleString()}</p>
            `,
          });

          // 2. Auto Reply to Customer
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Thank you for contacting Asvaa IT",
            html: `
              <h2>Hello ${name},</h2>
              <p>Thank you for contacting <strong>Asvaa IT</strong>.</p>
              <p>We have received your message successfully.</p>
              <p>Our team will contact you shortly.</p>
              <br>
              <p>Regards,</p>
              <strong>Asvaa IT Team</strong>
            `,
          });

          return res.json({
            success: true,
            message: "Message sent successfully.",
          });

        } catch (mailError) {
          console.error("Email Error:", mailError);
          return res.status(500).json({
            success: false,
            message: "Message saved successfully, but email could not be sent.",
          });
        }
      }
    );

  } catch (err) {
    console.error("Contact error:", err);
    return res.status(500).json({
      error: "Server error",
    });
  }
});

// =======================
// AI Chatbot Endpoint (SambaNova)
// =======================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SAMBANOVA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.3-70B-Instruct", 
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are the official AI Assistant for Asvaa IT Solutions."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const rawText = await response.text();

    if (!response.ok) {
      console.error("❌ SambaNova Error! Status:", response.status);
      console.error("Exact Message from SambaNova:", rawText);
      return res.status(500).json({ error: "AI provider error" });
    }

    try {
      const data = JSON.parse(rawText);
      const aiReply = data.choices[0].message.content;
      res.json({ reply: aiReply });
    } catch (parseError) {
      console.error("❌ JSON Parse Error. SambaNova sent:", rawText);
      res.status(500).json({ error: "AI parsing error" });
    }

  } catch (err) {
    console.error("❌ Chat Network error:", err);
    res.status(500).json({ error: "AI Server error" });
  }
});

// =======================
// Get Contact Messages
// =======================
app.get("/api/messages", (req, res) => {
  db.all(
    "SELECT * FROM contacts ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("Fetch messages error:", err);
        return res.status(500).json({ error: "Failed to fetch messages" });
      }
      res.json(rows);
    }
  );
});

// =======================
// Update Assigned Lead & Email 
// =======================
const TEAM_EMAILS = {
  "Manohar Arsid": "info@asvaa-it.in", // <-- UPDATE THESE TO REAL EMAILS
  "Laxmi Narayan Arsid": "info@asvaa-it.in" // <-- UPDATE THESE TO REAL EMAILS
};

app.patch("/api/messages/:id/assign", (req, res) => {
  const { id } = req.params;
  const { lead } = req.body;
  
  // 1. Update the database
  db.run(
    "UPDATE contacts SET assigned_to = ? WHERE id = ?",
    [lead, id],
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to assign lead" });

      // If just changing back to Unassigned, we don't need to email anyone
      if (lead === "Unassigned") {
        return res.json({ success: true, message: "Lead unassigned successfully" });
      }

      // 2. Fetch the newly assigned lead's details to include in the email
      db.get("SELECT * FROM contacts WHERE id = ?", [id], async (fetchErr, contact) => {
        if (fetchErr || !contact) {
          console.error("Could not fetch contact details for email.");
          return res.json({ success: true, message: "Assigned, but email failed." });
        }

        // 3. Send the email to the assigned team member
        const targetEmail = TEAM_EMAILS[lead];
        
        if (targetEmail) {
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_FROM, 
              to: targetEmail,
              subject: `New Lead Assigned: ${contact.name}`,
              html: `
                <h2>You have been assigned a new lead!</h2>
                <p><strong>Name:</strong> ${contact.name}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
                  ${contact.message}
                </blockquote>
                <br>
                <p>Please log in to the portal to manage this lead.</p>
              `
            });
            console.log(`✅ Assignment email sent to ${lead} at ${targetEmail}`);
          } catch (emailErr) {
            console.error("❌ Failed to send assignment email:", emailErr);
          }
        }

        res.json({ success: true, message: "Lead assigned and email sent" });
      });
    }
  );
});

// =======================
// (ADDED) Update Lead Status Only
// =======================
app.patch("/api/messages/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    "UPDATE contacts SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        console.error("Status update error:", err);
        return res.status(500).json({ error: "Failed to update status" });
      }
      res.json({ success: true, status });
    }
  );
});

// =======================
// (ADDED) Update Full Lead Profile (BANT + Notes)
// =======================
app.patch("/api/messages/:id/profile", (req, res) => {
  const { id } = req.params;
  const { status, budget, authority, need, timeline, notes } = req.body;

  db.run(
    `UPDATE contacts 
     SET status = ?, budget = ?, authority = ?, need = ?, timeline = ?, notes = ? 
     WHERE id = ?`,
    [status, budget, authority, need, timeline, notes, id],
    function (err) {
      if (err) {
        console.error("Profile update error:", err);
        return res.status(500).json({ error: "Failed to update profile" });
      }
      res.json({ success: true, message: "Profile updated successfully" });
    }
  );
});

// =======================
// Delete a Message
// =======================
app.delete("/api/messages/:id", (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM contacts WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Failed to delete message" });
    res.json({ success: true, message: "Message deleted" });
  });
});

// =======================
// Get Visitors
// =======================
app.get("/api/visitors", (req, res) => {
  db.all(
    "SELECT * FROM visitors ORDER BY id DESC LIMIT 100",
    [],
    (err, rows) => {
      if (err) {
        console.error("Fetch visitors error:", err);
        return res.status(500).json({ error: "Failed to fetch visitors" });
      }
      res.json(rows);
    }
  );
});

app.get("/test", (req, res) => {
  console.log("Test route called");
  res.json({
    success: true,
    message: "Server is alive",
  });
});

// =======================
// Static Frontend
// =======================
const distPath = path.join(process.cwd(), "..", "dist");

app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});