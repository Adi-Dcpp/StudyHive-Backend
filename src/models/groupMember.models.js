import mongoose, { Schema } from "mongoose";

const groupMemberSchema = new Schema(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["mentor", "learner"],
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

export const GroupMember = mongoose.model(
  "GroupMember",
  groupMemberSchema
);
