import { supabase } from '../supabaseClient';

export type Perfil = {
  id: string;
  nombre_completo: string;
  titulo_profesional: string | null;
  resumen: string | null;
  correo: string;
  telefono: string | null;
  ubicacion: string | null;
  fecha_nacimiento: string | null;
  nacionalidad: string | null;
  sitio_web: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portafolio_url: string | null;
  foto_url: string | null;
  disponibilidad: string | null;
  salario_deseado: number | null;
  trabajo_remoto: boolean | null;
  idiomas: string[] | null;
  habilidades: string[] | null;
  soft_skills: string[] | null;
  intereses: string[] | null;
  experiencia: any[] | null;
  educacion: any[] | null;
  proyectos: any[] | null;
  certificaciones: any[] | null;
  redes_extra: Record<string, string> | null;
  datos_extra: Record<string, any> | null;
  slug: string | null;
  creado_en: string;
  actualizado_en: string;
};

export async function obtenerPerfilPrincipal(): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from('perfil')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error consultando perfil:', error.message);
    return null;
  }
  return (data && data[0]) ?? null;
}