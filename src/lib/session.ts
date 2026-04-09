import "server-only";

import { getIronSession, type IronSession } from "iron-session";
import type { SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN";
};

export type SessionData = {
  user?: SessionUser;
};

const sessionOptions: SessionOptions = {
  cookieName: "tt_session",
  password: process.env.SESSION_PASSWORD ?? "please-change-me",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  // iron-session supports App Router cookies store
  return await getIronSession<SessionData>(await cookies(), sessionOptions);
}

