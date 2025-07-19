import { app, server } from "./app.js"; // server is likely http.createServer(app)
import { connectDB } from "./Database/Db.js";

const PORT = process.env.PORT || 3000; // use PORT for both HTTP and Socket

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error(`Server error: ${err.message}`);
    });

    server.listen(PORT, () => {
      console.log(`Server & Socket.IO running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Failed to connect to the database: ${error.message}`);
    process.exit(1);
  });
