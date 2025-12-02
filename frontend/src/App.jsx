import { useEffect, useState } from 'react';
import './App.css';
import { obtenerPerfilPrincipal } from './api/perfil';

function SeccionTitulo({ perfil }) {
  return (
    <header className="cv-header">
      {perfil.foto_url && (
        <img src={perfil.foto_url} alt={perfil.nombre_completo} className="cv-foto" />
      )}
      <div>
        <h1>{perfil.nombre_completo}</h1>
        {perfil.titulo_profesional && <h2>{perfil.titulo_profesional}</h2>}
        {perfil.ubicacion && <p className="muted">{perfil.ubicacion}</p>}
      </div>
    </header>
  );
}

function SeccionContacto({ perfil }) {
  return (
    <section>
      <h3>Contacto</h3>
      <ul className="cv-list">
        {perfil.correo && <li><strong>Correo:</strong> {perfil.correo}</li>}
        {perfil.telefono && <li><strong>Teléfono:</strong> {perfil.telefono}</li>}
        {perfil.sitio_web && <li><strong>Sitio web:</strong> <a href={perfil.sitio_web} target="_blank" rel="noreferrer">{perfil.sitio_web}</a></li>}
        {perfil.linkedin_url && <li><strong>LinkedIn:</strong> <a href={perfil.linkedin_url} target="_blank" rel="noreferrer">{perfil.linkedin_url}</a></li>}
        {perfil.github_url && <li><strong>GitHub:</strong> <a href={perfil.github_url} target="_blank" rel="noreferrer">{perfil.github_url}</a></li>}
        {perfil.portafolio_url && <li><strong>Portafolio:</strong> <a href={perfil.portafolio_url} target="_blank" rel="noreferrer">{perfil.portafolio_url}</a></li>}
      </ul>
    </section>
  );
}

function ListaChips({ titulo, items }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h3>{titulo}</h3>
      <div className="chips">
        {items.map((i, idx) => <span key={idx} className="chip">{i}</span>)}
      </div>
    </section>
  );
}

function SeccionExperiencia({ experiencia }) {
  if (!experiencia || experiencia.length === 0) return null;
  return (
    <section>
      <h3>Experiencia</h3>
      <ul className="cv-timeline">
        {experiencia.map((exp, idx) => (
          <li key={idx}>
            <div className="cv-timeline-item">
              <div>
                <strong>{exp.empresa}</strong> — {exp.cargo}
                {exp.ubicacion ? ` • ${exp.ubicacion}` : ''}
              </div>
              <div className="muted">{exp.inicio} — {exp.fin ?? 'Actual'}</div>
              {exp.descripcion && <p>{exp.descripcion}</p>}
              {Array.isArray(exp.logros) && exp.logros.length > 0 && (
                <ul className="cv-list">
                  {exp.logros.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeccionEducacion({ educacion }) {
  if (!educacion || educacion.length === 0) return null;
  return (
    <section>
      <h3>Educación</h3>
      <ul className="cv-list">
        {educacion.map((edu, idx) => (
          <li key={idx}>
            <strong>{edu.institucion}</strong> — {edu.titulo}
            <div className="muted">{edu.inicio} — {edu.fin}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeccionProyectos({ proyectos }) {
  if (!proyectos || proyectos.length === 0) return null;
  return (
    <section>
      <h3>Proyectos</h3>
      <ul className="cv-list">
        {proyectos.map((p, idx) => (
          <li key={idx}>
            <strong>{p.nombre}</strong> — {p.rol}
            {p.url && <> • <a href={p.url} target="_blank" rel="noreferrer">{p.url}</a></>}
            {Array.isArray(p.tecnologias) && p.tecnologias.length > 0 && (
              <div className="chips">
                {p.tecnologias.map((t, i) => <span key={i} className="chip">{t}</span>)}
              </div>
            )}
            {p.descripcion && <p>{p.descripcion}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeccionCertificaciones({ certificaciones }) {
  if (!certificaciones || certificaciones.length === 0) return null;
  return (
    <section>
      <h3>Certificaciones</h3>
      <ul className="cv-list">
        {certificaciones.map((c, idx) => (
          <li key={idx}>
            <strong>{c.nombre}</strong> — {c.entidad}
            {c.credencial_url && <> • <a href={c.credencial_url} target="_blank" rel="noreferrer">{c.credencial_url}</a></>}
            {c.fecha && <div className="muted">{c.fecha}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const p = await obtenerPerfilPrincipal();
        if (!p) {
          setErrorMsg('No hay datos de perfil en Supabase.');
        } else {
          setPerfil(p);
        }
      } catch (e) {
        setErrorMsg('Error cargando perfil.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="container"><p>Cargando…</p></div>;
  if (errorMsg) return <div className="container"><p>{errorMsg}</p></div>;
  if (!perfil) return <div className="container"><p>Sin datos.</p></div>;

  return (
    <main className="container">
      <SeccionTitulo perfil={perfil} />

      {perfil.resumen && (
        <section>
          <h3>Resumen</h3>
          <p>{perfil.resumen}</p>
        </section>
      )}

      <SeccionContacto perfil={perfil} />

      <ListaChips titulo="Idiomas" items={perfil.idiomas ?? []} />
      <ListaChips titulo="Habilidades técnicas" items={perfil.habilidades ?? []} />
      <ListaChips titulo="Habilidades blandas" items={perfil.soft_skills ?? []} />
      <ListaChips titulo="Intereses" items={perfil.intereses ?? []} />

      <SeccionExperiencia experiencia={perfil.experiencia ?? []} />
      <SeccionEducacion educacion={perfil.educacion ?? []} />
      <SeccionProyectos proyectos={perfil.proyectos ?? []} />
      <SeccionCertificaciones certificaciones={perfil.certificaciones ?? []} />
    </main>
  );
}