import "./configs/instrument.mjs";
import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerk.js";
import { upsertUser } from "./controllers/auth.js";
import * as Sentry from "@sentry/node";
import { use } from "react";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
 
const app = express();

// Middleware
app.use(cors())
app.post("/api/clerk", express.raw({ type: 'application/json' }), clerkWebhooks);
app.use(express.json());
app.use(clerkMiddleware());

// Endpoint: upsert current user (call this from frontend after login)
app.post('/api/auth/upsert', express.json(), upsertUser);

const port = process.env.PORT || 5000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});