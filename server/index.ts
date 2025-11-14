
import 'dotenv/config';
import { setupVite, serveStatic, log } from "./vite.js";
import { createApp } from "./app.js";

(async () => {
  const { app, server } = await createApp();

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server listening on port ${port} in ${process.env.NODE_ENV} mode`);
  });
})();
