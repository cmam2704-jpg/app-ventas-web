
'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ContactoPage() {
  const router = useRouter();
  const { id_vendedor_cliente } = useParams<{ id_vendedor_cliente: string }>();

  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  const [canal, setCanal] = useState('llamada');
  const [resultado, setResultado] = useState('no_contesta');

  const [demanda, setDemanda] = useState<number | null>(null);
  const [tipoCompra, setTipoCompra] = useState<string | null>(null);
  const [tipoProduccion, setTipoProduccion] = useState<string | null>(null);

  const [tienePlano, setTienePlano] = useState(false);
  const [planoCompartido, setPlanoCompartido] = useState(false);

  const [accionRequerida, setAccionRequerida] = useState<string | null>(null);
  const [fechaProx, setFechaProx] = useState<string | null>(null);
  const [nivelInteres, setNivelInteres] = useState<string | null>(null);

  const [obs, setObs] = useState('');

  const submit = async () => {
    if (!id_vendedor_cliente) return;

    setLoading(true);

    const { error } = await supabase.rpc('registrar_contacto', {
      p_id_vendedor_cliente: Number(id_vendedor_cliente),

      p_nombre_contacto: nombre || null,
      p_cargo_contacto: cargo || null,
      p_telefono: telefono || null,
      p_email: email || null,

      p_canal: canal,
      p_resultado: resultado,

      p_demanda_estimada: demanda,
      p_tipo_compra: tipoCompra,
      p_tipo_produccion: tipoProduccion,

      p_tiene_plano: tienePlano,
      p_plano_compartido: planoCompartido,

      p_accion_requerida: accionRequerida,
      p_fecha_proximo_contacto: fechaProx,
      p_nivel_interes: nivelInteres,
      p_observaciones: obs || null
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            Registrar contacto
          </h1>

          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
        </div>

        {/* Datos del contacto */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Datos del contacto
          </h2>

          {input('Nombre del contacto', nombre, setNombre)}
          {input('Cargo', cargo, setCargo)}
          {input('Teléfono', telefono, setTelefono)}
          {input('Email', email, setEmail)}
        </section>

        {/* Gestión */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Gestión del contacto
          </h2>

{select('Canal de contacto', canal, (v) => setCanal(v ?? 'llamada'), [
  ['llamada', 'Llamada'],
  ['whatsapp', 'WhatsApp'],
  ['email', 'Email'],
  ['visita', 'Visita'],
  ['reunion', 'Reunión']
])}

{select('Resultado', resultado, (v) => setResultado(v ?? 'no_contesta'), [
  ['no_contesta', 'No contesta'],
  ['contactado', 'Contactado'],
  ['interesado', 'Interesado'],
  ['reprogramar', 'Reprogramar'],
  ['rechaza', 'Rechaza'],
  ['numero_incorrecto', 'Número incorrecto']
])}

          {number('Demanda estimada mensual', demanda, setDemanda)}

          {select('Tipo de compra', tipoCompra, setTipoCompra, [
            ['', '—'],
            ['spot', 'Spot'],
            ['recurrente', 'Recurrente']
          ])}

          {select('Tipo de producción', tipoProduccion, setTipoProduccion, [
            ['', '—'],
            ['STOCK_PERULOG', 'Stock Perulog'],
            ['PROYECTO_PROPIO', 'Proyecto cliente']
          ])}
        </section>

        {/* Plano */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Plano</h2>

          <div className="flex gap-6">
            {checkbox('Tiene plano', tienePlano, setTienePlano)}
            {checkbox('Plano compartido', planoCompartido, setPlanoCompartido)}
          </div>
        </section>

        {/* Seguimiento */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Seguimiento
          </h2>

          {select('Acción requerida', accionRequerida, setAccionRequerida, [
            ['', '—'],
            ['COTIZAR', 'Cotizar'],
            ['REAGENDAR', 'Reagendar'],
            ['BUSCAR OTRO CONTACTO', 'Buscar otro contacto']
          ])}

          <div>
            <label className="text-sm font-medium text-gray-700 block">
              Fecha próximo contacto
            </label>
            <input
              type="date"
              className={inputClass}
              value={fechaProx ?? ''}
              onChange={e => setFechaProx(e.target.value || null)}
            />
          </div>

          {select('Nivel de interés', nivelInteres, setNivelInteres, [
            ['', '—'],
            ['ALTO', 'Alto'],
            ['MEDIO', 'Medio'],
            ['BAJO', 'Bajo']
          ])}

          <div>
            <label className="text-sm font-medium text-gray-700 block">
              Observaciones
            </label>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={obs}
              onChange={e => setObs(e.target.value)}
            />
          </div>
        </section>

        {/* Acciones */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => router.back()}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Guardando…' : 'Registrar contacto'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers UI ---------- */

const inputClass =
  'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

function input(label: string, value: string, set: (v: string) => void) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block">{label}</label>
      <input className={inputClass} value={value} onChange={e => set(e.target.value)} />
    </div>
  );
}

function number(
  label: string,
  value: number | null,
  set: (v: number | null) => void
) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block">{label}</label>
      <input
        type="number"
        className={inputClass}
        value={value ?? ''}
        onChange={e => set(e.target.value ? Number(e.target.value) : null)}
      />
    </div>
  );
}

function select(
  label: string,
  value: string | null,
  set: (v: string | null) => void,
  options: [string, string][]
) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block">{label}</label>
      <select
        className={inputClass}
        value={value ?? ''}
        onChange={e => set(e.target.value || null)}
      >
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}

function checkbox(
  label: string,
  value: boolean,
  set: (v: boolean) => void
) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        checked={value}
        onChange={e => set(e.target.checked)}
      />
      {label}
    </label>
  );
}
