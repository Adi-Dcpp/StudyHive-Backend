import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "new_assignment",
        "submission_reviewed",
        "revision_required",
        "new_announcement",
        "goal_assigned",
        "deadline_reminder",
        "group_message",
      ],
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    refModel: {
      type: String,
      enum: ["Assignment", "Submission", "Announcement", "Goal", "Message"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

export const Notification = mongoose.model("Notification", notificationSchema);
