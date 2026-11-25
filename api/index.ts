import type { Request, Response } from "express";
import { createApiApp } from "../server/app.ts";

const app = createApiApp();

export default function handler(req: Request, res: Response): void {
  const urlObj = new URL(req.url || "/", "http://localhost");
  const rewrittenPath = urlObj.searchParams.get("__path");
  if (rewrittenPath) {
    urlObj.searchParams.delete("__path");
    const qs = urlObj.searchParams.toString();
    req.url = (rewrittenPath.startsWith("/") ? rewrittenPath : `/${rewrittenPath}`) + (qs ? `?${qs}` : "");
  }
  app(req, res);
}
