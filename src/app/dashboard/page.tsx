'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getVendedorActual } from '@/lib/getVendedorActual';
import { getMiCartera } from '@/lib/getMiCartera';

type ItemCartera = {
  id_vendedor_cliente: number;
  cliente_ruc: string;
  cliente_razon_social: string;
  estado: string;
  fecha_estado: string;
  fecha_max_prospecto: string | null;
  dias_para_contactar: number | null;
  total_contactos: number;
};

type KPI = {
  total_clientes: number;
  prospectos_contactados: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [vendedor, setVendedor] = useState<any>(null);
  const [cartera, setCartera] = useState<ItemCartera[]>([]);
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [showKpi, setShowKpi] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }

      // 👉 Trae vendedor DESDE tabla vendedores
      const { vendedor: vendedorData, error } = await getVendedorActual();
      if (error || !vendedorData) {
        router.replace('/login');
        return;
      }

      setVendedor(vendedorData);

      const { cartera } = await getMiCartera(vendedorData.id);
      setCartera(cartera);

      const { data: kpiData } = await supabase.rpc('kpi_vendedor', {
        p_id_vendedor: vendedorData.id
      });

      if (kpiData && kpiData.length > 0) {
        setKpi(kpiData[0]);
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-500">
        Cargando cartera…
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/dashboard/bg-logistica.jpg')" }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto p-8 space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-start">

            {/* TITULO */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Mi cartera
              </h1>

              {/* EMAIL */}
              <p className="text-sm text-gray-600">
                {vendedor.email}
              </p>

              {/* NOMBRE DEL VENDEDOR (LABEL) */}
              <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-white border shadow-sm">
                <p className="text-sm font-semibold text-gray-800">
                  {vendedor.nombres} {vendedor.apellido_paterno} {vendedor.apellido_materno}
                </p>
              </div>
            </div>

            {/* LOGO */}
            <img
              src="/branding/logo-perulog.png"
              alt="PeruLog Pallets"
              className="h-10 w-auto opacity-90"
            />
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowKpi(true)}
              className="rounded-xl bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-700 transition"
            >
              KPIs
            </button>

            <button
              onClick={() => router.push('/dashboard/tomar-cliente')}
              className="rounded-xl bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Tomar cliente
            </button>

            <button
              onClick={cerrarSesion}
              className="rounded-xl bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Cerrar sesión
            </button>
          </div>

          {/* TABLA */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">RUC</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-center">Contactos</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha alta</th>
                  <th className="px-4 py-3 text-left">Fecha límite</th>
                  <th className="px-4 py-3 text-center">Días</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>

              <tbody>
                {cartera.map(item => (
                  <tr
                    key={item.id_vendedor_cliente}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{item.cliente_ruc}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.cliente_razon_social}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        {item.total_contactos}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.fecha_estado).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.fecha_max_prospecto
                        ? new Date(item.fecha_max_prospecto).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {item.dias_para_contactar ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          router.push(`/contacto/${item.id_vendedor_cliente}`)
                        }
                        className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        Contactar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODAL KPI */}
          {showKpi && kpi && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  KPIs del vendedor
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gray-100 p-4">
                    <p className="text-sm text-gray-500">Total clientes</p>
                    <p className="text-2xl font-bold">{kpi.total_clientes}</p>
                  </div>

                  <div className="rounded-xl bg-green-100 p-4">
                    <p className="text-sm text-gray-500">Contactados</p>
                    <p className="text-2xl font-bold text-green-700">
                      {kpi.prospectos_contactados}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowKpi(false)}
                  className="w-full rounded-xl border py-2 text-sm hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
