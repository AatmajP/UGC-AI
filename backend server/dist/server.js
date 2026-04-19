import "dotenv/config";
import express from 'express';
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from "./controllers/clerk.js";
import { upsertUser } from "./controllers/auth.js";
const app = express();
// Middleware
app.use(cors());
app.post("/api/clerk", express.raw({ type: 'application/json' }), clerkWebhooks);
app.use(express.json());
app.use(clerkMiddleware());
// Endpoint: upsert current user (call this from frontend after login)
app.post('/api/auth/upsert', express.json(), upsertUser);
const port = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send('Server is Live!');
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
