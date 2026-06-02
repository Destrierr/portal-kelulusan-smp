import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../lib/supabase';

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    getSession().then(s => {
      setAuthed(!!s);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Memuat...</div>
      </div>
    );
  }

  return authed ? children : <Navigate to="/login" replace />;
}
