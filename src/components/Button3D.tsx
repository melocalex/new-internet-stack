import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "volt" | "gold" | "dark";
type Size = "sm" | "md" | "lg";

interface Button3DProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const SIZE_CLASS: Record<Size, string> = {
  sm: "keycap--sm",
  md: "",
  lg: "keycap--lg",
};

/** Realistic 3D "keycap" button — presses down on click. */
const Button3D = ({
  variant = "volt",
  size = "md",
  className = "",
  children,
  ...rest
}: Button3DProps) => {
  const classes = [
    "keycap",
    `keycap--${variant}`,
    SIZE_CLASS[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={classes} {...rest}>
      {children}
    </a>
  );
};

export default Button3D;
