const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const Candidate = require("../models/candidate");
const electionConfig=require("../models/elections");
const Voter=require("../models/voter");
const bcrypt = require("bcrypt");
const moment = require('moment-timezone'); 
const authenticate = require('../middlewares/authenticate');
const authorizeHead = require('../middlewares/authorizeHead');
const { validateElectionAssignment } = require('../services/electionScope');
const electionConfigs = require("../config/electionConfig");
const syncElectionStatus = require("../services/syncElectionStatus");
const Constituency = require("../models/constituency");
const Participation = require("../models/participation");
const Election = require("../models/election");
router.use(authenticate, authorizeHead);

router.post("/add", async (req, res) => {
  try {
    const { userId, name, password, electionId, constituencyId } = req.body;

    // Validate election & constituency
    const { election, constituency } = await validateElectionAssignment(
      electionId,
      constituencyId
    );
    const config = electionConfigs[election.type];

    if (!config) {
      return res.status(400).json({
        message: "Invalid election type",
      });
    }

    // Validate location data according to election type
    if (config.state && !constituency.state) {
      return res.status(400).json({
        message: "Selected constituency is missing state information",
      });
    }

    if (config.district && !constituency.district) {
      return res.status(400).json({
        message: "Selected constituency is missing district information",
      });
    }

    if (config.city && !constituency.city) {
      return res.status(400).json({
        message: "Selected constituency is missing city information",
      });
    }

    const existingAdmin = await Admin.findOne({ userId });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin with this User ID already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const address = {
      state: constituency.state || null,
      district: constituency.district || null,
      city: constituency.city || null,
    };

    const newAdmin = new Admin({
      userId,
      name,
      password: hashedPassword,
      address,
      electionId,
      constituencyId,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: newAdmin,
    });

  } catch (err) {
    console.error("Error creating admin:", err);

    res.status(400).json({
      message: err.message || "Invalid administrator assignment",
    });
  }
});
router.get('/candidates/:area', async (req, res) => {
  try {
    const area = req.params.area;

  
    const candidates = await Candidate.find({ 'address.area': { $regex: new RegExp(area, 'i') } });

    res.status(200).json(candidates);
  } catch (error) {
    console.error('Error fetching candidates by area:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get("/view", async (req, res) => {
  try {
    const filter = req.query.electionId ? { electionId: req.query.electionId } : {};
    const admins = await Admin.find(filter)
      .populate("electionId", "title type status")
      .populate("constituencyId", "constituencyNumber constituencyName");

    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.delete("/delete/:id", async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});
router.delete("/elections/:electionId/reset", async (req, res) => {

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const { electionId } = req.params;

        const election = await Election.findById(electionId).session(session);

        if (!election) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                message: "Election not found"
            });
        }

        await Participation.deleteMany(
            { electionId },
            { session }
        );

        await Candidate.deleteMany(
            { electionId },
            { session }
        );

        await Admin.deleteMany(
            { electionId },
            { session }
        );

        await Constituency.deleteMany(
            { electionId },
            { session }
        );

        await Election.findByIdAndDelete(
            electionId,
            { session }
        );

        await session.commitTransaction();

        session.endSession();

        res.json({
            message: "Election reset successfully."
        });

    } catch (err) {

        await session.abortTransaction();

        session.endSession();

        console.error(err);

        res.status(500).json({
            message: "Failed to reset election."
        });

    }

});
router.put("/edit/:id", async (req, res) => {
  try {
    const { userId, name, password, electionId, constituencyId } = req.body;
    const { constituency } = await validateElectionAssignment(electionId, constituencyId);
    const address = { state: constituency.state, city: constituency.district };

    const update = { userId, name, address, electionId, constituencyId };
    if (password) update.password = await bcrypt.hash(password, 10);

    const admin = await Admin.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin updated successfully', admin });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid administrator assignment' });
  }
});
router.get('/election', async (req, res) => {
  try {
    const config = await electionConfig.findOne();
    if (!config) return res.status(404).json({ message: 'No election config found' });
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/reset-election', async (req, res) => {
  try {
    
    await Candidate.deleteMany({});

    let config = await electionConfig.findOne();
    config.startTime = null;
      config.endTime = null;
      config.electionLive = false;  
      config.resultVisible=false;  

    res.status(200).json({ message: 'Election reset successfully' });
  } catch (err) {
    console.error('Error resetting election:', err);
    res.status(500).json({ message: 'Server error during reset' });
  }
});
router.post('/set', async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const start = moment.tz(startTime, 'Asia/Kolkata').toDate();
    const end = moment.tz(endTime, 'Asia/Kolkata').toDate();
    let config = await electionConfig.findOne();

    if (config) {
      
      config.startTime = start;
      config.endTime = end;
      config.electionLive = true;  
      config.resultVisible=false;   
    } else {
      
      config = new electionConfig({
        startTime:start,
        endTime:end,
        electionLive: true,         
        resultVisible: false         
      });
    }

    await config.save();
    res.status(200).json({ message: 'Election config saved or updated', config });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// router.post("/show-results/:electionId", async (req, res) => {
//   try {
//     const { electionId } = req.params;

//     const election = await Election.findById(electionId);

//     if (!election) {
//       return res.status(404).json({
//         message: "Election not found."
//       });
//     }

//     if (election.status !== "Completed") {
//       return res.status(400).json({
//         message: "Only completed elections can have their results published."
//       });
//     }

//     if (election.resultVisible) {
//       return res.status(400).json({
//         message: "Results have already been published."
//       });
//     }

//     election.resultVisible = true;

//     await election.save();

//     res.status(200).json({
//       message: "Results are now visible to voters.",
//       election
//     });

//   } catch (err) {
//     console.error("Error publishing results:", err);

//     res.status(500).json({
//       message: "Server error."
//     });
//   }
// });
module.exports = router;

