import { useEffect, useState } from "react";
import "./Input.css";

type Option = { label: string; value: string };

type InputType = "text" | "email" | "number" | "checkbox" | "radio" | "search";

interface InputProps {
  id?: string;
  name?: string;
  label?: string;
  type?: InputType;
  value?: string | number | string[];
  options?: Option[]; // for checkbox, radio, search
  placeholder?: string;
  required?: boolean;
  onChange?: (value: any) => void;
}

export default function Input({
  id,
  name,
  label,
  type = "text",
  value,
  options = [],
  placeholder,
  required = false,
  onChange,
}: InputProps) {
  // Local state when uncontrolled
  const [textValue, setTextValue] = useState<string>((value as string) || "");
  const [numberValue, setNumberValue] = useState<number | "">(
    typeof value === "number" ? (value as number) : ""
  );
  const [checkedValues, setCheckedValues] = useState<string[]>(
    Array.isArray(value) ? (value as string[]) : []
  );
  const [selectedRadio, setSelectedRadio] = useState<string>(
    typeof value === "string" ? (value as string) : ""
  );
  // search dropdown
  const [searchInput, setSearchInput] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    if (typeof value === "string") setTextValue(value as string);
    if (typeof value === "number") setNumberValue(value as number);
    if (Array.isArray(value)) setCheckedValues(value as string[]);
  }, [value]);

  function emitChange(v: any) {
    if (onChange) onChange(v);
  }
  if (type === "checkbox") {
    return (
      <div className="input-container">
        {label && (
          <label className="input-label">
            {label} {required && <span className="input-required">*</span>}
          </label>
        )}
        <div className="input-options">
          {options.map((opt) => (
            <label key={opt.value} className="option-row">
              <input
                type="checkbox"
                name={name}
                checked={checkedValues.includes(opt.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...checkedValues, opt.value]
                    : checkedValues.filter((v) => v !== opt.value);
                  setCheckedValues(next);
                  emitChange(next);
                }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (type === "radio") {
    return (
      <div className="input-container">
        {label && (
          <label className="input-label">
            {label} {required && <span className="input-required">*</span>}
          </label>
        )}
        <div className="input-options">
          {options.map((opt) => (
            <label key={opt.value} className="option-row">
              <input
                type="radio"
                name={name}
                checked={selectedRadio === opt.value}
                onChange={() => {
                  setSelectedRadio(opt.value);
                  emitChange(opt.value);
                }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (type === "search") {
    const filtered = options.filter((o) =>
      o.label.toLowerCase().includes(searchInput.toLowerCase())
    );
    return (
      <div className="input-container search-container">
        {label && (
          <label className="input-label">
            {label} {required && <span className="input-required">*</span>}
          </label>
        )}
        <input
          id={id}
          name={name}
          className="input-field"
          placeholder={placeholder}
          value={searchInput}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          onChange={(e) => {
            setSearchInput(e.target.value);
            emitChange(e.target.value);
          }}
        />
        {showDropdown && filtered.length > 0 && (
          <div className="search-dropdown">
            {filtered.map((opt) => (
              <div
                key={opt.value}
                className="search-dropdown-option"
                onMouseDown={() => {
                  setSearchInput(opt.label);
                  emitChange(opt.value);
                  setShowDropdown(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  // default: text / email / number
  return (
    <div className="input-container">
      {label && (
        <label className="input-label">
          {label} {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        className="input-field"
        type={type === "number" ? "number" : type}
        placeholder={placeholder}
        value={type === "number" ? (numberValue as any) : textValue}
        onChange={(e) => {
          if (type === "number") {
            const v = e.target.value === "" ? "" : Number(e.target.value);
            setNumberValue(v);
            emitChange(v);
          } else {
            setTextValue(e.target.value);
            emitChange(e.target.value);
          }
        }}
      />
    </div>
  );
}
