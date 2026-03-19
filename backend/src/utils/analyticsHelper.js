const Token = require("../models/Token");

/**
 * Calculate token statistics for a rolling 24-hour window
 * @param {Object} filterQuery - MongoDB query to filter tokens (e.g., { doctor: doctorId })
 * @returns {Promise<Object>} Object with totalPatients, completedCount, cancelledCount, tokenDetails
 */
exports.calculateTokenStats = async (filterQuery = {}) => {
  try {
    // Rolling 24-hour window
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

    // Merge time range with provided filter
    const query = {
      ...filterQuery,
      createdAt: { $gte: start, $lte: end }
    };

    // Fetch tokens
    const tokens = await Token.find(query).populate({
      path: "doctor",
      populate: [
        {
          path: "user",
          model: "User",
          select: "name"
        },
        {
          path: "department",
          model: "Department",
          select: "name"
        }
      ]
    });

    if (!tokens || tokens.length === 0) {
      return {
        totalPatients: 0,
        completedCount: 0,
        cancelledCount: 0,
        pendingCount: 0,
        tokenDetails: []
      };
    }

    // Initialize counters
    let totalPatients = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let pendingCount = 0;
    const tokenDetails = [];

    // Process tokens
    tokens.forEach((token) => {
      totalPatients++;

      // Status counting
      switch (token.status) {
        case "COMPLETED":
          completedCount++;
          break;
        case "CANCELLED":
          cancelledCount++;
          break;
        case "BOOKED":
          pendingCount++;
          break;
        default:
          break;
      }

      // Store token details
      tokenDetails.push({
        _id: token._id,
        tokenNumber: token.tokenNumber,
        slotTime: token.slotTime,
        status: token.status,
        doctor: token.doctor?.user?.name || "N/A",
        department: token.doctor?.department?.name || "N/A",
        createdAt: token.createdAt
      });
    });

    return {
      totalPatients,
      completedCount,
      cancelledCount,
      pendingCount,
      tokenDetails
    };

  } catch (error) {
    throw error;
  }
};

/**
 * Get department-wise and doctor-wise statistics
 * @param {Object} filterQuery - MongoDB query to filter tokens
 * @returns {Promise<Object>} Object with departmentStats, doctorStats
 */
exports.calculateDetailedStats = async (filterQuery = {}) => {
  try {
    // Rolling 24-hour window
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

    const query = {
      ...filterQuery,
      createdAt: { $gte: start, $lte: end }
    };

    const tokens = await Token.find(query).populate({
      path: "doctor",
      populate: [
        {
          path: "user",
          model: "User",
          select: "name"
        },
        {
          path: "department",
          model: "Department",
          select: "name"
        }
      ]
    });

    if (!tokens || tokens.length === 0) {
      return {
        departmentStats: {},
        doctorStats: {}
      };
    }

    const departmentStats = {};
    const doctorStats = {};

    // Process tokens
    tokens.forEach((token) => {
      // Department-wise count
      const deptName = token.doctor?.department?.name || "Unknown";
      departmentStats[deptName] = (departmentStats[deptName] || 0) + 1;

      // Doctor-wise count
      const doctorName = token.doctor?.user?.name || "Unknown";
      doctorStats[doctorName] = (doctorStats[doctorName] || 0) + 1;
    });

    return {
      departmentStats,
      doctorStats
    };

  } catch (error) {
    throw error;
  }
};
