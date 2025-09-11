import "./Button.css";

type ButtonProps = {
  onClick?: () => void;
  label?: string;
};

export default function Button({ onClick, label }: ButtonProps) {
  return (
    <button className="button" onClick={onClick}>
      {label}
    </button>
  );
}
