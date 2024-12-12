import schedule from "node-schedule";
import { sendMail } from "../controllers/mailer.js";
import DepositPeriod from "../models/DepositPeriod.js";
import Internship from "../models/Internship.js";
import Student from "../models/Student.js";


export const notifyAboutDepositDeadline = async (For = "STAGE", days = 3, isTest = false) => {
    try {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + days); // days from today

        // Find active deposit periods ending soon
        const depositPeriods = await DepositPeriod.findOne({
            End_Deposit: { $lte: thresholdDate, $gte: today },
            For,
        });

        if (!depositPeriods) {
            console.log("No deposit periods ending soon.");
            return;
        }

        console.log(`Processing deposit period for ${depositPeriods.For}, ending ${depositPeriods.End_Deposit}`);

        // Find students who haven't submitted their internship
        const internships = await Internship.find({ isArchived: false }).select("student");
        const submittedStudentIds = internships.map((internship) => internship.student.toString());

        // Get students who have not submitted
        const nonSubmittedStudents = await Student.find({
            _id: { $nin: submittedStudentIds },
        }).populate("user", "email firstName lastName");

        for (const student of nonSubmittedStudents) {
            const email = student.user?.email;
            if (!email) continue;

            // Send notification email
            const subject = `Reminder: Deposit Period Ending Soon for ${depositPeriods.For}`;
            const message = `
                <p>Dear ${student.user.firstName} ${student.user.lastName},</p>
                <p>This is a reminder that the deposit period for ${depositPeriods.For} is ending on ${depositPeriods.End_Deposit.toLocaleDateString()}.</p>
                <p>Please ensure your documents are submitted before the deadline to avoid any issues.</p>
                <p>Thank you,</p>
                <p>The Administration Team</p>
            `;

            if (!isTest) {
                await sendMail(email, subject, message);
                console.log(`Notification sent to ${email}`);
            } else {
                console.log(`Test notification (not sent) to ${email}`);
            }
        }
    } catch (error) {
        console.error("Error notifying students about deposit deadlines:", error.message);
    }
};

// Schedule the job to run every day at 8:00 AM
schedule.scheduleJob("0 8 * * *", () => notifyAboutDepositDeadline());