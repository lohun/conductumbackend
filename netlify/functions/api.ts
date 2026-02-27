import express, { Router } from "express";
import serverless from "serverless-http";
import app from "../../app.ts";

const api = express();

const router = Router();
router.use("/api", app);

api.use("/.netlify/functions/api", router);

export const handler = serverless(api);
