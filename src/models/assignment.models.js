import mongoose, { Schema } from "mongoose";

const assignmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deadline: {
      type: Date,
      index: true,
    },
    referenceMaterials: [
      {
        type: String,
        trim: true,
      },
    ],
    maxMarks: {
      type: Number,
      default: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);
assignmentSchema.index({ goalId: 1, isActive: 1 });

export const Assignment =
  mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
