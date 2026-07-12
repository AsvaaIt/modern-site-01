import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net", // GoDaddy SMTP host
  port: 587,                        // TLS port (works almost always)
  secure: false,                     // must be false for port 587
  auth: {
    user: "info@asvaa-it.in",
    pass: "InA$v@@!t2025",  // your email password or App Password
  },
  tls: {
    rejectUnauthorized: false        // helps with TLS handshake
  },
});

transporter.sendMail({
  from: '"Test" <info@asvaait.in>',
  to: "info@asvaait.in",
  subject: "Test Email",
  text: "Hello from Node!",
})
.then(() => console.log("✅ Mail sent!"))
.catch(console.error);
