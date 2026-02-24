"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Password errata");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleLogin}
        className="border p-10 rounded-lg w-96"
      >
        <h1 className="text-2xl font-bold mb-6">
          Admin Login
        </h1>

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white py-2"
        >
          Entra
        </button>
      </form>
    </div>
  );
}
