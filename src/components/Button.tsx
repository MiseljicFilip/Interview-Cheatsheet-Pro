import { type ButtonHTMLAttributes, type ReactNode } from "react"

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  /** Use when the button navigates (wrap in Link yourself and pass asChild). */
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-neutral-800 text-white hover:bg-neutral-700 focus-visible:ring-neutral-500 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
  secondary:
    "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus-visible:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
  danger:
    "border border-red-300 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-400 dark:border-red-800 dark:bg-neutral-800 dark:text-red-300 dark:hover:bg-red-900/20",
  ghost:
    "text-neutral-600 hover:bg-neutral-100 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-700",
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
