import React from 'react';
import Modal from './Modal';

// PUBLIC_INTERFACE
export default function ConfirmDialog({ open, title = 'Confirm', message, onCancel, onConfirm }) {
  /** Confirmation dialog using Modal component. */
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={(
        <>
          <button className="btn ghost" onClick={onCancel} aria-label="Cancel and close">Cancel</button>
          <button className="btn danger" onClick={onConfirm} aria-label="Confirm action">Confirm</button>
        </>
      )}
    >
      <p id="confirm-desc" role="note">{message}</p>
    </Modal>
  );
}
