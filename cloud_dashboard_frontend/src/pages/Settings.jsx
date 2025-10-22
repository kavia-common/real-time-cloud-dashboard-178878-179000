import React, { useState } from 'react';
import Modal from '../components/ui/Modal';
import '../styles/theme.css';

export default function Settings() {
  const [open, setOpen] = useState(false);
  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <span>Settings</span>
          <button className="btn" onClick={() => setOpen(true)}>Open Modal</button>
        </div>
        <div>
          <p className="muted">Project-wide settings will appear here.</p>
        </div>
      </div>
      <Modal open={open} title="Example Modal" onClose={() => setOpen(false)} footer={<button className="btn" onClick={() => setOpen(false)}>Done</button>}>
        <p>This is a placeholder modal. Configure preferences here.</p>
      </Modal>
    </div>
  );
}
