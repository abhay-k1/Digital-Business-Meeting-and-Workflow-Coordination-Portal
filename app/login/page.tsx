"use client";

import { useState, useEffect } from "react";
import { saveSession, getSession } from "../lib/auth";
import FrameComponent from "../../components/frame-component";
import FrameComponent3 from "../../components/frame-component3";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/groups");

  useEffect(() => {
    // Retrieve potential redirection path from search query
    let targetRedirect = "/groups";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const red = params.get("redirect");
      if (red) {
        if (red.startsWith("/groups")) {
          targetRedirect = red;
        } else {
          targetRedirect = `/groups?redirect=${encodeURIComponent(red)}`;
        }
      }
    }
    setRedirectUrl(targetRedirect);

    // If user is already logged in, redirect to target.
    const session = getSession();
    if (session) {
      window.location.href = targetRedirect;
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      saveSession(data.user);
      localStorage.removeItem("active_group_id"); // Ensure fresh group choice
      window.location.href = redirectUrl;
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
            <h1 className="m-0 text-4xl font-extrabold text-grays-black mq450:text-3xl font-['Space_Grotesk']">
              Welcome Back
            </h1>
            <p className="m-0 text-base font-['DM_Sans'] text-slate-500">
              Login to access your meetings and tasks.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-5 py-3 rounded-[10px] border border-solid border-red-200 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
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
                className="w-full bg-[#fff] border-slate-250 border-solid border-[1px] rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-slate-400 focus:border-[#097C87] transition duration-150"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-[#fff] border-slate-250 border-solid border-[1px] rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-slate-400 focus:border-[#097C87] transition duration-150"
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
                placeholder="Enter password"
                className="w-full bg-[#fff] border-slate-250 border-solid border-[1px] rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-slate-400 focus:border-[#097C87] transition duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer border-none py-4 px-6 bg-[#097C87] hover:bg-[#23CED9] text-white font-bold rounded-xl flex items-center justify-center text-base font-['Space_Grotesk'] transition duration-200 disabled:opacity-50 mt-4 shadow-sm"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center font-['DM_Sans'] text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-[#097C87] font-bold underline hover:text-[#23CED9]">
              Register here
            </a>
          </div>
        </div>
      </main>

      <FrameComponent3 />
    </div>
  );
}
