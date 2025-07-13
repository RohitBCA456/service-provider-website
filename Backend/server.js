import { app } from "./app.js";
import { connectDB } from "./Database/Db.js";

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error(`Server error: ${err.message}`);
    });
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error(`Failed to connect to the database: ${error.message}`);
    process.exit(1);
  });
