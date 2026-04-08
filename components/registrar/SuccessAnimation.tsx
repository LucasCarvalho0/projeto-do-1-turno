"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function SuccessAnimation() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)]"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Check className="w-16 h-16 text-white stroke-[4]" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
