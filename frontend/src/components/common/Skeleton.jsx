import React from "react";
import { motion } from "framer-motion";

const Skeleton = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`animate-pulse bg-bg-tertiary rounded-2xl border border-border shadow-sm ${className}`}
    />
  );
};

export default Skeleton;
