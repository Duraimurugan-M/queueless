/**
 * ============================================================
 * QueueLess — Email Service
 * ============================================================
 *
 * DUAL MODE:
 *  DEV  → Nodemailer + Brevo SMTP (port 587)
 *  PROD → Brevo Transactional REST API
 *
 * Why dual mode?
 *   Render.com (and many cloud hosts) block outbound port 587.
 *   Brevo's REST API works on HTTPS (443) — no port issues.
 *
 * How it switches:
 *   If BREVO_API_KEY is in .env  →  uses Brevo REST API  ✅ production
 *   If no BREVO_API_KEY           →  uses Nodemailer SMTP ✅ development
 *
 * .env for development (SMTP):
 *   SMTP_HOST=smtp-relay.brevo.com
 *   SMTP_PORT=587
 *   SMTP_USER=your_brevo_login@email.com
 *   SMTP_PASS=your_brevo_smtp_key
 *   EMAIL_FROM=noreply@yourdomain.com
 *   EMAIL_FROM_NAME=QueueLess Hospital
 *   FRONTEND_URL=http://localhost:5173
 *
 * .env for production (Brevo API — use this on Render):
 *   BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxx
 *   EMAIL_FROM=noreply@yourdomain.com
 *   EMAIL_FROM_NAME=QueueLess Hospital
 *   FRONTEND_URL=https://your-frontend.vercel.app
 *   BACKEND_URL=https://your-backend.onrender.com
 * ============================================================
 */

const nodemailer = require("nodemailer");

const USE_BREVO_API = !!process.env.BREVO_API_KEY;

