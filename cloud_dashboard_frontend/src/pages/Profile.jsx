import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="page">
      <div className="card">
        <div className="card-header"><span>Profile</span></div>
        <div>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
      </div>
    </div>
  );
}
