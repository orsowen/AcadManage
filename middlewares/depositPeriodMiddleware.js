import DepositPeriod from "../models/DepositPeriod.js";

// For can be STAGE or PFE or PFA
export const isDepotOpen = (For = "STAGE", operation = "create") => async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            // Check if the current period allows STAGE deposits
            const currentPeriod = await DepositPeriod.findOne({
                For: For.toUpperCase(),
                Start_Deposit: { $lte: new Date() },
                End_Deposit: { $gte: new Date() }
            });
            if (!currentPeriod) {
                return res.status(403).json({
                    error: `${For} can only be ${operation}d during the deposit period.`
                });
            }
        }
        next();
    } catch (e) {
        // Use e.message for the error from catch block
        res.status(401).json({ error: e.message });
    }
};
