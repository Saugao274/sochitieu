"use client";

import { useEffect, useState } from "react";

export default function FormattedInput({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
}: {
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    // Sync external value to display value if needed
    if (value === "") {
      setDisplay("");
    } else {
      const num = String(value).replace(/[^\d.-]/g, "");
      if (num && !isNaN(Number(num))) {
        setDisplay(Number(num).toLocaleString("vi-VN"));
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits and minus sign
    let raw = e.target.value.replace(/[^\d-]/g, "");
    
    // Ensure only one minus sign at the beginning
    if (raw.lastIndexOf("-") > 0) {
      raw = raw.replace(/-/g, "");
      raw = "-" + raw;
    }

    if (raw === "" || raw === "-") {
      setDisplay(raw);
      onChange(raw);
      return;
    }

    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      setDisplay(num.toLocaleString("vi-VN"));
      onChange(num.toString());
    } else {
      setDisplay("");
      onChange("");
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      autoFocus={autoFocus}
    />
  );
}
