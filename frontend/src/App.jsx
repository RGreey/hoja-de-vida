import { useEffect, useState } from 'react';
import './App.css';
import { obtenerPerfilPrincipal } from './api/perfil';

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function LinkItem({ label, href }) {
  if (!href) return null;
  return (
    <li className="kv">
      <span className="kv-label">{label}</span>
      <a className="kv-value link" href={href} target="_blank" rel="noreferrer">{href}</a>
    </li>
  );
}

function KV({ label, value }) {
  if (!value) return null;
  return (
    <li className="kv">
      <span className="kv-label">{label}</span>
      <span className="kv-value">{value}</span>
    </li>
  );
}

function Chips({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="chips">
      {items.map((i, idx) => <span key={idx} className="chip">{i}</span>)}
    </div>
  );
}

function Header({ perfil }) {
  return (
    <header className="card header">
      <div className="header-media">
        {perfil.foto_url ? (
          <img className="avatar" src={perfil.foto_url} alt={perfil.nombre_completo} />
        ) : (
          <div className="avatar placeholder">{perfil.nombre_completo?.[0] ?? '🙂'}</div>
        )}
      </div>
      <div className="header-info">
        <h1 className="title">{perfil.nombre_completo}</h1>
        {perfil.titulo_profesional && <h2 className="subtitle">{perfil.titulo_profesional}</h2>}
        <div className="badges">
          {perfil.ubicacion && <Badge>{perfil.ubicacion}</Badge>}
          {perfil.trabajo_remoto && <Badge>Remoto</Badge>}
          {perfil.disponibilidad && <Badge>{perfil.disponibilidad}</Badge>}
        </div>
      </div>
    </header>
  );
}

function Section({ icon, title, children }) {
  return (
    <section className="card section">
      <div className="section-head">
        <div className="section-icon">{icon}</div>
        <h3 className="section-title">{title}</h3>
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

function Timeline({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="timeline">
      {items.map((exp, idx) => (
        <li key={idx} className="timeline-item">
          <div className="dot" />
          <div className="content">
            <div className="row">
              <div className="bold">{exp.empresa}</div>
              <div className="muted">{exp.inicio} — {exp.fin ?? 'Actual'}</div>
            </div>
            <div className="row">
              <div>{exp.cargo}{exp.ubicacion ? ` • ${exp.ubicacion}` : ''}</div>
            </div>
            {exp.descripcion && <p className="desc">{exp.descripcion}</p>}
            {Array.isArray(exp.logros) && exp.logros.length > 0 && (
              <ul className="list">
                {exp.logros.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Projects({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="projects">
      {items.map((p, idx) => (
        <li key={idx} className="project">
          <div className="project-head">
            <div className="project-title">
              <span className="bold">{p.nombre}</span> • {p.rol}
            </div>
            {p.url && <a className="link" href={p.url} target="_blank" rel="noreferrer">Visitar</a>}
          </div>
          {p.descripcion && <p className="desc">{p.descripcion}</p>}
          {Array.isArray(p.tecnologias) && p.tecnologias.length > 0 && <Chips items={p.tecnologias} />}
        </li>
      ))}
    </ul>
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
        if (!p) setErrorMsg('No hay datos de perfil en Supabase.');
        else setPerfil(p);
      } catch (e) {
        console.error(e);
        setErrorMsg('Error cargando perfil.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page">
      <div className="bg-gradient" />
      <div className="container">
        {loading && <div className="card skeleton">Cargando…</div>}
        {!loading && errorMsg && <div className="card error">{errorMsg}</div>}
        {!loading && perfil && (
          <>
            <Header perfil={perfil} />

            {perfil.resumen && (
              <Section icon="📝" title="Resumen">
                <p className="desc big">{perfil.resumen}</p>
              </Section>
            )}

            <Section icon="📬" title="Contacto">
              <ul className="kvs">
                <KV label="Correo" value={perfil.correo} />
                <KV label="Teléfono" value={perfil.telefono} />
                <LinkItem label="Sitio web" href={perfil.sitio_web} />
                <LinkItem label="LinkedIn" href={perfil.linkedin_url} />
                <LinkItem label="GitHub" href={perfil.github_url} />
                <LinkItem label="Portafolio" href={perfil.portafolio_url} />
              </ul>
            </Section>

            <Section icon="🌐" title="Idiomas">
              <Chips items={perfil.idiomas ?? []} />
            </Section>

            <Section icon="🧠" title="Habilidades técnicas">
              <Chips items={perfil.habilidades ?? []} />
            </Section>

            <Section icon="🤝" title="Habilidades blandas">
              <Chips items={perfil.soft_skills ?? []} />
            </Section>

            <Section icon="💼" title="Experiencia">
              <Timeline items={perfil.experiencia ?? []} />
            </Section>

            <Section icon="🎓" title="Educación">
              <ul className="list">
                {(perfil.educacion ?? []).map((edu, idx) => (
                  <li key={idx}>
                    <div className="row">
                      <div className="bold">{edu.institucion}</div>
                      <div className="muted">{edu.inicio} — {edu.fin}</div>
                    </div>
                    <div>{edu.titulo}</div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section icon="🧩" title="Proyectos">
              <Projects items={perfil.proyectos ?? []} />
            </Section>

            <Section icon="🏅" title="Certificaciones">
              <ul className="list">
                {(perfil.certificaciones ?? []).map((c, idx) => (
                  <li key={idx}>
                    <div className="row">
                      <div className="bold">{c.nombre}</div>
                      <div className="muted">{c.fecha}</div>
                    </div>
                    <div>{c.entidad} {c.credencial_url && <>• <a className="link" href={c.credencial_url} target="_blank" rel="noreferrer">Credencial</a></>}</div>
                  </li>
                ))}
              </ul>
            </Section>

            <footer className="footer">
              <div>Actualizado: {new Date(perfil.actualizado_en).toLocaleDateString()}</div>
              <div className="muted">Hecho con Vite + React + Supabase</div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}