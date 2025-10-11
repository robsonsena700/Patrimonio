
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const viteConfigPath = path.join(__dirname, '..', 'vite.config.js');
  const { default: viteConfig } = await import(viteConfigPath);

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.join(process.cwd(), "dist", "public");
  const indexPath = path.join(distPath, "index.html");

  console.log('Production static file configuration:');
  console.log('- Working directory:', process.cwd());
  console.log('- Dist path:', distPath);
  console.log('- Index path:', indexPath);
  console.log('- Dist exists:', fs.existsSync(distPath));
  console.log('- Index exists:', fs.existsSync(indexPath));

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Build directory not found: ${distPath}. Run 'npm run build' first.`,
    );
  }

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `index.html not found at: ${indexPath}`,
    );
  }

  // Serve static assets with caching (skip index.html here)
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    index: false, // Don't serve index.html automatically
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  // SPA fallback - serve index.html for all non-API routes
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(indexPath, (err) => {
      if (err) {
        next(err);
      }
    });
  });

  log(`Serving static files from ${distPath}`);
}
