import { useState } from "react";
import PasswordInput from "./PasswordInput";

function ChangePassword({ user, onClose }) {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok");
      return;
    }

    if (form.newPassword.length < 4) {
      setError("Password baru minimal 4 karakter");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          old_password: form.oldPassword,
          new_password: form.newPassword,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("Password berhasil diubah!");
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>🔑 Ganti Password</h3>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="form-group">
            <label>Password Lama</label>
            <PasswordInput
              value={form.oldPassword}
              onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
              placeholder="Masukkan password lama"
            />
          </div>
          <div className="form-group">
            <label>Password Baru</label>
            <PasswordInput
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Masukkan password baru"
            />
          </div>
          <div className="form-group">
            <label>Konfirmasi Password Baru</label>
            <PasswordInput
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Ulangi password baru"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
