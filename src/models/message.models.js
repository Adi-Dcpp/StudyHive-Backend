import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        }
    },
    {
        timestamps: true,
    }
)

messageSchema.index({ group: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);