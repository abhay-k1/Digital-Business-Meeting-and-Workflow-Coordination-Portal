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
    // If user is already logged in, redirect to groups.
    const session = getSession();
    if (session) {
      window.location.href = "/groups";
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
      localStorage.removeItem("active_group_id"); // Ensure fresh group choice
      window.location.href = "/groups";
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
        <div className="w-full max-w-[480px] shadow-[0_10px_35px_rgba(15,23,42,0.03)] rounded-[24px] bg-white border-slate-200 border-solid border-[1px] box-border p-10 flex flex-col gap-8 mq450:px-6 mq450:py-8">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="m-0 text-4xl font-extrabold text-grays-black mq450:text-3xl">
              Get Started
            </h1>
            <p className="m-0 text-base font-['DM_Sans'] text-slate-500">
              Create an account and manage your team efficiently.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-5 py-3 rounded-[10px] border border-solid border-red-200 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abhay Kamble"
                className="w-full bg-[#fff] border-slate-200 border-solid border-[1px] rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-[#999] focus:ring-2 focus:ring-[#475569] transition duration-150"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-[#fff] border-slate-200 border-solid border-[1px] rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-[#999] focus:ring-2 focus:ring-[#475569] transition duration-150"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full bg-[#fff] border-slate-200 border-solid border-[1px] rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-[#999] focus:ring-2 focus:ring-[#475569] transition duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer border-none py-4 px-6 bg-dark hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center text-base font-['Space_Grotesk'] transition duration-200 disabled:opacity-50 mt-4 shadow-sm"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <div className="text-center font-['DM_Sans'] text-sm text-slate-600">
            Already have an account?{" "}
            <a href="/login" className="text-[#475569] font-bold underline hover:text-slate-800">
              Login here
            </a>
          </div>
        </div>
      </main>

      <FrameComponent3 />
    </div>
  );
}
