import schedule from "node-schedule";
import { sendMail } from "../controllers/mailer.js";
import DepositPeriod from "../models/DepositPeriod.js";
import Internship from "../models/Internship.js";
import Student from "../models/Student.js";

const notifyAboutDepositDeadline = async (For = "STAGE", days = 2) => {
    try {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + days); // days days from today

        // Find a single active deposit period ending soon
        const depositPeriod = await DepositPeriod.findOne({
            For,
            End_Deposit: { $lte: thresholdDate, $gte: today },
        });

        if (!depositPeriod) {
            console.log(`No deposit periods ending soon for ${For}.`);
            return;
        }

        console.log(`Processing deposit period for ${depositPeriod.For}, ending on ${depositPeriod.End_Deposit}`);

        // Find students who have already submitted their internship
        const internships = await Internship.find({ isArchived: false }).select("student");
        const submittedStudentIds = internships.map((internship) => internship.student.toString());

        // Find students who have not submitted their internship
        const nonSubmittedStudents = await Student.find({
            _id: { $nin: submittedStudentIds },
        }).populate("user", "email firstName lastName");

        // Notify students who haven't submitted
        for (const student of nonSubmittedStudents) {
            const email = student.user?.email;
            if (!email) continue;

            const subject = `Reminder: Deposit Period Ending Soon for ${depositPeriod.For}`;
            const message = `
                <p>Dear ${student.user.firstName} ${student.user.lastName},</p>
                <p>This is a reminder that the deposit period for ${depositPeriod.For} is ending on ${depositPeriod.End_Deposit.toLocaleDateString()}.</p>
                <p>Please ensure your documents are submitted before the deadline to avoid any issues.</p>
                <p>Thank you,</p>
                <p>The Administration Team</p>
            `;

            try {
                await sendMail(email, subject, message);
                console.log(`Notification sent to ${email}`);
            } catch (mailError) {
                console.error(`Failed to send notification to ${email}:`, mailError.message);
            }
        }
    } catch (error) {
        console.error("Error notifying students about deposit deadlines:", error.message);
    }
};

// Schedule the job to run every day at 8:00 AM
schedule.scheduleJob("0 8 * * *", () => notifyAboutDepositDeadline("STAGE"));
