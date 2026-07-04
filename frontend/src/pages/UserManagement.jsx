import { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser, getDesa, getKelompok } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";
import PasswordInput from "../components/PasswordInput";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [desaList, setDesaList] = useState([]);
  const [kelompokList, setKelompokList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirm, setConfirm] = useState({ show: false, action: null, message: "" });
  const [form, setForm] = useState({
    username: "",
    nama: "",
    desa_id: "",
    kelompok_id: "",
    password: "",
    no_telp: "",
    role: "KU Desa",
  });

  useEffect(() => {
    loadUsers();
    loadDesa();
  }, []);

  useEffect(() => {
    if (form.desa_id) {
      loadKelompok(form.desa_id);
    } else {
      setKelompokList([]);
    }
  }, [form.desa_id]);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(Array.isArray(data) ? data : []);
  };

  const loadDesa = async () => {
    const data = await getDesa();
    setDesaList(Array.isArray(data) ? data : []);
  };

  const loadKelompok = async (desaId) => {
    const data = await getKelompok(desaId);
    setKelompokList(Array.isArray(data) ? data : []);
  };

  const resetForm = () => {
    setForm({ username: "", nama: "", desa_id: "", kelompok_id: "", password: "", no_telp: "", role: "KU Desa" });
    setEditingUser(null);
    setShowModal(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      nama: user.nama,
      desa_id: user.desa_id || "",
      kelompok_id: user.kelompok_id || "",
      password: "",
      no_telp: user.no_telp || "",
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const message = editingUser ? "Apakah anda yakin ingin mengupdate user ini?" : "Apakah anda yakin ingin menambah user baru?";
    setConfirm({
      show: true,
      message,
      action: async () => {
        if (editingUser) {
          await updateUser({ id: editingUser.id, ...form });
        } else {
          await createUser(form);
        }
        resetForm();
        loadUsers();
      },
    });
  };

  const handleDelete = (user) => {
    setConfirm({
      show: true,
      message: `Apakah anda yakin ingin menghapus user "${user.nama}"?`,
      action: async () => {
        await deleteUser(user.id);
        loadUsers();
      },
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Tambah User
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Username</th>
              <th>Nama</th>
              <th>Desa</th>
              <th>Kelompok</th>
              <th>No Telp</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id}>
                <td>{idx + 1}</td>
                <td>{u.username}</td>
                <td>{u.nama}</td>
                <td>{u.nama_desa || "-"}</td>
                <td>{u.nama_kelompok || "-"}</td>
                <td>{u.no_telp || "-"}</td>
                <td><span className={`badge ${u.role === "KU Desa" ? "badge-blue" : "badge-green"}`}>{u.role}</span></td>
                <td>
                  <button className="btn btn-sm btn-warning" onClick={() => handleEdit(u)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingUser ? "Edit User" : "Tambah User"}</h3>
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" />
            </div>
            <div className="form-group">
              <label>Nama</label>
              <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama Lengkap" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, kelompok_id: "" })}>
                <option value="KUadmin">KUadmin</option>
                <option value="KU Desa">KU Desa</option>
                <option value="KU Kelompok">KU Kelompok</option>
              </select>
            </div>
            <div className="form-group">
              <label>Desa</label>
              <select value={form.desa_id} onChange={(e) => setForm({ ...form, desa_id: e.target.value, kelompok_id: "" })}>
                <option value="">-- Pilih Desa --</option>
                {desaList.map((d) => (
                  <option key={d.id} value={d.id}>{d.nama_desa}</option>
                ))}
              </select>
            </div>
            {form.role === "KU Kelompok" && (
              <div className="form-group">
                <label>Kelompok</label>
                <select value={form.kelompok_id} onChange={(e) => setForm({ ...form, kelompok_id: e.target.value })}>
                  <option value="">-- Pilih Kelompok --</option>
                  {kelompokList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama_kelompok}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Password {editingUser && "(kosongkan jika tidak diubah)"}</label>
              <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
            </div>
            <div className="form-group">
              <label>No Telp</label>
              <input value={form.no_telp} onChange={(e) => setForm({ ...form, no_telp: e.target.value })} placeholder="No Telepon" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={resetForm}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={confirm.show}
        message={confirm.message}
        onConfirm={() => { confirm.action(); setConfirm({ show: false, action: null, message: "" }); }}
        onCancel={() => setConfirm({ show: false, action: null, message: "" })}
      />
    </div>
  );
}

export default UserManagement;
