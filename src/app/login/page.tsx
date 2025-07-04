"use client";
import { useState } from "react";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // COMMENTED OUT: PIN validation
    /*
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      if (data.role === "admin") {
        window.location.href = "/admin";
      } else if (data.role === "helper") {
        window.location.href = "/orders";
      } else {
        setError("Unknown role.");
      }
    } else {
      const err = await res.json();
      setError(err.error || "Login failed.");
    }
    */

    // TEMPORARY: Mock login for development
    // Remove this when re-enabling PIN authentication
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: "mock" }),
      });

      setLoading(false);

      if (res.ok) {
        const data = await res.json();
        if (data.role === "admin") {
          window.location.href = "/admin";
        } else if (data.role === "helper") {
          window.location.href = "/orders";
        } else {
          setError("Unknown role.");
        }
      } else {
        setError("Login failed.");
      }
    } catch (err) {
      setLoading(false);
      setError("Login failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handlePinSubmit} className="bg-white p-8 rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Staff Login (PIN)</h1>
        {/* COMMENTED OUT: PIN input field validation */}
        <input
          className="border rounded p-3 w-full text-lg mb-4"
          type="password"
          placeholder="Enter PIN (any value for demo)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          // maxLength={6}
          // minLength={4}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded w-full text-lg"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && (
          <div className="text-red-600 mt-4 text-center">{error}</div>
        )}
        <div className="text-sm text-gray-500 mt-4 text-center">
          <p>Demo Mode: Enter any PIN to login as admin</p>
          <p className="text-xs mt-2">PIN authentication is currently disabled</p>
        </div>
      </form>
    </div>
  );
}