import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { obtenerPerfilPrincipal } from './api/perfil';

/*
  Hoja de vida – versión centrada en UNA COLUMNA
  - Layout 1 columna centrada (sin espacio vacío a la derecha)
  - Ancho cómodo y responsivo (max 860px)
  - Tarjetas con estilo “neumorphism suave”
  - Tipografía y jerarquía cuidadas
  - Modo claro/oscuro con toggle manual + auto por sistema
  - Foto local desde /public/avatar.jpg por defecto, con fallback a Supabase foto_url
  - Secciones: Header, Resumen rápido, Resumen, Contacto, Idiomas, Skills, Experiencia, Educación, Proyectos, Certificaciones, Intereses, Redes extra, Footer
*/

/* Utils */
function moneyCOP(value) {
  if (value == null || isNaN(value)) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
function fmtDate(input) {
  if (!input) return '';
  try {
    const d = new Date(input);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return input;
  }
}

/* UI primitives */
function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="btn-toggle" aria-label="Cambiar tema" onClick={onToggle} title="Cambiar tema">
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
function Badge({ children }) {
  return <span className="badge">{children}</span>;
}
function Chip({ children }) {
  return <span className="chip">{children}</span>;
}
function Chips({ items }) {
  if (!items || items.length === 0) return null;
  return <div className="chips">{items.map((i, idx) => <Chip key={idx}>{i}</Chip>)}</div>;
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
function LinkItem({ label, href }) {
  if (!href) return null;
  return (
    <li className="kv">
      <span className="kv-label">{label}</span>
      <a className="kv-value link" href={href} target="_blank" rel="noreferrer">{href}</a>
    </li>
  );
}

/* Skeleton */
function Skeleton({ lines = 5 }) {
  return (
    <div className="card">
      <div className="skeleton">
        {Array.from({ length: lines }).map((_, i) => <div key={i} className="skeleton-line" />)}
      </div>
    </div>
  );
}

/* Header */
function Header({ perfil }) {
  const initials = useMemo(() => {
    const n = perfil?.nombre_completo || '';
    const parts = n.trim().split(/\s+/);
    const a = parts[0]?.[0]?.toUpperCase() || '';
    const b = parts[1]?.[0]?.toUpperCase() || '';
    return (a + b) || '🙂';
  }, [perfil?.nombre_completo]);

  // Prioridad foto: local /public/avatar.jpg -> Supabase foto_url -> placeholder
  const localAvatar = '/avatar.jpg';
  const avatarSrc = perfil?.foto_url ? perfil.foto_url : localAvatar;

  return (
    <header className="card header">
      <div className="header-left">
        {avatarSrc ? (
          <img className="avatar" src={avatarSrc} alt={perfil?.nombre_completo || 'Avatar'} onError={(e) => {
            // si avatar local no existe y foto_url tampoco sirve, muestra placeholder
            e.currentTarget.style.display = 'none';
            const ph = e.currentTarget.nextElementSibling;
            if (ph) ph.classList.remove('hidden');
          }} />
        ) : null}
        <div className="avatar placeholder hidden" aria-hidden="true">{initials}</div>
      </div>
      <div className="header-right">
        <h1 className="title">{perfil?.nombre_completo}</h1>
        {perfil?.titulo_profesional && <h2 className="subtitle">{perfil.titulo_profesional}</h2>}
        <div className="badges">
          {perfil?.ubicacion && <Badge>{perfil.ubicacion}</Badge>}
          {perfil?.trabajo_remoto && <Badge>Remoto</Badge>}
          {perfil?.disponibilidad && <Badge>{perfil.disponibilidad}</Badge>}
          {!!perfil?.salario_deseado && <Badge>Salario deseado {moneyCOP(perfil.salario_deseado)}</Badge>}
        </div>
      </div>
    </header>
  );
}

/* Section shell */
function Section({ title, icon, children }) {
  return (
    <section className="card section">
      <div className="section-head">
        <div className="section-icon" aria-hidden="true">{icon}</div>
        <h3 className="section-title">{title}</h3>
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

/* Experience timeline */
function Timeline({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="timeline">
      {items.map((exp, i) => (
        <li key={i} className="timeline-item">
          <div className="dot" />
          <div className="tl-content">
            <div className="tl-row">
              <div className="tl-company">{exp.empresa}</div>
              <div className="tl-dates">{exp.inicio} — {exp.fin ?? 'Actual'}</div>
            </div>
            <div className="tl-role">
              {exp.cargo}{exp.ubicacion ? ` • ${exp.ubicacion}` : ''}
            </div>
            {exp.descripcion && <p className="tl-desc">{exp.descripcion}</p>}
            {Array.isArray(exp.logros) && exp.logros.length > 0 && (
              <ul className="bullets">
                {exp.logros.map((l, j) => <li key={j}>{l}</li>)}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* Projects */
function Projects({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="projects-grid">
      {items.map((p, i) => (
        <article key={i} className="project">
          <div className="project-head">
            <div className="project-title">
              <strong>{p.nombre}</strong> • {p.rol}
            </div>
            {p.url && <a className="btn-link" href={p.url} target="_blank" rel="noreferrer">Visitar</a>}
          </div>
          {p.descripcion && <p className="project-desc">{p.descripcion}</p>}
          {Array.isArray(p.tecnologias) && p.tecnologias.length > 0 && <Chips items={p.tecnologias} />}
        </article>
      ))}
    </div>
  );
}

/* Footer */
function Footer({ perfil }) {
  return (
    <footer className="footer">
      <div>Actualizado: {fmtDate(perfil?.actualizado_en) || '—'}</div>
      <div className="muted">Construido con Vite + React + Supabase</div>
    </footer>
  );
}

/* App */
export default function App() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [theme, setTheme] = useState(() => {
    return window.matchMedia?.matches && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className="page">
      <div className="bg-gradient" />
      <div className="wrap">
        {/* Top bar actions */}
        <div className="topbar">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <div className="top-actions">
            {perfil?.portafolio_url && <a className="btn-ghost" href={perfil.portafolio_url} target="_blank" rel="noreferrer">Portafolio</a>}
            {perfil?.github_url && <a className="btn-ghost" href={perfil.github_url} target="_blank" rel="noreferrer">GitHub</a>}
            {perfil?.linkedin_url && <a className="btn-ghost" href={perfil.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
          </div>
        </div>

        {/* Estado */}
        {loading && (
          <>
            <Skeleton lines={6} />
            <Skeleton lines={4} />
            <Skeleton lines={10} />
          </>
        )}
        {!loading && errorMsg && <div className="card error">{errorMsg}</div>}

        {/* Contenido UNA COLUMNA */}
        {!loading && perfil && (
          <main className="single">
            <Header perfil={perfil} />

            <Section title="Resumen rápido" icon="📈">
              <div className="stats">
                <div className="stat">
                  <div className="stat-value">{Array.isArray(perfil.experiencia) ? perfil.experiencia.length : 0}</div>
                  <div className="stat-label">Experiencias</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{Array.isArray(perfil.proyectos) ? perfil.proyectos.length : 0}</div>
                  <div className="stat-label">Proyectos</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{Array.isArray(perfil.certificaciones) ? perfil.certificaciones.length : 0}</div>
                  <div className="stat-label">Certificaciones</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{Array.isArray(perfil.habilidades) ? perfil.habilidades.length : 0}</div>
                  <div className="stat-label">Skills</div>
                </div>
              </div>
            </Section>

            {perfil.resumen && (
              <Section title="Resumen" icon="📝">
                <p className="lead">{perfil.resumen}</p>
              </Section>
            )}

            <Section title="Contacto" icon="📬">
              <ul className="kvs">
                <KV label="Correo" value={perfil.correo} />
                <KV label="Teléfono" value={perfil.telefono} />
                <LinkItem label="Sitio web" href={perfil.sitio_web} />
                <LinkItem label="LinkedIn" href={perfil.linkedin_url} />
                <LinkItem label="GitHub" href={perfil.github_url} />
                <LinkItem label="Portafolio" href={perfil.portafolio_url} />
              </ul>
            </Section>

            <Section title="Idiomas" icon="🌐">
              <Chips items={perfil.idiomas ?? []} />
            </Section>

            <Section title="Habilidades técnicas" icon="🧠">
              <Chips items={perfil.habilidades ?? []} />
            </Section>

            <Section title="Habilidades blandas" icon="🤝">
              <Chips items={perfil.soft_skills ?? []} />
            </Section>

            <Section title="Intereses" icon="✨">
              <div className="tags">
                {(perfil.intereses ?? []).map((t, i) => (
                  <span key={i} className="tag">{t}</span>
                ))}
              </div>
            </Section>

            <Section title="Experiencia" icon="💼">
              <Timeline items={perfil.experiencia ?? []} />
            </Section>

            <Section title="Educación" icon="🎓">
              <ul className="edu">
                {(perfil.educacion ?? []).map((edu, i) => (
                  <li key={i} className="edu-item">
                    <div className="edu-row">
                      <span className="edu-inst">{edu.institucion}</span>
                      <span className="edu-dates">{edu.inicio} — {edu.fin}</span>
                    </div>
                    <div className="edu-title">{edu.titulo}</div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Proyectos" icon="🧩">
              <Projects items={perfil.proyectos ?? []} />
            </Section>

            <Section title="Certificaciones" icon="🏅">
              <ul className="certs">
                {(perfil.certificaciones ?? []).map((c, i) => (
                  <li key={i} className="cert-item">
                    <div className="cert-row">
                      <span className="cert-name">{c.nombre}</span>
                      <span className="cert-date">{c.fecha}</span>
                    </div>
                    <div className="cert-detail">
                      {c.entidad}
                      {c.credencial_url && <> • <a className="link" href={c.credencial_url} target="_blank" rel="noreferrer">Credencial</a></>}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Footer perfil={perfil} />
          </main>
        )}
      </div>
    </div>
  );
}