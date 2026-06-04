"use client";

import { useState, useEffect } from "react";
import { saveSession, getSession } from "../lib/auth";
import FrameComponent from "../../components/frame-component";
import FrameComponent3 from "../../components/frame-component3";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard.
    const session = getSession();
    if (session) {
      window.location.href = "/dashboard";
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      saveSession(data.user);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative bg-[#fff] overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left font-['Space_Grotesk']">
      <FrameComponent />

      <main className="self-stretch flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-[500px] shadow-[0px_5px_0px_#0f172a] rounded-[45px] bg-grey border-dark border-solid border-[1px] box-border p-12 flex flex-col gap-8 mq450:px-6 mq450:py-8">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="m-0 text-5xl font-medium text-grays-black mq450:text-3xl">
              Get Started
            </h1>
            <p className="m-0 text-lg font-['DM_Sans'] text-[#555]">
              Create an account and manage your team efficiently.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-5 py-3 rounded-[10px] border border-solid border-red-200 text-base font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-lg font-medium text-grays-black">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abhay Kamble"
                className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-4 px-5 text-lg font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-[#999] focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-lg font-medium text-grays-black">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-4 px-5 text-lg font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-[#999] focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-lg font-medium text-grays-black">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-4 px-5 text-lg font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-[#999] focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer border-none py-5 px-[35px] bg-dark rounded-[14px] flex items-center justify-center text-xl font-['Space_Grotesk'] text-[#fff] font-bold hover:bg-[#2563eb] hover:text-white transition duration-200 disabled:opacity-50 mt-4 shadow-[0px_3px_0px_#0f172a]"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <div className="text-center font-['DM_Sans'] text-base">
            Already have an account?{" "}
            <a href="/login" className="text-grays-black font-bold underline hover:text-[#2563eb]">
              Login here
            </a>
          </div>
        </div>
      </main>

      <FrameComponent3 />
    </div>
  );
}
