export const dynamic = 'force-dynamic';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  const recuperarClave = async () => {
    if (!email) {
      setError('Ingresa tu correo electrónico para recuperar la contraseña.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      'Te hemos enviado un correo para que puedas crear una nueva contraseña.'
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/login/bg-warehouse.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <form
        onSubmit={onLogin}
        className="relative w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6"
      >
        {/* Logo */}
        <div className="flex justify-center py-4">
          <img
            src="/branding/logo-perulog.png"
            alt="PeruLog Pallets"
            className="h-20 md:h-24 w-auto"
          />
        </div>

        <h1 className="text-xl font-semibold text-center text-gray-800">
          Acceso al Sistema
        </h1>

        <input
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        {message && (
          <p className="text-green-600 text-sm text-center">{message}</p>
        )}

        <button
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Procesando…' : 'Ingresar'}
        </button>

        {/* RECUPERAR CONTRASEÑA */}
        <button
          type="button"
          onClick={recuperarClave}
          className="w-full text-sm text-indigo-600 hover:underline"
          disabled={loading}
        >
          ¿Olvidaste tu contraseña?
        </button>

        <p className="text-xs text-gray-500 text-center">
          Plataforma interna · PeruLog Pallets<br />
          Propiedad de BPI Consultores
        </p>
      </form>
    </div>
  );
}
