import { motion } from 'framer-motion';

export const Loader = () => {
  return (
    <div className="relative w-24 h-24">
      <motion.div
        className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 border-4 border-indigo-500 rounded-full border-t-transparent"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-4 border-4 border-purple-500 rounded-full border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};