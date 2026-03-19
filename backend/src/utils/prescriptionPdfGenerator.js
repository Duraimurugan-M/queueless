const PDFDocument = require("pdfkit");
const path = require("path");

module.exports = function generatePrescriptionPDF(res, prescription) {
  const doc = new PDFDocument({ size: "A4", margin: 0 });

  const visitDate = prescription.createdAt
    ? new Date(prescription.createdAt).toISOString().split("T")[0]
    : "N-A";

  const patientName = prescription.patient?.name
    ? prescription.patient.name.replace(/\s+/g, "_")
    : "Patient";

  const fileName = `Prescription_${visitDate}_${patientName}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  doc.pipe(res);

  // Colors
  const primaryColor = "#0f766e";
  const secondaryColor = "#1e293b";
  const lightGray = "#f1f5f9";
  const accentColor = "#10b981";

  // HEADER BACKGROUND
  doc.rect(0, 0, 595.28, 120).fill(primaryColor);

  // SAFE LOGO LOAD (LOCAL FILE)
  try {
    const logoPath = path.join(__dirname, "../../public/QueueLess-Logo-email.png");
    doc.image(logoPath, 50, 40, { width: 60 });
  } catch (err) {
    console.log("Logo not found, skipping...");
  }

  // HEADER TEXT
  doc
    .fillColor("#ffffff")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("QueueLess Hospital", 130, 45);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("QueueLess Token Management System", 130, 75)
    .text("Email: support@queueless.com | Web: www.queueless.com", 130, 90);

  doc.rect(400, 40, 150, 40).strokeColor("#ffffff").lineWidth(1).stroke();
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#ffffff")
    .text("PRESCRIPTION", 410, 55, { width: 130, align: "center" });

  const contentMargin = 50;
  let currentY = 150;

  // PATIENT INFO BOX
  doc.rect(contentMargin, currentY, 495, 80).fill(lightGray);
  doc.fillColor(secondaryColor).fontSize(10).font("Helvetica-Bold");

  doc.text(
    `PATIENT: ${prescription.patient?.name?.toUpperCase() || "N/A"}`,
    contentMargin + 15,
    currentY + 20,
  );

  doc
    .font("Helvetica")
    .text(
      `AGE: ${prescription.patient?.age || "N/A"}`,
      contentMargin + 15,
      currentY + 40,
    )
    .text(`DATE: ${visitDate}`, contentMargin + 15, currentY + 60);

  // 🔥 FIXED TOKEN NUMBER (From populated token)
  const tokenNumber = prescription.token?.tokenNumber || "N/A";

  doc
    .font("Helvetica-Bold")
    .text(
      `DOCTOR: Dr. ${prescription.doctor?.user?.name || "N/A"}`,
      320,
      currentY + 20,
    );

  doc
    .font("Helvetica")
    .text(
      `DEPT: ${prescription.department?.name || "N/A"}`,
      320,
      currentY + 40,
    );

  doc.text(
    `TOKEN NO: #${prescription.token?.tokenNumber || "N/A"}`,
    320,
    currentY + 60,
  );

  doc.text(
    `SLOT TIME: ${prescription.token?.slotTime || "N/A"}`,
    320,
    currentY + 75,
  );

  currentY += 110;

  // DIAGNOSIS
  doc
    .fillColor(primaryColor)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Diagnosis & Clinical Notes", contentMargin, currentY);

  doc
    .moveTo(contentMargin, currentY + 18)
    .lineTo(545, currentY + 18)
    .strokeColor(primaryColor)
    .lineWidth(1)
    .stroke();

  doc
    .fillColor(secondaryColor)
    .fontSize(11)
    .font("Helvetica")
    .text(
      prescription.diagnosisNotes || "No notes provided.",
      contentMargin,
      currentY + 30,
      { width: 495 },
    );

  currentY += 80;

  // MEDICINES HEADER
  doc
    .fillColor(primaryColor)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Prescribed Medicines (Rx)", contentMargin, currentY);

  doc
    .moveTo(contentMargin, currentY + 18)
    .lineTo(545, currentY + 18)
    .strokeColor(primaryColor)
    .stroke();

  currentY += 35;

  prescription.medicines.forEach((med, index) => {
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    const timingText = Array.isArray(med.timing)
      ? med.timing.join(", ")
      : med.timing;

    doc
      .fillColor(secondaryColor)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`${index + 1}. ${med.name}`, contentMargin, currentY);

    doc
      .fillColor(accentColor)
      .fontSize(10)
      .text(`${timingText} | ${med.foodInstruction}`, 350, currentY, {
        align: "right",
        width: 195,
      });

    doc
      .fillColor("#666666")
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text(
        `Notes: ${med.sideEffects || "No specific side effects noted."}`,
        contentMargin + 15,
        currentY + 15,
      );

    currentY += 40;
  });

  // FOOTER
  const footerY = 780;
  doc.rect(0, footerY, 595.28, 62).fill(lightGray);

  doc
    .fillColor("#94a3b8")
    .fontSize(9)
    .font("Helvetica")
    .text(
      "This is a digitally generated prescription from QueueLess Hospital System.",
      0,
      footerY + 15,
      { align: "center", width: 595.28 },
    );

  doc.text(
    "Visit our website to track your health history and future appointments.",
    0,
    footerY + 30,
    { align: "center", width: 595.28 },
  );

  doc.on("error", (err) => {
    console.error("PDF Error:", err);
  });

  doc.end();
};;
