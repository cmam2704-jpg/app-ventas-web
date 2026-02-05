import { supabase } from './supabaseClient';

export async function getMiCartera(idVendedor: string) {
  const { data, error } = await supabase
    .from('vendedor_cliente')
    .select(`
      id_vendedor_cliente,
      cliente_ruc,
      cliente_razon_social,
      estado,
      fecha_estado,
      fecha_max_prospecto,
      contactos_cliente ( id_contacto )
    `)
    .eq('id_vendedor', idVendedor)
    .is('fecha_fin', null)
    .eq('bloqueado', false)
    .order('fecha_estado', { ascending: false });

  if (error) {
    return { cartera: [], error };
  }

  const hoy = new Date().getTime();

  const cartera = (data ?? []).map((c: any) => ({
    id_vendedor_cliente: c.id_vendedor_cliente,
    cliente_ruc: c.cliente_ruc,
    cliente_razon_social: c.cliente_razon_social,
    estado: c.estado,
    fecha_estado: c.fecha_estado,
    fecha_max_prospecto: c.fecha_max_prospecto,
    total_contactos: c.contactos_cliente?.length ?? 0,
    dias_para_contactar: c.fecha_max_prospecto
      ? Math.ceil(
          (new Date(c.fecha_max_prospecto).getTime() - hoy) /
            (1000 * 60 * 60 * 24)
        )
      : null
  }));

  return { cartera, error: null };
}
