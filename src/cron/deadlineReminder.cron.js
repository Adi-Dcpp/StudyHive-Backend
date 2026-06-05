import cron from "node-cron";

import { Assignment } from "../models/assignment.models.js";
import { Goal } from "../models/goal.models.js";
import { Submission } from "../models/submission.models.js";

import { createManyNotifications } from "../services/notification.services.js";

const startDeadlineReminderCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("Running deadline reminder cron job...");

      const now = new Date();

      const next24Hours = new Date(
        now.getTime() + 24 * 60 * 60 * 1000,
      );

      const assignments = await Assignment.find({
        isActive: true,
        deadlineReminderSent: false,
        deadline: {
          $gte: now,
          $lte: next24Hours,
        },
      }).select("title deadline groupId goalId");

      for (const assignment of assignments) {
        const goal = await Goal.findById(
          assignment.goalId,
        ).select("assignedTo");

        if (!goal || !goal.assignedTo?.length) {
          continue;
        }

        const submissions = await Submission.find({
          assignmentId: assignment._id,
          status: {
            $in: [
              "submitted",
              "reviewed",
              "revision_required",
            ],
          },
        }).select("userId");

        const submittedUserIds = submissions.map(
          (submission) =>
            submission.userId.toString(),
        );

        const pendingLearners = goal.assignedTo.filter(
          (learnerId) =>
            !submittedUserIds.includes(
              learnerId.toString(),
            ),
        );

        if (!pendingLearners.length) {
          assignment.deadlineReminderSent = true;

          await assignment.save();

          continue;
        }

        const notifications = pendingLearners.map(
          (learnerId) => ({
            recipient: learnerId,
            type: "deadline_reminder",
            title: "Assignment Deadline Reminder",
            body: `Assignment "${assignment.title}" is due within 24 hours.`,
            refId: assignment._id,
            refModel: "Assignment",
          }),
        );

        try {
          await createManyNotifications(
            notifications,
          );

          assignment.deadlineReminderSent = true;

          await assignment.save();

          console.log(
            `Deadline reminders sent for assignment: ${assignment.title}`,
          );
        } catch (error) {
          console.error(
            "Failed to create deadline reminders:",
            error,
          );
        }
      }
    } catch (error) {
      console.error(
        "Deadline reminder cron job failed:",
        error,
      );
    }
  });
};

export { startDeadlineReminderCron };