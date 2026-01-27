import mongoose, { Schema } from "mongoose";

const resourceSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Resource title can't be empty"],
      minlength: 1,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: ["file", "link", "note"],
      required: true,
    },
    
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // File-specific fields
    fileUrl: {
      type: String,
      trim: true,
    },
    fileSize: Number,
    fileName: String,

    // Link-specific field
    linkUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

resourceSchema.pre("save", function (next) {
  if (this.type === "file" && !this.fileUrl) {
    return next(new Error("fileUrl is required when type is 'file'"));
  }

  if (this.type === "link" && !this.linkUrl) {
    return next(new Error("linkUrl is required when type is 'link'"));
  }

  if (this.type === "note" && !this.description) {
    return next(new Error("description is required when type is 'note'"));
  }

  next();
});

resourceSchema.index({ group: 1, title: 1 }, { unique: true });

export const Resource = mongoose.model("Resource", resourceSchema);