let smtpTransporter = null;
if (!USE_BREVO_API) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Core unified send function ────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const fromEmail = process.env.EMAIL_FROM      || "queueless9@gmail.com";
  const fromName  = process.env.EMAIL_FROM_NAME || "QueueLess Hospital";

  if (USE_BREVO_API) {
    // Brevo REST API — works on Render/Railway/Fly.io
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method:  "POST",
      headers: {
        "accept":       "application/json",
        "content-type": "application/json",
        "api-key":      process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender:      { name: fromName, email: fromEmail },
        to:          [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Brevo API ${res.status}: ${errText}`);
    }
    return res.json();
  } else {
    // Nodemailer SMTP — for local dev
    return smtpTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });
  }
}

// ─────────────────────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────

exports.sendOTPEmail = async (toEmail, otp) => {
  await sendEmail({
    to: toEmail,
    subject: "🔐 Your Password Reset Code - QueueLess",
    html: `
    <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f0f4f8;padding:40px 0;line-height:1.6;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1);border:1px solid #e1e8ed;">
        <div style="background-color:#0f766e;padding:30px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">QueueLess Hospital</h1>
        </div>
        <div style="padding:40px 30px;text-align:center;">
          <h2 style="color:#1e293b;margin-top:0;">Verify Your Identity</h2>
          <p style="color:#64748b;font-size:15px;">Use the code below to reset your password. It expires in 5 minutes.</p>
          <div style="margin:30px 0;padding:20px;background:#f1f5f9;border-radius:12px;border:2px dashed #0f766e;">
            <span style="display:block;font-size:11px;text-transform:uppercase;color:#0f766e;font-weight:bold;margin-bottom:10px;letter-spacing:2px;">Verification Code</span>
            <span style="font-size:36px;font-weight:800;color:#0f766e;letter-spacing:8px;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#94a3b8;font-size:12px;">Didn't request this? You can safely ignore this email.</p>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; ${new Date().getFullYear()} QueueLess Hospital</p>
        </div>
      </div>
    </div>`,
  });
};

exports.sendWelcomeEmail = async (toEmail, name) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  await sendEmail({
    to: toEmail,
    subject: "🎉 Welcome to QueueLess Hospital",
    html: `
    <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f0f4f8;padding:40px 0;line-height:1.6;">
      <div style="max-width:550px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#0f766e,#134e4a);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Welcome to QueueLess</h1>
        </div>
        <div style="padding:40px 35px;">
          <h2 style="color:#1e293b;margin-top:0;">Hello, ${name}!</h2>
          <p style="color:#475569;font-size:15px;">Your account is ready. Book your first token and skip the waiting room!</p>
          <div style="background:#f8fafc;border-left:4px solid #0f766e;padding:20px;margin:20px 0;border-radius:0 12px 12px 0;">
            <p style="margin:0 0 8px;font-weight:600;color:#0f766e;">What you can do:</p>
            <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;">
              <li style="margin-bottom:6px;">🚀 Book hospital tokens online — no physical queues</li>
              <li style="margin-bottom:6px;">📅 Track your queue live from your phone</li>
              <li style="margin-bottom:6px;">📋 Access and download digital prescriptions</li>
            </ul>
          </div>
          <div style="text-align:center;margin-top:30px;">
            <a href="${frontendUrl}/login" style="background:#0f766e;color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
              Go to My Dashboard
            </a>
          </div>
        </div>
        <div style="background:#f1f5f9;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; ${new Date().getFullYear()} QueueLess Hospital Management System</p>
        </div>
      </div>
    </div>`,
  });
};

exports.sendPasswordResetConfirmation = async (toEmail, name) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  await sendEmail({
    to: toEmail,
    subject: "🛡️ Password Changed Successfully - QueueLess",
    html: `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f7f9;padding:40px 0;line-height:1.6;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);border:1px solid #e1e8ed;">
        <div style="background:#0f766e;padding:25px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:18px;">QueueLess Hospital</h1>
        </div>
        <div style="padding:40px;text-align:center;">
          <span style="font-size:48px;">🔒</span>
          <h2 style="color:#1e293b;margin-top:10px;font-size:20px;">Password Updated</h2>
          <p style="color:#475569;font-size:14px;">Hello <b>${name}</b>, your QueueLess password has been changed successfully.</p>
          <div style="background:#fff1f2;border:1px solid #fecdd3;padding:14px;margin:20px 0;border-radius:8px;">
            <p style="margin:0;color:#be123c;font-size:13px;">Didn't do this? Contact the hospital helpdesk immediately.</p>
          </div>
          <a href="${frontendUrl}" style="color:#0f766e;text-decoration:none;font-weight:600;font-size:14px;">Return to QueueLess →</a>
        </div>
        <div style="background:#f8fafc;padding:15px;text-align:center;border-top:1px solid #f1f5f9;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; ${new Date().getFullYear()} QueueLess Hospital</p>
        </div>
      </div>
    </div>`,
  });
};

exports.sendTokenBookedEmail = async (to, patientName, tokenDetails) => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  // PDF download link with JWT so patient can download directly from email
  const pdfLink = `${backendUrl}/api/token/pdf/${tokenDetails.tokenId}?token=${tokenDetails.jwtToken}`;

  await sendEmail({
    to,
    subject: `🎫 Token Confirmed: #${tokenDetails.tokenNumber} - QueueLess`,
    html: `
    <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f0f4f8;padding:40px 0;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#0f766e,#134e4a);padding:30px;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:20px;">Appointment Confirmed</h2>
        </div>
        <div style="padding:30px;text-align:center;">
          <p style="color:#64748b;margin-bottom:20px;">Hello ${patientName}, your visit is confirmed!</p>
          <div style="background:#f1f5f9;border-radius:15px;padding:25px;border:1px dashed #0f766e;display:inline-block;min-width:200px;">
            <span style="display:block;font-size:11px;color:#0f766e;font-weight:bold;text-transform:uppercase;margin-bottom:8px;">Your Token</span>
            <span style="font-size:48px;font-weight:800;color:#1e293b;">#${tokenDetails.tokenNumber}</span>
          </div>
          <div style="text-align:left;margin-top:25px;background:#fafafa;padding:18px;border-radius:10px;">
            <p style="margin:5px 0;color:#475569;font-size:14px;">🕒 <b>Slot Time:</b> ${tokenDetails.slotTime}</p>
            <p style="margin:5px 0;color:#475569;font-size:14px;">🏥 <b>Department:</b> ${tokenDetails.department}</p>
            <p style="margin:5px 0;color:#475569;font-size:14px;">👨‍⚕️ <b>Doctor:</b> ${tokenDetails.doctor}</p>
          </div>
          <p style="color:#ef4444;font-size:12px;margin-top:15px;font-weight:600;">⚠️ Please arrive 10 minutes before your slot.</p>
          <a href="${pdfLink}" style="display:inline-block;background:#0f766e;color:#fff;padding:13px 30px;border-radius:10px;text-decoration:none;font-weight:bold;margin-top:20px;font-size:14px;">
            📄 Download Token PDF
          </a>
        </div>
        <div style="background:#f8fafc;padding:12px;text-align:center;font-size:11px;color:#94a3b8;">
          QueueLess — Wait less, live more.
        </div>
      </div>
    </div>`,
  });
};

