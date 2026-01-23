import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    submittedFile: {
      type: String,
      trim: true,
    },
    submittedText: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "reviewed", "revision_required"],
      default: "pending",
    },
    marksObtained: {
      type: Number,
    },
    feedback: {
      type: String,
      trim: true,
    },
    submittedAt: Date,
    reviewedAt: Date,
  },
  {
    timestamps: true,
  },
);

submissionSchema.index({ assignmentId: 1, userId: 1 }, { unique: true });

export const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
