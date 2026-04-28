// config/supabase.js
// Inicializa y exporta el cliente de Supabase usando la service_role key.
// Se usa esta clave (y no la anon key) para que el servidor tenga acceso
// completo a la base de datos sin restricciones de RLS.
// NUNCA exponer esta clave en el frontend.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default supabase