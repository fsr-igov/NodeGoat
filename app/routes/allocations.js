const AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;
const {
    environmentalScripts
} = require("../../config/config");

function AllocationsHandler(db) {
    "use strict";

    const allocationsDAO = new AllocationsDAO(db);

    this.displayAllocations = (req, res, next) => {
        // A4 Fix: Always use session userId, not URL parameter
        const { userId } = req.session;
        const requestedUserId = req.params.userId;
        const { threshold } = req.query;

        // A4 Fix: Validate that user can only access their own allocations
        if (String(requestedUserId) !== String(userId)) {
            console.log(`IDOR attempt: User ${userId} tried to access allocations of user ${requestedUserId}`);
            return res.status(403).send("Access denied: You can only view your own allocations.");
        }

        allocationsDAO.getByUserIdAndThreshold(userId, threshold, (err, allocations) => {
            if (err) return next(err);
            return res.render("allocations", {
                userId,
                allocations,
                environmentalScripts
            });
        });
    };
}

module.exports = AllocationsHandler;
