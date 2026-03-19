require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Department = require("./models/Department");
const Doctor = require("./models/Doctor");

const SEED_DATA = {
  admin: {
    name: "QueueLess Hospital Admin",
    mobile: "9876543210",
    email: "queueless9@gmail.com",
    password: "QueueLess@MD#2026",
    role: "MD",
  },
  department: {
    name: "General Medicine",
  },
  doctor: {
    name: "Dr. Arjun Ravi",
    mobile: "9876543211",
    email: "dr.ravi@queueless.com",
    password: "Dr@123",
    specialization: "General Physician",
    role: "DOCTOR",
  },
};

async function seed() {
  console.log("\n🌱 QueueLess Seed Script");
  console.log("========================\n");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // 1. Create MD
    let adminUser = await User.findOne({ mobile: SEED_DATA.admin.mobile });
    if (adminUser) {
      console.log("⚠️  MD account already exists — skipping.");
    } else {
      const hash = await bcrypt.hash(SEED_DATA.admin.password, 10);
      adminUser = await User.create({
        name: SEED_DATA.admin.name,
        mobile: SEED_DATA.admin.mobile,
        email: SEED_DATA.admin.email,
        password: hash,
        role: "MD",
      });
      console.log("✅ MD (Admin) created:");
      console.log(`   Mobile   : ${SEED_DATA.admin.mobile}`);
      console.log(`   Email    : ${SEED_DATA.admin.email}`);
      console.log(`   Password : ${SEED_DATA.admin.password}`);
    }

    // 2. Create Department
    let dept = await Department.findOne({ name: SEED_DATA.department.name });
    if (dept) {
      console.log("\n⚠️  Department already exists — skipping.");
    } else {
      const count = await Department.countDocuments();
      const deptId = `DEPT-${String(count + 1).padStart(3, "0")}`;
      dept = await Department.create({ name: SEED_DATA.department.name, deptId });
      console.log(`\n✅ Department created: "${dept.name}" (${dept.deptId})`);
    }

    // 3. Create Doctor
    let doctorUser = await User.findOne({ mobile: SEED_DATA.doctor.mobile });
    if (doctorUser) {
      console.log("\n⚠️  Doctor account already exists — skipping.");
      // Patch email if missing
      if (!doctorUser.email && SEED_DATA.doctor.email) {
        doctorUser.email = SEED_DATA.doctor.email.toLowerCase();
        await doctorUser.save();
        console.log(`   Email patched: ${SEED_DATA.doctor.email}`);
      }
    } else {
      const hash = await bcrypt.hash(SEED_DATA.doctor.password, 10);
      doctorUser = await User.create({
        name: SEED_DATA.doctor.name,
        mobile: SEED_DATA.doctor.mobile,
        email: SEED_DATA.doctor.email.toLowerCase(),
        password: hash,
        role: "DOCTOR",
        department: dept._id,
      });

      await Doctor.create({
        user: doctorUser._id,
        department: dept._id,
        specialization: SEED_DATA.doctor.specialization,
      });

      console.log(`\n✅ Doctor created:`);
      console.log(`   Name     : ${SEED_DATA.doctor.name}`);
      console.log(`   Mobile   : ${SEED_DATA.doctor.mobile}`);
      console.log(`   Email    : ${SEED_DATA.doctor.email}`);
      console.log(`   Password : ${SEED_DATA.doctor.password}`);
      console.log(`   Dept     : ${dept.name}`);
    }

    console.log("\n🎉 Seed complete!\n");
    console.log("⚠️  IMPORTANT: Change all passwords after first login.\n");

  } catch (err) {
    console.error("\n❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
