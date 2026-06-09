"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("admin@test.com");

  const [password, setPassword] =
    useState("123456");

  async function login() {
    const res = await fetch(
      "/api/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (res.ok) {
      console.log("LOGIN SUCCESS");
      // فعلا برای رفرش شدن منو از این کد استفاده میشه بعدا باید با zustand مدیریت state بشه
      window.location.href = "/admin";
    }
  }

  return (
    <div className="container mx-auto py-10">
      <input
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        placeholder="email"
        className="border p-2 block mb-4"
      />

      <input
        type="password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
        placeholder="password"
        className="border p-2 block mb-4"
      />

      <button
        onClick={login}
        className="border px-4 py-2"
      >
        Login
      </button>
    </div>
  );
}