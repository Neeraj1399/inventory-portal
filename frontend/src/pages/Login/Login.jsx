import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// Premium Primitives
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { data: resBody } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const userData = resBody.data.user;
      const accessToken = resBody.accessToken;

      if (resBody.mustChangePassword) {
        login(userData, accessToken);
        navigate("/reset-password");
        return;
      }

      login(userData, accessToken);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await api.post("/auth/forgot-password-request", {
        email: resetEmail.trim(),
      });
      setSuccessMessage(res.data.message || "Reset request sent successfully.");
      setResetEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6 relative overflow-hidden">
      {/* Background Ambience */}
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-bg-elevated rounded-2xl mb-8 shadow-inner border border-border transition-all duration-500 hover:scale-105 group cursor-default">
              <ShieldCheck className="text-accent-primary w-10 h-10 group-hover:text-white transition-colors" />
            </div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              Inventory <span className="text-accent-primary">Portal</span>
            </h1>
            <p className="text-text-muted font-black tracking-[0.2em] mt-4 text-[10px] opacity-60">
              {isForgotPassword ? "Secure Access Recovery" : "Enterprise Authentication Gate"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-status-danger/10 border border-status-danger/20 text-status-danger text-[10px] font-black tracking-widest rounded-2xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 bg-status-danger rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-status-success/10 border border-status-success/20 text-status-success text-[10px] font-black tracking-widest rounded-2xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 bg-status-success rounded-full animate-pulse" />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isForgotPassword ? (
              <motion.form 
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleForgotPasswordSubmit} 
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
                    Identity Verification
                  </label>
                  <Input
                    icon={Mail}
                    type="email"
                    required
                    placeholder="name@athiva.com"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (error) setError("");
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full h-14 tracking-widest text-[11px]"
                >
                  Request Reset Link
                </Button>

                <div className="text-center pt-4">
                  <button 
                    type="button"
                    onClick={() => { setIsForgotPassword(false); setError(""); setSuccessMessage(""); }}
                    className="text-text-muted hover:text-white transition-colors text-xs font-black tracking-widest flex items-center justify-center gap-2 mx-auto"
                  >
                    Sign In
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin} 
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1">
                    Work Email
                  </label>
                  <Input
                    icon={Mail}
                    type="email"
                    required
                    placeholder="name@athiva.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black tracking-[0.2em] text-text-disabled">
                      Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] font-black tracking-[0.2em] text-accent-primary hover:text-white transition-colors"
                    >
                      Recovery?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors z-10"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full h-14 tracking-widest text-[11px]"
                  icon={ArrowRight}
                >
                  Enter Dashboard
                </Button>

                <div className="pt-8 text-center">
                  <p className="text-text-disabled text-[9px] font-black tracking-[0.3em] opacity-40">
                    Proprietary Resource Access
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
