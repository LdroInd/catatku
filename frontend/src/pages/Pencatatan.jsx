import { useState, useEffect, useRef } from "react";
import {
  getPencatatan,
  createPencatatanHeader,
  updatePencatatanHeader,
  deletePencatatanHeader,
  createPencatatanDetail,
  updatePencatatanDetail,
  deletePencatatanDetail,
} from "../api";
import ConfirmDialog from "../components/ConfirmDialog";

const BULAN_LIST = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function Pencatatan({ user }) {
  const [headers, setHeaders] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [details, setDetails] = useState([]);
  const [beginningBalance, setBeginningBalance] = useState(0);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingHeader, setEditingHeader] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null);
  const [headerForm, setHeaderForm] = useState({ bulan: 1, tahun: new Date().getFullYear() });
  const [detailForm, setDetailForm] = useState({ nama: "", jenis: "pemasukan", nominal: "", tanggal: "" });
  const [confirm, setConfirm] = useState({ show: false, action: null, message: "" });
  const printRef = useRef();

  useEffect(() => {
    loadHeaders();
  }, []);

  const loadHeaders = async () => {
    const data = await getPencatatan();
    setHeaders(data.headers || []);
  };

  const loadDetails = async (headerId) => {
    const data = await getPencatatan(headerId);
    setDetails(data.details || []);
    setBeginningBalance(Number(data.beginning_balance) || 0);
  };

  const selectHeader = (header) => {
    setSelectedHeader(header);
    loadDetails(header.id);
  };

  // Header CRUD
  const handleSaveHeader = () => {
    // Frontend validation: cek apakah bulan+tahun sudah ada
    if (!editingHeader) {
      const duplicate = headers.find(
        (h) => h.bulan === headerForm.bulan && h.tahun === headerForm.tahun
      );
      if (duplicate) {
        alert("Pencatatan untuk bulan dan tahun ini sudah ada. Tidak boleh menambah bulan yang sama di tahun yang sama.");
        return;
      }
    }

    const message = editingHeader ? "Apakah anda yakin ingin mengupdate data ini?" : "Apakah anda yakin ingin menambah pencatatan baru?";
    setConfirm({
      show: true,
      message,
      action: async () => {
        if (editingHeader) {
          await updatePencatatanHeader(editingHeader.id, headerForm.bulan, headerForm.tahun);
        } else {
          const result = await createPencatatanHeader(headerForm.bulan, headerForm.tahun);
          if (result.error) {
            alert(result.error);
            return;
          }
        }
        setShowHeaderModal(false);
        setEditingHeader(null);
        setHeaderForm({ bulan: 1, tahun: new Date().getFullYear() });
        loadHeaders();
      },
    });
  };

  const handleEditHeader = (header) => {
    setEditingHeader(header);
    setHeaderForm({ bulan: header.bulan, tahun: header.tahun });
    setShowHeaderModal(true);
  };

  const handleDeleteHeader = (header) => {
    setConfirm({
      show: true,
      message: `Apakah anda yakin ingin menghapus pencatatan bulan ${BULAN_LIST[header.bulan - 1]} ${header.tahun}? Semua detail akan ikut terhapus.`,
      action: async () => {
        await deletePencatatanHeader(header.id);
        if (selectedHeader?.id === header.id) {
          setSelectedHeader(null);
          setDetails([]);
        }
        loadHeaders();
      },
    });
  };

  // Detail CRUD
  const handleSaveDetail = () => {
    // Compose full date from tanggal (day) + header bulan/tahun
    const day = Number(detailForm.tanggal);
    if (!day || day < 1 || day > 31) {
      alert("Tanggal harus diisi antara 1 - 31");
      return;
    }
    const fullDate = `${selectedHeader.tahun}-${String(selectedHeader.bulan).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const message = editingDetail ? "Apakah anda yakin ingin mengupdate detail ini?" : "Apakah anda yakin ingin menambah detail baru?";
    setConfirm({
      show: true,
      message,
      action: async () => {
        if (editingDetail) {
          await updatePencatatanDetail(editingDetail.id, detailForm.nama, detailForm.jenis, Number(detailForm.nominal), fullDate);
        } else {
          await createPencatatanDetail(selectedHeader.id, detailForm.nama, detailForm.jenis, Number(detailForm.nominal), fullDate);
        }
        setShowDetailModal(false);
        setEditingDetail(null);
        setDetailForm({ nama: "", jenis: "pemasukan", nominal: "", tanggal: "" });
        loadDetails(selectedHeader.id);
      },
    });
  };

  const handleEditDetail = (detail) => {
    setEditingDetail(detail);
    // Extract day number from full date (YYYY-MM-DD)
    const dateStr = detail.tanggal?.split("T")[0] || detail.tanggal;
    const day = dateStr ? String(Number(dateStr.split("-")[2])) : "";
    setDetailForm({
      nama: detail.nama,
      jenis: detail.jenis,
      nominal: detail.nominal,
      tanggal: day,
    });
    setShowDetailModal(true);
  };

  const handleDeleteDetail = (detail) => {
    setConfirm({
      show: true,
      message: `Apakah anda yakin ingin menghapus "${detail.nama}"?`,
      action: async () => {
        await deletePencatatanDetail(detail.id);
        loadDetails(selectedHeader.id);
      },
    });
  };

  // Print
  const handlePrint = () => {
    const printContent = printRef.current;
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`
      <html>
        <head>
          <title>Laporan Keuangan - ${BULAN_LIST[selectedHeader.bulan - 1]} ${selectedHeader.tahun}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; font-size: 12px; }
            h1 { text-align: center; font-size: 20px; margin-bottom: 4px; }
            h2 { text-align: center; font-size: 16px; margin-bottom: 16px; }
            p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #333; padding: 8px 10px; text-align: left; }
            th { background: #f0f0f0; font-size: 11px; }
            td { font-size: 12px; }
            .pemasukan { color: green; }
            .pengeluaran { color: red; }
            .summary-table { width: auto; margin-top: 20px; }
            .summary-table td { border: none; padding: 4px 8px; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const totalPemasukan = details.filter((d) => d.jenis === "pemasukan").reduce((sum, d) => sum + Number(d.nominal), 0);
  const totalPengeluaran = details.filter((d) => d.jenis === "pengeluaran").reduce((sum, d) => sum + Number(d.nominal), 0);
  const saldoBulanIni = totalPemasukan - totalPengeluaran;
  const saldoAkhir = beginningBalance + saldoBulanIni;

  const namaEntitas = user.role === "KU Desa" ? user.nama_desa : user.nama_kelompok;

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Pencatatan Keuangan</h1>
        <p className="subtitle">
          {user.role} - {namaEntitas}
        </p>
      </div>

      <div className="pencatatan-layout">
        {/* Header Section */}
        <div className="pencatatan-headers">
          <div className="section-header">
            <h2>Data Bulanan</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingHeader(null); setHeaderForm({ bulan: 1, tahun: new Date().getFullYear() }); setShowHeaderModal(true); }}>
              + Tambah Bulan
            </button>
          </div>
          <div className="list-container">
            {headers.map((h) => (
              <div
                key={h.id}
                className={`list-item ${selectedHeader?.id === h.id ? "active" : ""}`}
                onClick={() => selectHeader(h)}
              >
                <span className="list-item-name">
                  {BULAN_LIST[h.bulan - 1]} {h.tahun}
                  <br />
                  <small>{h.nama_entitas}</small>
                </span>
                <div className="list-item-actions">
                  <button className="btn btn-xs btn-warning" onClick={(e) => { e.stopPropagation(); handleEditHeader(h); }}>Edit</button>
                  <button className="btn btn-xs btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteHeader(h); }}>Hapus</button>
                </div>
              </div>
            ))}
            {headers.length === 0 && <p className="empty-text">Belum ada data pencatatan</p>}
          </div>
        </div>

        {/* Detail Section */}
        <div className="pencatatan-details">
          {selectedHeader ? (
            <>
              <div className="section-header">
                <h2>{BULAN_LIST[selectedHeader.bulan - 1]} {selectedHeader.tahun}</h2>
                <div>
                  <button className="btn btn-sm btn-info" onClick={handlePrint}>🖨️ Print</button>
                  <button className="btn btn-primary btn-sm" onClick={() => { setEditingDetail(null); setDetailForm({ nama: "", jenis: "pemasukan", nominal: "", tanggal: "" }); setShowDetailModal(true); }}>
                    + Tambah Detail
                  </button>
                </div>
              </div>

              <div className="summary-cards">
                <div className="summary-card beginning">
                  <span>Saldo Awal (Bulan Sebelumnya)</span>
                  <strong>Rp {beginningBalance.toLocaleString("id-ID")}</strong>
                </div>
                <div className="summary-card pemasukan">
                  <span>Pemasukan Bulan Ini</span>
                  <strong>Rp {totalPemasukan.toLocaleString("id-ID")}</strong>
                </div>
                <div className="summary-card pengeluaran">
                  <span>Pengeluaran Bulan Ini</span>
                  <strong>Rp {totalPengeluaran.toLocaleString("id-ID")}</strong>
                </div>
                <div className="summary-card saldo">
                  <span>Saldo Akhir</span>
                  <strong>Rp {saldoAkhir.toLocaleString("id-ID")}</strong>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tgl</th>
                      <th>Nama</th>
                      <th>Jenis</th>
                      <th>Nominal</th>
                      <th>Last Balance</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let runningBalance = beginningBalance;
                      return details.map((d, idx) => {
                        const nominal = Number(d.nominal);
                        if (d.jenis === "pemasukan") {
                          runningBalance += nominal;
                        } else {
                          runningBalance -= nominal;
                        }
                        return (
                          <tr key={d.id}>
                            <td>{idx + 1}</td>
                            <td>{(() => { const dt = d.tanggal?.split("T")[0] || d.tanggal; return dt ? Number(dt.split("-")[2]) : "-"; })()}</td>
                            <td>{d.nama}</td>
                            <td>
                              <span className={`badge ${d.jenis === "pemasukan" ? "badge-green" : "badge-red"}`}>
                                {d.jenis}
                              </span>
                            </td>
                            <td>Rp {nominal.toLocaleString("id-ID")}</td>
                            <td><strong>Rp {runningBalance.toLocaleString("id-ID")}</strong></td>
                            <td>
                              <button className="btn btn-xs btn-warning" onClick={() => handleEditDetail(d)}>Edit</button>
                              <button className="btn btn-xs btn-danger" onClick={() => handleDeleteDetail(d)}>Hapus</button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                    {details.length === 0 && (
                      <tr><td colSpan="7" className="empty-text">Belum ada detail pencatatan</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Print Content (hidden) */}
              <div style={{ display: "none" }}>
                <div ref={printRef}>
                  <h1>Laporan Keuangan</h1>
                  <h2>{BULAN_LIST[selectedHeader.bulan - 1]} {selectedHeader.tahun}</h2>
                  <p><strong>{user.role}:</strong> {namaEntitas}</p>
                  <p style={{ marginTop: "8px" }}><strong>Saldo Awal:</strong> Rp {beginningBalance.toLocaleString("id-ID")}</p>
                  <table>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Nama</th>
                        <th>Jenis</th>
                        <th>Nominal</th>
                        <th>Last Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let runningBalance = beginningBalance;
                        return details.map((d, idx) => {
                          const nominal = Number(d.nominal);
                          if (d.jenis === "pemasukan") {
                            runningBalance += nominal;
                          } else {
                            runningBalance -= nominal;
                          }
                          const day = (() => { const dt = d.tanggal?.split("T")[0] || d.tanggal; return dt ? Number(dt.split("-")[2]) : 1; })();
                          const fullDate = `${day} ${BULAN_LIST[selectedHeader.bulan - 1]} ${selectedHeader.tahun}`;
                          return (
                            <tr key={d.id}>
                              <td>{idx + 1}</td>
                              <td>{fullDate}</td>
                              <td>{d.nama}</td>
                              <td className={d.jenis}>{d.jenis}</td>
                              <td>Rp {nominal.toLocaleString("id-ID")}</td>
                              <td><strong>Rp {runningBalance.toLocaleString("id-ID")}</strong></td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                  <br />
                  <table style={{ width: "auto" }}>
                    <tbody>
                      <tr><td><strong>Saldo Awal (Bulan Sebelumnya)</strong></td><td>: Rp {beginningBalance.toLocaleString("id-ID")}</td></tr>
                      <tr><td className="pemasukan"><strong>Total Pemasukan</strong></td><td className="pemasukan">: Rp {totalPemasukan.toLocaleString("id-ID")}</td></tr>
                      <tr><td className="pengeluaran"><strong>Total Pengeluaran</strong></td><td className="pengeluaran">: Rp {totalPengeluaran.toLocaleString("id-ID")}</td></tr>
                      <tr><td><strong>Saldo Akhir</strong></td><td>: <strong>Rp {saldoAkhir.toLocaleString("id-ID")}</strong></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>📋 Pilih data bulanan untuk melihat detail pencatatan</p>
            </div>
          )}
        </div>
      </div>

      {/* Header Modal */}
      {showHeaderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingHeader ? "Edit Pencatatan Bulanan" : "Tambah Pencatatan Bulanan"}</h3>
            <div className="form-group">
              <label>Bulan</label>
              <select value={headerForm.bulan} onChange={(e) => setHeaderForm({ ...headerForm, bulan: Number(e.target.value) })}>
                {BULAN_LIST.map((b, i) => (
                  <option key={i} value={i + 1}>{b}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tahun</label>
              <input type="number" value={headerForm.tahun} onChange={(e) => setHeaderForm({ ...headerForm, tahun: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>{user.role === "KU Desa" ? "Desa" : "Kelompok"}</label>
              <input value={namaEntitas} disabled />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowHeaderModal(false); setEditingHeader(null); }}>Batal</button>
              <button className="btn btn-primary" onClick={handleSaveHeader}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingDetail ? "Edit Detail" : "Tambah Detail"}</h3>
            <div className="form-group">
              <label>Nama Pengeluaran / Pemasukan</label>
              <input value={detailForm.nama} onChange={(e) => setDetailForm({ ...detailForm, nama: e.target.value })} placeholder="Contoh: Iuran bulanan, Pembelian ATK" />
            </div>
            <div className="form-group">
              <label>Jenis</label>
              <select value={detailForm.jenis} onChange={(e) => setDetailForm({ ...detailForm, jenis: e.target.value })}>
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nominal (Rp)</label>
              <input type="number" value={detailForm.nominal} onChange={(e) => setDetailForm({ ...detailForm, nominal: e.target.value })} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Tanggal (1-31) — {BULAN_LIST[selectedHeader.bulan - 1]} {selectedHeader.tahun}</label>
              <input type="number" min="1" max="31" value={detailForm.tanggal} onChange={(e) => setDetailForm({ ...detailForm, tanggal: e.target.value })} placeholder="Contoh: 5" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowDetailModal(false); setEditingDetail(null); }}>Batal</button>
              <button className="btn btn-primary" onClick={handleSaveDetail}>Simpan</button>
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

export default Pencatatan;
