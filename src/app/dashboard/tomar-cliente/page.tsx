export const dynamic = 'force-dynamic';

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getVendedorActual } from '@/lib/getVendedorActual';

type Cliente = {
  id: string; // UUID
  ruc: string;
  razon_social: string;
};

export default function TomarClientePage() {
  const router = useRouter();

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [vendedorId, setVendedorId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }

      const { vendedor, error } = await getVendedorActual();
      if (error || !vendedor || !vendedor.id) {
        router.replace('/login');
        return;
      }

      setVendedorId(String(vendedor.id));
    };

    init();
  }, [router]);

  const buscar = async () => {
    if (!q.trim()) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('clientes')
      .select('id, ruc, razon_social')
      .or(`ruc.ilike.%${q}%,razon_social.ilike.%${q}%`)
      .limit(10);

    if (!error && data) {
      setResultados(data);
    }

    setLoading(false);
  };

  const limpiarBusqueda = () => {
    setQ('');
    setResultados([]);
  };

  const tomarCliente = async (cliente: Cliente) => {
    if (!vendedorId) return;

    setLoading(true);

    const { error } = await supabase.rpc('vc_tomar_prospecto', {
      p_id_vendedor: vendedorId,
      p_id_cliente: cliente.id,
      p_origen: 'app'
    });

    setLoading(false);

    if (error) {
      alert(
        error.message ||
        'Este cliente ya se encuentra asignado a otro vendedor.'
      );
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/dashboard/bg-logistica.jpg')" }}
    >
      {/* Overlay */}
      <div className="min-h-screen bg-white/75 backdrop-blur-[2px]">
        <div className="max-w-5xl mx-auto p-8 space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-start">

            {/* IZQUIERDA: TITULO + VOLVER */}
            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
              >
                ← Volver al dashboard
              </button>

              <h1 className="text-2xl font-semibold text-gray-800">
                Tomar cliente
              </h1>

              <p className="text-sm text-gray-600 max-w-3xl">
                Busca en este banner la empresa que quieres asociar como cliente
                de tu cartera poniendo parte o toda la razón social o número de RUC.
              </p>
            </div>

            {/* LOGO */}
            <img
              src="/branding/logo-perulog.png"
              alt="PeruLog Pallets"
              className="h-10 w-auto opacity-90"
            />
          </div>

          {/* CARD BUSCADOR */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">

            <div className="flex gap-3">
              <input
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Ejemplo: TECSUR o 20206018411"
                value={q}
                onChange={e => setQ(e.target.value)}
              />

              <button
                onClick={buscar}
                disabled={loading}
                className="rounded-xl bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                Buscar
              </button>

              <button
                onClick={limpiarBusqueda}
                disabled={loading && !q}
                className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Limpiar
              </button>
            </div>

            {/* RESULTADOS */}
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">RUC</th>
                    <th className="px-4 py-3 text-left">Razón social</th>
                    <th className="px-4 py-3 text-center">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {resultados.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-gray-400"
                      >
                        Sin resultados
                      </td>
                    </tr>
                  )}

                  {resultados.map(c => (
                    <tr
                      key={c.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">{c.ruc}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {c.razon_social}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => tomarCliente(c)}
                          disabled={loading}
                          className="rounded-lg bg-indigo-600 text-white px-4 py-1.5 text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                        >
                          Tomar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
