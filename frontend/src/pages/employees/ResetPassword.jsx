import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, CheckCircle2, Circle } from "lucide-react"; // Optional icons
import api from "../../hooks/api";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Helper to check standard requirements for the UI
  const requirements = [
    { label: "Minimum 10 characters", valid: password.length >= 10 },
    {
      label: "Uppercase & Lowercase",
      valid: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      label: "Number & Special Character",
      valid: /[0-9]/.test(password) && /[!@#$%^&*]/.test(password),
    },
  ];

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Frontend Validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;
    if (!passwordRegex.test(password)) {
      setError("Password does not meet the security standards below.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/auth/update-password", {
        password,
        passwordConfirm: confirmPassword,
      });

      alert(
        "Security update successful! Please log in with your new password.",
      );

      // Clean up and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      // 2. Standard Backend Error (Handles "Same as Admin" check)
      setError(
        err.response?.data?.message || "An error occurred during update.",
      );
    } finally {
      setLoading(false);
    }
  };
  // Calculate strength (0 to 4)
  const getStrength = () => {
    let s = 0;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[!@#$%^&*]/.test(password)) s++;
    return s;
  };

  const strength = getStrength();
  const colors = [
    "bg-slate-200",
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-500",
  ];
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Security Update</h2>
          <p className="text-sm text-slate-500 mt-2">
            You are using a temporary password. Please set a secure private
            password to proceed.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New Secure Password"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Password Checklist UI */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Requirements:
            </p>
            {requirements.map((req, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm ${req.valid ? "text-green-600" : "text-slate-400"}`}
              >
                {req.valid ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                {req.label}
              </div>
            ))}
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            {loading ? "Updating Security..." : "Set New Password & Logout"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
