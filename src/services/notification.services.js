import { Notification } from "../models/notification.models.js";

const createNotification = async ({
  recipient,
  type,
  title,
  body,
  refId,
  refModel,
}) => {
  return await Notification.create({
    recipient,
    type,
    title,
    body,
    refId,
    refModel,
  });
};

const createManyNotifications = async (notifications) => {
  return await Notification.insertMany(notifications);
};

export {
  createNotification,
  createManyNotifications,
};