import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css';

export default function NotFound() {
  return (
    <div className="page center">
      <div className="card">
        <h2>404 - Not Found</h2>
        <p className="muted">The page you are looking for does not exist.</p>
        <Link className="btn primary" to="/">Go Home</Link>
      </div>
    </div>
  );
}
