import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // On essaie plusieurs chemins pour être sûr de trouver le build
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(import.meta.dirname, "public"),
    path.resolve(import.meta.dirname, "..", "dist", "public"),
  ];

  let distPath = possiblePaths[0];
  console.log("[static] Checking for build directory...");
  for (const p of possiblePaths) {
    const checkPath = path.resolve(p, "index.html");
    const exists = fs.existsSync(checkPath);
    console.log(`[static] Checking: ${checkPath} -> ${exists ? "FOUND" : "NOT FOUND"}`);
    if (exists) {
      distPath = p;
      break;
    }
  }

  console.log(`[static] Final distPath selected: ${distPath}`);

  if (!fs.existsSync(distPath) || !fs.existsSync(path.resolve(distPath, "index.html"))) {
    console.error(`[static] FATAL: No valid build directory found with index.html!`);
  }

  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));

  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send(`Application non compilée. Veuillez cliquer sur 'Déployer' dans Hostinger. (Path: ${distPath})`);
    }
  });
}
