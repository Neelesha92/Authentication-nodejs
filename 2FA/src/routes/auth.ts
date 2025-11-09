import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { sendEmail } from "../utils/sendEmail";
import { LoginDto, RegisterDto, VerifyOtpDto } from "../types/auth";

const router = express.Router();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post(
  "/register",
  async (req: Request<{}, {}, RegisterDto>, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing)
        return res.status(400).json({ message: "User already exists" });

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashed },
        select: { id: true, email: true, createdAt: true },
      });

      return res.json({ message: "Registered", user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/login", async (req: Request<{}, {}, LoginDto>, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpires },
    });

    await sendEmail(
      email,
      "Your login OTP",
      `Your OTP is ${otp}. It expires in 5 minutes.`
    );

    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/verify-otp",
  async (req: Request<{}, {}, VerifyOtpDto>, res: Response) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp)
        return res.status(400).json({ message: "Email and OTP required" });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.otp)
        return res.status(400).json({ message: "Invalid request" });

      if (!user.otpExpires || new Date() > user.otpExpires) {
        return res.status(400).json({ message: "OTP expired" });
      }

      if (user.otp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });

      await prisma.user.update({
        where: { email },
        data: { otp: null, otpExpires: null },
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "secret",
        {
          expiresIn: "1h",
        }
      );

      return res.json({ message: "Authenticated", token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
