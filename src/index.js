import dotenv from "dotenv";
dotenv.config();
const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./db/index.db.js");

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server startup failed: ", err);
    process.exit(1);
  });
