import { SignJWT, jwtVerify } from "jose";

type TokenPayload = {
  userId: string;
  role: string;
};

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function createToken(payload: {
  userId: string;
  role: string;
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<TokenPayload> {
  const { payload } = await jwtVerify(
    token,
    secret
  );

  return payload as TokenPayload;
}