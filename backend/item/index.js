const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { socketApi } = require("../socket"); // Assuming socketApi is exported from here

// Item 1: Add - Increases own flower parts by 1
router.post("/add", async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
    }

    try {
        const [teams] = await db.query("SELECT * FROM teams WHERE id = ? LIMIT 1", [userId]);
        if (teams.length === 0) {
            return res.status(404).json({ success: false, message: "Team not found." });
        }
        const team = teams[0];

        if (team.item_add_used) {
            return res.status(403).json({ success: false, message: "Add item has already been used." });
        }

        if (team.flower_parts >= 7) {
            return res.status(400).json({ success: false, message: "Flower parts are already at maximum." });
        }

        const newFlowerParts = team.flower_parts + 1;
        await db.query("UPDATE teams SET flower_parts = ?, item_add_used = TRUE WHERE id = ?", [newFlowerParts, userId]);

        const response = { success: true, userId, newFlowerParts, newTotalScore: team.score };
        socketApi.io.emit("SCORE_UPDATE", response); // Use the same event as the scoring logic for consistency
        res.status(200).json(response);

    } catch (err) {
        console.error("Error using Add item:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Item 2: Burn - Decreases a target's flower parts by 1
router.post("/burn", async (req, res) => {
    const { userId, targetId } = req.body;
    if (!userId || !targetId) {
        return res.status(400).json({ success: false, message: "User ID and Target ID are required." });
    }
    if (userId === targetId) {
        return res.status(400).json({ success: false, message: "Cannot target your own team." });
    }

    try {
        const [attackers] = await db.query("SELECT * FROM teams WHERE id = ? LIMIT 1", [userId]);
        const [victims] = await db.query("SELECT * FROM teams WHERE id = ? LIMIT 1", [targetId]);

        if (attackers.length === 0 || victims.length === 0) {
            return res.status(404).json({ success: false, message: "Attacker or victim team not found." });
        }
        const attacker = attackers[0];
        const victim = victims[0];

        if (attacker.item_burn_used) {
            return res.status(403).json({ success: false, message: "Burn item has already been used." });
        }
        if (victim.is_burned) {
            return res.status(400).json({ success: false, message: "Target team has already been burned." });
        }
        if (victim.flower_parts <= 3) {
            return res.status(400).json({ success: false, message: "Cannot burn a team with 3 or fewer flower parts." });
        }

        // Update attacker
        await db.query("UPDATE teams SET item_burn_used = TRUE WHERE id = ?", [userId]);
        // Update victim
        const newFlowerParts = victim.flower_parts - 1;
        await db.query("UPDATE teams SET flower_parts = ?, is_burned = TRUE WHERE id = ?", [newFlowerParts, targetId]);

        // Emit update for victim
        const response = { success: true, message: `Team ${attacker.name} burned Team ${victim.name}!` };
        socketApi.io.emit("SCORE_UPDATE", { userId: targetId, newFlowerParts, newTotalScore: victim.score });
        res.status(200).json(response);

    } catch (err) {
        console.error("Error using Burn item:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Item 3: Revive - Restores own flower parts to 5
router.post("/revive", async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
    }

    try {
        const [teams] = await db.query("SELECT * FROM teams WHERE id = ? LIMIT 1", [userId]);
        if (teams.length === 0) {
            return res.status(404).json({ success: false, message: "Team not found." });
        }
        const team = teams[0];

        if (team.item_revive_used) {
            return res.status(403).json({ success: false, message: "Revive item has already been used." });
        }
        if (team.flower_parts >= 5) {
            return res.status(400).json({ success: false, message: "Can only use Revive with fewer than 5 flower parts." });
        }

        const newFlowerParts = 5;
        await db.query("UPDATE teams SET flower_parts = ?, item_revive_used = TRUE WHERE id = ?", [newFlowerParts, userId]);

        const response = { success: true, userId, newFlowerParts, newTotalScore: team.score };
        socketApi.io.emit("SCORE_UPDATE", response);
        res.status(200).json(response);

    } catch (err) {
        console.error("Error using Revive item:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// GET all teams data
router.get("/", async (req, res) => {
    try {
        const [teams] = await db.query("SELECT * FROM teams ORDER BY score DESC");
        res.status(200).json({ success: true, data: teams });
    } catch (err) {
        console.error("Error fetching teams data:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


module.exports = router;
