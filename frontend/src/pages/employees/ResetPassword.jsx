import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Circle, Lock, ShieldCheck, ArrowRight } from "lucide-react"; 
import { motion } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

// Premium Primitives
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();
  const { addToast } = useToast();
  const { login } = useAuth();

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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;
    if (!passwordRegex.test(password)) {
      addToast("Password does not meet the security standards.", "error");
      return;
    }
    if (password !== confirmPassword) {
      addToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      if (token) {
        await api.patch(`/admin/reset-password/${token}`, { password });
        addToast("Security update successful! Please log in.", "success");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        const res = await api.patch("/auth/update-password", {
          password,
          passwordConfirm: confirmPassword,
        });
        addToast("Security profile calibrated successfully.", "success");
        login(res.data.data.user, res.data.accessToken);
        navigate("/");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "An error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-secondary/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <motion.div 
        initial={{ scale: 0.98, opacity: 0, y: 0 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-10 backdrop-blur-2xl border-border shadow-2xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-bg-elevated rounded-2xl mb-8 shadow-inner border border-border group transition-all duration-500 hover:scale-105 cursor-default">
              <Lock className="text-accent-primary w-10 h-10 group-hover:text-white transition-colors" />
            </div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              {token ? "Reset" : "Security"} <span className="text-accent-primary">Policy</span>
            </h1>
            <p className="text-text-muted font-black uppercase tracking-[0.2em] mt-4 text-[10px] opacity-60">
              {token ? "Access Calibration Procedure" : "Mandatory Credential Update"}
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1">
                New Secure Passcode
              </label>
              <Input
                icon={Lock}
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1">
                Confirm Calibration
              </label>
              <Input
                icon={ShieldCheck}
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="bg-bg-elevated p-6 rounded-2xl border border-border shadow-inner space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled opacity-60">
                Security Requirements
              </p>
              <div className="space-y-3">
                {requirements.map((req, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 text-xs font-black tracking-tight transition-colors ${req.valid ? "text-status-success" : "text-text-disabled"}`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${req.valid ? "bg-status-success/10 border-status-success/20" : "bg-bg-secondary border-border"}`}>
                      {req.valid ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Circle size={10} className="opacity-20" />
                      )}
                    </div>
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-14 uppercase tracking-widest text-[11px]"
              icon={ArrowRight}
            >
              Update Credentials
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
