import { useState, useEffect } from "react";
import { getDesa, createDesa, updateDesa, deleteDesa, getKelompok, createKelompok, updateKelompok, deleteKelompok } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";

function MasterDesa() {
  const [desaList, setDesaList] = useState([]);
  const [selectedDesa, setSelectedDesa] = useState(null);
  const [kelompokList, setKelompokList] = useState([]);
  const [showDesaModal, setShowDesaModal] = useState(false);
  const [showKelompokModal, setShowKelompokModal] = useState(false);
  const [editingDesa, setEditingDesa] = useState(null);
  const [editingKelompok, setEditingKelompok] = useState(null);
  const [desaForm, setDesaForm] = useState("");
  const [kelompokForm, setKelompokForm] = useState("");
  const [confirm, setConfirm] = useState({ show: false, action: null, message: "" });

  useEffect(() => {
    loadDesa();
  }, []);

  useEffect(() => {
    if (selectedDesa) {
      loadKelompok(selectedDesa.id);
    }
  }, [selectedDesa]);

  const loadDesa = async () => {
    const data = await getDesa();
    setDesaList(Array.isArray(data) ? data : []);
  };

  const loadKelompok = async (desaId) => {
    const data = await getKelompok(desaId);
    setKelompokList(Array.isArray(data) ? data : []);
  };

  // Desa CRUD
  const handleSaveDesa = () => {
    const message = editingDesa ? "Apakah anda yakin ingin mengupdate desa ini?" : "Apakah anda yakin ingin menambah desa baru?";
    setConfirm({
      show: true,
      message,
      action: async () => {
        if (editingDesa) {
          await updateDesa(editingDesa.id, desaForm);
        } else {
          await createDesa(desaForm);
        }
        setDesaForm("");
        setEditingDesa(null);
        setShowDesaModal(false);
        loadDesa();
      },
    });
  };

  const handleEditDesa = (desa) => {
    setEditingDesa(desa);
    setDesaForm(desa.nama_desa);
    setShowDesaModal(true);
  };

  const handleDeleteDesa = (desa) => {
    setConfirm({
      show: true,
      message: `Apakah anda yakin ingin menghapus desa "${desa.nama_desa}"? Semua kelompok di bawahnya juga akan terhapus.`,
      action: async () => {
        await deleteDesa(desa.id);
        if (selectedDesa?.id === desa.id) {
          setSelectedDesa(null);
          setKelompokList([]);
        }
        loadDesa();
      },
    });
  };

  // Kelompok CRUD
  const handleSaveKelompok = () => {
    const message = editingKelompok ? "Apakah anda yakin ingin mengupdate kelompok ini?" : "Apakah anda yakin ingin menambah kelompok baru?";
    setConfirm({
      show: true,
      message,
      action: async () => {
        if (editingKelompok) {
          await updateKelompok(editingKelompok.id, kelompokForm, selectedDesa.id);
        } else {
          await createKelompok(kelompokForm, selectedDesa.id);
        }
        setKelompokForm("");
        setEditingKelompok(null);
        setShowKelompokModal(false);
        loadKelompok(selectedDesa.id);
      },
    });
  };

  const handleEditKelompok = (kelompok) => {
    setEditingKelompok(kelompok);
    setKelompokForm(kelompok.nama_kelompok);
    setShowKelompokModal(true);
  };

  const handleDeleteKelompok = (kelompok) => {
    setConfirm({
      show: true,
      message: `Apakah anda yakin ingin menghapus kelompok "${kelompok.nama_kelompok}"?`,
      action: async () => {
        await deleteKelompok(kelompok.id);
        loadKelompok(selectedDesa.id);
      },
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏘️ Master Desa & Kelompok</h1>
      </div>

      <div className="master-layout">
        {/* Desa Section (Header) */}
        <div className="master-section">
          <div className="section-header">
            <h2>Desa</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingDesa(null); setDesaForm(""); setShowDesaModal(true); }}>
              + Tambah Desa
            </button>
          </div>
          <div className="list-container">
            {desaList.map((desa) => (
              <div
                key={desa.id}
                className={`list-item ${selectedDesa?.id === desa.id ? "active" : ""}`}
                onClick={() => setSelectedDesa(desa)}
              >
                <span className="list-item-name">{desa.nama_desa}</span>
                <div className="list-item-actions">
                  <button className="btn btn-xs btn-warning" onClick={(e) => { e.stopPropagation(); handleEditDesa(desa); }}>Edit</button>
                  <button className="btn btn-xs btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteDesa(desa); }}>Hapus</button>
                </div>
              </div>
            ))}
            {desaList.length === 0 && <p className="empty-text">Belum ada data desa</p>}
          </div>
        </div>

        {/* Kelompok Section (Detail) */}
        <div className="master-section">
          <div className="section-header">
            <h2>Kelompok {selectedDesa ? `- ${selectedDesa.nama_desa}` : ""}</h2>
            {selectedDesa && (
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingKelompok(null); setKelompokForm(""); setShowKelompokModal(true); }}>
                + Tambah Kelompok
              </button>
            )}
          </div>
          <div className="list-container">
            {!selectedDesa && <p className="empty-text">Pilih desa terlebih dahulu</p>}
            {selectedDesa && kelompokList.map((kel) => (
              <div key={kel.id} className="list-item">
                <span className="list-item-name">{kel.nama_kelompok}</span>
                <div className="list-item-actions">
                  <button className="btn btn-xs btn-warning" onClick={() => handleEditKelompok(kel)}>Edit</button>
                  <button className="btn btn-xs btn-danger" onClick={() => handleDeleteKelompok(kel)}>Hapus</button>
                </div>
              </div>
            ))}
            {selectedDesa && kelompokList.length === 0 && <p className="empty-text">Belum ada kelompok di desa ini</p>}
          </div>
        </div>
      </div>

      {/* Desa Modal */}
      {showDesaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingDesa ? "Edit Desa" : "Tambah Desa"}</h3>
            <div className="form-group">
              <label>Nama Desa</label>
              <input value={desaForm} onChange={(e) => setDesaForm(e.target.value)} placeholder="Nama Desa" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowDesaModal(false); setEditingDesa(null); setDesaForm(""); }}>Batal</button>
              <button className="btn btn-primary" onClick={handleSaveDesa}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Kelompok Modal */}
      {showKelompokModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingKelompok ? "Edit Kelompok" : "Tambah Kelompok"}</h3>
            <div className="form-group">
              <label>Nama Kelompok</label>
              <input value={kelompokForm} onChange={(e) => setKelompokForm(e.target.value)} placeholder="Nama Kelompok" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowKelompokModal(false); setEditingKelompok(null); setKelompokForm(""); }}>Batal</button>
              <button className="btn btn-primary" onClick={handleSaveKelompok}>Simpan</button>
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

export default MasterDesa;
