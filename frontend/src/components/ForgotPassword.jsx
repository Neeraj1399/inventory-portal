import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";

// Premium Primitives
import Button from "./common/Button";
import Input from "./common/Input";
import Card from "./common/Card";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: false,
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status.loading) return;

    setStatus({ loading: true, error: "", success: false });

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setStatus({ loading: false, error: "", success: true });
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.message || "Could not process identity recovery request.",
        success: false,
      });
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-bg-elevated rounded-2xl mb-8 shadow-inner border border-border group transition-all duration-500 hover:scale-105 cursor-default">
              <ShieldCheck className="text-accent-primary w-10 h-10 group-hover:text-white transition-colors" />
            </div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              Recovery <span className="text-accent-primary">Vector</span>
            </h1>
            <p className="text-text-muted font-black tracking-[0.2em] mt-4 text-[10px] opacity-60">
              Identity Restoration Protocols
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!status.success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-text-secondary text-sm text-center mb-10 leading-relaxed font-medium">
                  Input your authenticated identity (email). We will generate a secure 
                  temporal link to restore your access protocols.
                </p>

                {status.error && (
                  <div className="mb-8 p-4 bg-status-danger/10 border border-status-danger/20 rounded-2xl text-status-danger text-[10px] font-black tracking-widest flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-status-danger rounded-full animate-pulse" />
                    {status.error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1">
                      Identity Descriptor
                    </label>
                    <Input
                      icon={Mail}
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="identity@athiva.com"
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={status.loading}
                    disabled={!email}
                    className="w-full h-14 tracking-widest text-[11px]"
                    icon={Send}
                  >
                    Transmit Recovery Vector
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-6"
              >
                <div className="w-24 h-24 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner border border-status-success/10 group">
                  <CheckCircle2 size={48} className="group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">
                  Transmission Success
                </h2>
                <p className="text-text-secondary mt-6 text-sm leading-relaxed px-4 font-medium">
                  If an identity cluster exists for{" "}
                  <span className="font-bold text-accent-primary underline decoration-accent-primary/20 underline-offset-4">{email}</span>, 
                  you will receive the recovery vector shortly.
                </p>
                <div className="mt-10 p-6 bg-bg-elevated rounded-2xl border border-border shadow-inner">
                  <p className="text-[10px] text-text-muted tracking-[0.2em] font-black flex items-center justify-center gap-3">
                    <span className="w-1.5 h-1.5 bg-status-warning rounded-full animate-pulse" />
                    Check spam repositories
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-border flex justify-center">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-text-muted hover:text-white transition-all group active:scale-95"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Return to Authentication
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
