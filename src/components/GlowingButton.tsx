import { motion } from "framer-motion";

type GlowingButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
};

export const GlowingButton = ({
  children,
  variant = "primary",
  onClick,
  className = "",
  disabled = false,
}: GlowingButtonProps) => {
  const baseClasses =
    "relative px-6 py-3 rounded-xl font-medium transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25",
    secondary:
      "border-2 border-purple-500/50 text-purple-300 hover:border-purple-400 hover:text-purple-200 hover:shadow-lg hover:shadow-purple-500/25",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/25",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative flex items-center gap-2">{children}</span>
    </motion.button>
  );
};
