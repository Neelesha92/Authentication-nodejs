import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import { authenticate } from "./middleware/authenticate";
import prisma from "./prismaClient";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/auth", authRouter);

app.get("/protected", authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ message: `Welcome ${user.email}`, user });
});

// graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received: closing prisma client");
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
