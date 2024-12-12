import DepositPeriod from "../models/DepositPeriod.js";


export const isDepotOpen = (For = "STAGE", message = undefined) => async (req, res, next) => {
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
                    error: message === undefined ? `Operation for ${For} can only be done during the deposit period.` : message,
                });
            }
        }
        next();
    } catch (e) {
        // Use e.message for the error from catch block
        res.status(401).json({ error: e.message });
    }
};
