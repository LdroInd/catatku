function ConfirmDialog({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-dialog">
        <h3>{title || "Konfirmasi"}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Batal
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
