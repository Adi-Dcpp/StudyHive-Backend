import mongoose , {Schema} from "mongoose";

const announcementSchema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true, "Announcement title can't be empty"],
            minlength: 1,
            maxlength: 200,
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: true,
            index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        body: {
            type: String,
            trim: true,
            required: [true, "Announcement body can't be empty"],
            minlength: 1,
            maxlength: 2000,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },  
    },
    {
        timestamps: true,
    },
);

export const Announcement = mongoose.model("Announcement", announcementSchema);

