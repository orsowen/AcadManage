import DepositPeriod from "../models/DepositPeriod.js";


export const isDepotOpen = (For = "STAGE", message) => async (req, res, next) => {
    try {
        const { lateDepotCode } = req.body;

        // If the user is not an admin, check the deposit period or late code
        if (req.user.role !== "admin") {
            const currentDate = new Date();

            // Build query dynamically
            const query = {
                For: For.toUpperCase(),
                $or: [
                    { Start_Deposit: { $lte: currentDate }, End_Deposit: { $gte: currentDate } }, // Active period
                ],
            };

            // Add lateDepotCode condition only if it's provided and not null
            if (lateDepotCode) {
                query.$or.push({ lateDepotCode });
            }

            // Fetch deposit period with conditions
            const period = await DepositPeriod.findOne(query);

            // If no valid period is found, return an error
            if (!period) {
                return res.status(403).json({
                    error:
                        message ??
                        `Operation for ${For} can only be done during the deposit period or with a valid late deposit code.`,
                });
            }
        }
        next();
    } catch (error) {
        console.error("Error in isDepotOpen middleware:", error.message);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};
