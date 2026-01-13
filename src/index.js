import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./db/index.db.js";

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`app is listeing at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server startup failed: ", err);
    process.exit(1);
  });
