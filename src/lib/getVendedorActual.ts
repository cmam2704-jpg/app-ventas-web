import { supabase } from './supabaseClient';

export async function getVendedorActual() {
  // 1. Sesión
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    return { vendedor: null, error: 'NO_SESSION' };
  }

  const email = sessionData.session.user.email;

  if (!email) {
    return { vendedor: null, error: 'NO_EMAIL' };
  }

  // 2. Buscar vendedor por email
  const { data: vendedor, error } = await supabase
    .from('vendedores')
    .select('id, nombres, apellido_paterno, apellido_materno, dni, email')
    .eq('email', email)
    .single();

  if (error) {
    return { vendedor: null, error: 'VENDEDOR_NO_EXISTE' };
  }

  return { vendedor, error: null };
}
