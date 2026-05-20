"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await 
    }
  }

  return (
    <form className="w-100 border" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center p-5">
        <p className="text-xl mb-5">Login</p>
        <div className="w-full flex flex-col gap-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="outline-0 p-2 border rounded-xl w-full"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="outline-0 p-2 border rounded-xl w-full"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white p-2 rounded-xl mt-5 w-full cursor-pointer"
        >
          Login
        </button>
        <p>Don't have an account? <Link href="/register" className="font-black">Register</Link></p>
      </div>
    </form>
  );
}
