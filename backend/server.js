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

// Contacts table (Contact Us messages)
db.exec(`
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

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