exports.sendTokenCancelledEmail = async (to, patientName, tokenNumber) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  await sendEmail({
    to,
    subject: "🚫 Appointment Cancelled - QueueLess",
    html: `
    <div style="font-family:'Segoe UI',sans-serif;background:#fcfcfc;padding:40px 0;">
      <div style="max-width:450px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #fee2e2;padding:40px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
        <h2 style="color:#b91c1c;margin-top:0;">Appointment Cancelled</h2>
        <p style="color:#475569;font-size:14px;">Hello ${patientName}, your appointment <b>(Token #${tokenNumber})</b> has been cancelled.</p>
        <div style="margin:25px 0;padding:15px;background:#fef2f2;border-radius:8px;font-size:13px;color:#991b1b;">
          If you didn't request this cancellation, contact the hospital immediately.
        </div>
        <a href="${frontendUrl}" style="color:#0f766e;font-weight:600;text-decoration:none;font-size:14px;">Book a New Appointment →</a>
      </div>
    </div>`,
  });
};

exports.sendPrescriptionEmail = async (to, patientName, prescriptionId) => {
  // Use BACKEND_URL for direct PDF download (bypasses frontend)
  const backendUrl   = process.env.BACKEND_URL   || "http://localhost:5000";
  const downloadLink = `${backendUrl}/api/prescriptions/${prescriptionId}/pdf`;

  await sendEmail({
    to,
    subject: "💊 Your Digital Prescription is Ready - QueueLess",
    html: `
    <div style="font-family:'Segoe UI',sans-serif;background:#f0f4f8;padding:40px 0;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
        <div style="background:#0f766e;padding:20px;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:18px;">QueueLess Hospital</h2>
        </div>
        <div style="padding:40px;text-align:center;">
          <h2 style="color:#1e293b;margin-top:0;">Prescription Ready</h2>
          <p style="color:#64748b;font-size:14px;">Hello ${patientName}, your consultation is complete. Download your prescription below.</p>
          <a href="${downloadLink}" style="display:inline-block;background:#10b981;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;margin:25px 0;font-size:15px;">
            📥 Download PDF Prescription
          </a>
          <p style="color:#94a3b8;font-size:12px;">Also available under "Visit History" in your patient dashboard.</p>
          <hr style="border:0;border-top:1px solid #f1f5f9;margin:25px 0;">
          <p style="color:#0f766e;font-style:italic;font-size:14px;">"Wishing you a speedy recovery!"</p>
        </div>
        <div style="background:#f8fafc;padding:12px;text-align:center;border-top:1px solid #f1f5f9;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; ${new Date().getFullYear()} QueueLess Hospital</p>
        </div>
      </div>
    </div>`,
  });
};
