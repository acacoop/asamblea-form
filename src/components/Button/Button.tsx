import "./Button.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  color?: string;
  variant?: "solid" | "outline";
};

export default function Button({
  label,
  color,
  variant,
  style: styleProp,
  ...rest
}: ButtonProps) {
  const style: React.CSSProperties = { ...(styleProp ?? {}) };
  if (color) {
    if (color.startsWith("--")) {
      style.backgroundColor = `var(${color})`;
    } else if (color.startsWith("var(")) {
      style.backgroundColor = color;
    } else {
      style.backgroundColor = color;
    }
  }
  if (variant === "outline") style.border = "1px solid currentColor";

  return (
    <button className={`button`} style={style} {...rest}>
      {label}
    </button>
  );
}
