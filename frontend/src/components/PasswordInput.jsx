import { useState } from "react";

function PasswordInput({ value, onChange, placeholder, id }) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow(!show)}
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
      >
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

export default PasswordInput;
