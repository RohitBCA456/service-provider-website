import { app, server } from "./app.js";
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

const PORT = process.env.SOCKET_PORT || 2000;

server.listen(PORT, () => {
  console.log(`socket server is running on ${PORT}`);
});
