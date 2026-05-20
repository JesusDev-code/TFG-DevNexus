/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  ShieldCheck,
  Code2,
  MessageSquare,
  Terminal,
  Layers,
  BrainCircuit,
  Zap,
  ArrowRight,
  Users,
  Server,
  Bot,
  Globe,
} from 'lucide-react';

// --- Types ---
interface SlideData {
  id: number;
  section: string;
  title: React.ReactNode;
  subtitle: string;
  content: React.ReactNode;
  metrics?: { value: string; label: string }[];
  visual?: React.ReactNode;
}

// --- Components ---

const Tag = ({ children, color }: { children: React.ReactNode; color: string }) => {
  const colors: Record<string, string> = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

interface SlideProps {
  slide: SlideData;
  direction: number;
  currentSlide: number;
}

const Slide = ({ slide, direction, currentSlide }: SlideProps) => {
  return (
    <motion.div
      key={slide.id}
      initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 100 }}
      className={`absolute inset-0 flex flex-col justify-center px-12 md:px-24 ${currentSlide === 0 ? 'pt-32 pb-32' : 'pt-12 pb-12'}`}
    >
      <div className="grid grid-cols-12 gap-12 lg:gap-20 w-full max-w-[1500px] mx-auto items-center">
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-block px-3 py-1 glass rounded-full text-[10px] uppercase tracking-widest text-brand-gold font-bold">
                {slide.section}
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif leading-tight text-white italic drop-shadow-md">
              {slide.title}
            </h2>
            <p className="text-xl text-slate-400 font-light max-w-xl leading-relaxed">
              {slide.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            {slide.metrics && (
              <div className="flex gap-12 mb-10 overflow-x-auto pb-4 no-scrollbar">
                {slide.metrics.map((m, i) => (
                  <React.Fragment key={i}>
                    <div>
                      <p className="text-3xl font-serif text-white">{m.value}</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 whitespace-nowrap">{m.label}</p>
                    </div>
                    {i < slide.metrics!.length - 1 && (
                      <div className="w-px h-10 bg-white/10 self-center hidden sm:block"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            <div className="text-slate-300">
              {slide.content}
            </div>
          </motion.div>
        </div>

        <div className="hidden lg:col-span-5 lg:flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-full relative"
          >
            {slide.visual || (
              <div className="aspect-[4/5] glass rounded-3xl flex items-center justify-center relative overflow-hidden border-white/5">
                <div className="absolute inset-0 bg-brand-gold/5 blur-[80px]" />
                <Code2 className="w-20 h-20 text-brand-gold/20" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// --- App Main ---

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides: SlideData[] = [
    // SLIDE 0 — Portada
    {
      id: 0,
      section: 'PRESENTACIÓN PROYECTO 2026',
      title: <>Plataforma <br /> <span className="gold-gradient">DevNexus</span></>,
      subtitle: 'Unificando la gestión de diarios, incidencias y comunicación para equipos de desarrollo.',
      metrics: [
        { value: 'DAM', label: 'Ciclo Superior' },
        { value: 'SaaS', label: 'Arquitectura' },
        { value: '4.5m', label: 'Desarrollo' },
      ],
      content: (
        <div className="space-y-8">
          <p className="text-slate-400 font-light leading-relaxed">
            Una solución integral diseñada para eliminar la dispersión de herramientas centralizando
            la trazabilidad en un entorno seguro y eficiente desplegado en producción real.
          </p>
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-slate-500/80 uppercase pt-2 border-t border-white/5">
            <Globe className="w-3 h-3 text-brand-gold/60" />
            <span className="font-mono normal-case tracking-normal text-slate-400/80">devnexus.es</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500/70">IES Rafael Alberti</span>
          </div>
        </div>
      ),
      visual: (
        <div className="relative w-full aspect-square flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-gold/10 blur-[120px] rounded-full animate-pulse" />
          <div className="relative p-12 glass rounded-full border-2 border-brand-gold/20 shadow-[0_0_50px_rgba(197,160,89,0.1)]">
            <Cpu className="w-40 h-40 text-brand-gold" />
          </div>
          <div className="absolute -top-4 -right-4 p-5 glass rounded-2xl animate-float">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="absolute -bottom-4 -left-4 p-5 glass rounded-2xl animate-float [animation-delay:2s]">
            <Zap className="w-10 h-10 text-amber-500" />
          </div>
        </div>
      ),
    },

    // SLIDE 1 — Problema & Solución
    {
      id: 1,
      section: '01. PROBLEMA & SOLUCIÓN',
      title: <>Trazabilidad vs <br /> <span className="gold-gradient">Fragmentación</span></>,
      subtitle: 'La dispersión de información es la mayor causa de ineficiencia en el desarrollo moderno.',
      metrics: [
        { value: '30%', label: 'Tiempo Perdido' },
        { value: '4+', label: 'Apps Dispares' },
      ],
      content: (
        <div className="space-y-6">
          <div className="p-5 glass rounded-2xl border-l-4 border-red-500/40">
            <h4 className="font-bold text-white mb-1 uppercase tracking-widest text-[10px]">El Problema Real</h4>
            <p className="text-sm text-slate-400">
              Slack, Excel, Jira, GitHub — información crítica perdida entre chats y correos.
              Auditorías imposibles. El aprendizaje del equipo no queda registrado en ningún sitio.
            </p>
          </div>
          <div className="p-5 glass-gold rounded-2xl border-l-4 border-brand-gold">
            <h4 className="font-bold text-white mb-1 uppercase tracking-widest text-[10px]">La Solución Unificada</h4>
            <p className="text-sm text-slate-300">
              DevNexus centraliza diarios de progreso, IDE integrado, gestión de tickets con chat
              y auditoría automática en una única fuente de verdad técnica.
            </p>
          </div>
        </div>
      ),
      visual: (
        <div className="grid grid-cols-2 gap-4 w-full">
          {[
            { icon: ShieldCheck, label: 'Auditoría Automática', sub: 'Spring AOP' },
            { icon: BrainCircuit, label: 'IA Visión + LLM', sub: 'Groq Llama 3.3' },
            { icon: Code2, label: 'Sandbox Público', sub: 'Preview en Blog' },
            { icon: Database, label: 'Export Portable', sub: 'CSV + Markdown' },
          ].map((item, i) => (
            <div key={i} className="aspect-square glass rounded-3xl flex flex-col items-center justify-center group hover:bg-white/5 transition-all hover:-translate-y-1 p-4">
              <item.icon className="w-12 h-12 text-slate-500 group-hover:text-brand-gold transition-colors mb-3" />
              <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold text-center">{item.label}</span>
              <span className="text-[8px] uppercase tracking-widest text-slate-600 mt-1 text-center">{item.sub}</span>
            </div>
          ))}
          <div className="col-span-2 glass-gold rounded-3xl flex items-center gap-4 p-4 border border-brand-gold/30 hover:-translate-y-1 transition-all">
            <MessageSquare className="w-10 h-10 text-brand-gold shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-white font-bold">Feedback docente</p>
              <p className="text-[8px] uppercase tracking-widest text-brand-gold mt-0.5">staffFeedbackMode</p>
              <p className="text-[9px] text-slate-400 mt-1 leading-snug">Admin entra al IDE del alumno · comentarios persistidos</p>
            </div>
          </div>
        </div>
      ),
    },

    // SLIDE 2 — Stack Tecnológico
    {
      id: 2,
      section: '02. STACK TECNOLÓGICO',
      title: <>Decisiones <br /> <span className="gold-gradient">Técnicas</span></>,
      subtitle: 'Arquitectura desacoplada: SPA Angular sobre API REST Spring Boot con persistencia PostgreSQL.',
      metrics: [
        { value: 'Angular', label: 'Frontend' },
        { value: 'Kotlin', label: 'Backend' },
        { value: 'PgSQL 17', label: 'Persistencia' },
      ],
      content: (
        <div className="space-y-4">
          <div className="p-4 glass rounded-xl border-l-2 border-blue-500/50">
            <p className="text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-2">Frontend</p>
            <div className="flex flex-wrap gap-2 mb-2">
              <Tag color="blue">Angular 18 + Ionic 8</Tag>
              <Tag color="blue">Signals + RxJS</Tag>
              <Tag color="blue">Monaco Editor</Tag>
              <Tag color="blue">Capacitor</Tag>
              <Tag color="blue">authGuard · adminGuard</Tag>
            </div>
            <p className="text-[10px] text-slate-500">Patrón híbrido recomendado por Angular — Signals para estado local, RxJS para flujos async. Una codebase para web, PWA y APK nativo. Rutas protegidas con <code className="text-blue-400">CanActivateFn</code>.</p>
          </div>
          <div className="p-4 glass rounded-xl border-l-2 border-purple-500/50">
            <p className="text-[10px] uppercase tracking-widest font-bold text-purple-400 mb-2">Backend</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Tag color="purple">Spring Boot 3</Tag>
              <Tag color="purple">Kotlin</Tag>
              <Tag color="purple">Spring AOP</Tag>
              <Tag color="purple">springdoc-openapi</Tag>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-400 mb-1">AUTH · ¿quién sos?</p>
                <div className="flex flex-wrap gap-1">
                  <Tag color="emerald">Firebase Auth</Tag>
                  <Tag color="emerald">JWT firmado Firebase</Tag>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-[9px] uppercase tracking-widest font-bold text-amber-400 mb-1">AUTHZ · ¿qué podés?</p>
                <div className="flex flex-wrap gap-1">
                  <Tag color="amber">Spring Security</Tag>
                  <Tag color="amber">RBAC</Tag>
                  <Tag color="amber">@PreAuthorize</Tag>
                  <Tag color="amber">HSTS / CSP / CORS</Tag>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Firebase autentica, Spring Security autoriza. @Aspect intercepta todos los controladores para auditoría automática.</p>
          </div>
        </div>
      ),
      visual: (
        <div className="glass rounded-3xl p-8 border-white/5 space-y-4">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Angular 18 + Ionic 8 — SPA / PWA / APK</p>
            <p className="text-[8px] text-slate-500 mt-1">Signals · Monaco Editor · Capacitor · RxJS</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-[8px] text-slate-600 uppercase tracking-widest">
            <div className="h-px flex-1 bg-white/10" /><span>REST / JSON + Firebase JWT</span><div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Spring Boot 3 — Kotlin</p>
            <p className="text-[8px] text-slate-500 mt-1">Spring AOP · RBAC · Spring Security · Swagger UI</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-[9px] font-bold text-amber-400">PostgreSQL 17</p>
              <p className="text-[7px] text-slate-500 mt-0.5">Flyway migrations</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-[9px] font-bold text-emerald-400">Firebase</p>
              <p className="text-[7px] text-slate-500 mt-0.5">Auth · FCM</p>
              <p className="text-[7px] text-emerald-300/70 mt-0.5">Calendario · privado (user) | público + push FCM (admin)</p>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
              <p className="text-[9px] font-bold text-pink-400">Groq Cloud</p>
              <p className="text-[7px] text-slate-500 mt-0.5">Llama 3.3 vision + LLM</p>
            </div>
          </div>
        </div>
      ),
    },

    // SLIDE 3 — Infraestructura & VPS
    {
      id: 3,
      section: '03. INFRAESTRUCTURA & OBSERVABILIDAD',
      title: <>Servidor Real <br /> <span className="gold-gradient">en Producción</span></>,
      subtitle: 'VPS propio con orquestación Docker, observabilidad activa y backup redundante. Coste casi cero.',
      metrics: [
        { value: '4 vCores', label: 'CPU' },
        { value: '8 GB', label: 'RAM' },
        { value: '75 GB', label: 'SSD' },
      ],
      content: (
        <div className="space-y-3">
          {[
            {
              icon: Server,
              title: 'Dokploy — orquestación',
              desc: 'Plataforma de despliegue autoalojada. Hace pull, build y deploy de los contenedores Docker. Vercel-like pero con control total y coste fijo.',
              color: 'border-blue-500/40',
            },
            {
              icon: ShieldCheck,
              title: 'SSL automático · Let\'s Encrypt',
              desc: 'Traefik renueva certificados antes de que expiren. Sin intervención manual, sin downtime por SSL caducado.',
              color: 'border-emerald-500/40',
            },
            {
              icon: Bot,
              title: 'Telegram Bot — observabilidad',
              desc: 'Alerta en tiempo real si un contenedor se reinicia o si CPU/RAM se disparan. Sin esto, un producto en producción es una bomba de tiempo.',
              color: 'border-purple-500/40',
            },
            {
              icon: Database,
              title: 'Backup nocturno · NeonDB',
              desc: 'Réplica fría de PostgreSQL en otro proveedor cloud. Redundancia geográfica básica ante caída total del VPS.',
              color: 'border-amber-500/40',
            },
          ].map((item, i) => (
            <div key={i} className={`flex gap-4 p-3 glass rounded-xl border-l-2 ${item.color}`}>
              <item.icon className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">{item.title}</h5>
                <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
      visual: (
        <div className="relative p-8 glass rounded-3xl border-white/5 bg-slate-900/50 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">vps-production: active</span>
          </div>
          <div className="space-y-2 font-mono text-[9px] text-slate-400">
            <p className="text-brand-gold">{' >> '} dokploy: running</p>
            <p className="text-brand-gold">{' >> '} traefik_proxy: routing</p>
            <p>{' >> '} nginx (frontend): try_files /index.html</p>
            <p>{' >> '} pgbouncer_pool: ready</p>
            <p className="text-blue-400">{' >> '} firebase_jwt: validated</p>
            <p className="text-purple-400">{' >> '} telegram_bot: monitoring</p>
            <p>{' >> '} neondb_backup: nightly_ok</p>
            <p>{' >> '} ssl_renewal: auto</p>
          </div>
          <div className="pt-3 border-t border-white/5 flex justify-between">
            <Database className="w-6 h-6 text-brand-gold opacity-40" />
            <ShieldCheck className="w-6 h-6 text-emerald-500 opacity-40" />
            <Cpu className="w-6 h-6 text-blue-500 opacity-40" />
            <Bot className="w-6 h-6 text-purple-400 opacity-40" />
          </div>
        </div>
      ),
    },

    // SLIDE 4 — Arquitectura de capas
    {
      id: 4,
      section: '04. ARQUITECTURA',
      title: <>Arquitectura <br /> <span className="gold-gradient">de Capas</span></>,
      subtitle: 'Cliente → Proxy → Aplicación → Datos. Todo en contenedores Docker. Cada capa con responsabilidad única y aislada por contrato.',
      metrics: [
        { value: 'Stateless', label: 'Backend' },
        { value: 'Pooled', label: 'PostgreSQL' },
        { value: 'Zero-Trust', label: 'Auth' },
      ],
      content: (
        <div className="space-y-3">
          {[
            {
              icon: Users,
              title: '1 · Cliente',
              desc: 'Web SPA, PWA instalable y APK nativo de Android — una sola codebase Angular + Capacitor servida sobre HTTPS.',
              color: 'border-blue-500/40',
            },
            {
              icon: ShieldCheck,
              title: '2 · Proxy inverso — Traefik',
              desc: 'Proxy inverso · SSL automático (Let\'s Encrypt). Único puerto expuesto (443) — enruta a containers internos por dominio.',
              color: 'border-emerald-500/40',
            },
            {
              icon: Server,
              title: '3 · Aplicación',
              desc: 'Nginx (dentro del container frontend) sirve el bundle Angular compilado con try_files. Spring Boot 3 stateless valida JWT de Firebase en cada petición — sin sesión en servidor.',
              color: 'border-purple-500/40',
            },
            {
              icon: Database,
              title: '4 · Datos — PgBouncer + PostgreSQL 17',
              desc: 'PgBouncer mantiene un pool reutilizable: el backend escala sin saturar PostgreSQL. Migraciones versionadas con Flyway.',
              color: 'border-amber-500/40',
            },
          ].map((item, i) => (
            <div key={i} className={`flex gap-4 p-3 glass rounded-xl border-l-2 ${item.color}`}>
              <item.icon className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">{item.title}</h5>
                <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-3 p-3 glass-gold rounded-xl border border-brand-gold/40 items-center">
            <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0" />
            <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-snug">
              Red privada Docker · <span className="text-brand-gold">único expuesto: Traefik</span> · backend + DB invisibles desde fuera
            </p>
          </div>
        </div>
      ),
      visual: (
        <div className="glass rounded-3xl p-6 border-white/5 space-y-3 relative overflow-hidden">
          <div className="absolute inset-y-0 right-3 w-px bg-gradient-to-b from-transparent via-brand-gold/40 to-transparent" />
          <div className="absolute top-1/2 -translate-y-1/2 right-0 rotate-90 origin-right text-[8px] uppercase tracking-[0.3em] font-bold text-brand-gold whitespace-nowrap">
            Spring AOP · Audit Layer
          </div>

          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center mr-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Cliente</p>
            <p className="text-[8px] text-slate-500 mt-0.5">Web · PWA · APK Android</p>
          </div>
          <div className="flex justify-center mr-8">
            <ArrowRight className="w-3 h-3 text-slate-600 rotate-90" />
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center mr-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Traefik · Reverse proxy + SSL</p>
            <p className="text-[8px] text-slate-500 mt-0.5">Routing por dominio · Let's Encrypt · puerto 443</p>
          </div>
          <div className="flex justify-center mr-8">
            <ArrowRight className="w-3 h-3 text-slate-600 rotate-90" />
          </div>

          <div className="grid grid-cols-2 gap-2 mr-8">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <p className="text-[9px] font-bold text-purple-400">Nginx (interno)</p>
              <p className="text-[7px] text-slate-500 mt-0.5">Sirve bundle Angular · try_files SPA</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <p className="text-[9px] font-bold text-purple-400">Spring Boot</p>
              <p className="text-[7px] text-slate-500 mt-0.5">Stateless · JWT</p>
            </div>
          </div>
          <div className="flex justify-center mr-8">
            <ArrowRight className="w-3 h-3 text-slate-600 rotate-90" />
          </div>

          <div className="grid grid-cols-2 gap-2 mr-8">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-[9px] font-bold text-amber-400">PgBouncer</p>
              <p className="text-[7px] text-slate-500 mt-0.5">Connection pool</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-[9px] font-bold text-amber-400">Postgres 17</p>
              <p className="text-[7px] text-slate-500 mt-0.5">Flyway · NeonDB bkp</p>
            </div>
          </div>
        </div>
      ),
    },

    // SLIDE 5 — Conclusiones
    {
      id: 5,
      section: '05. VIABILIDAD & CONCLUSIONES',
      title: <>Resultados <br /> <span className="gold-gradient">del TFG</span></>,
      subtitle: 'Un proyecto que resuelve problemas reales con coste de infraestructura prácticamente cero.',
      metrics: [
        { value: '100%', label: 'RF Cumplidos' },
        { value: '500+', label: 'Tests' },
        { value: '0€', label: 'Cloud Extra' },
      ],
      content: (
        <div className="space-y-6 pt-2">
          <p className="text-sm text-slate-400 leading-relaxed font-light">
            DevNexus demuestra que es posible construir herramientas de gestión técnica de alta fidelidad
            usando tecnologías Open Source y arquitecturas escalables modernas.
          </p>
          <div className="space-y-3">
            {[
              { t: 'Desplegado en producción real', d: 'Accesible en web y como APK nativo de Android.' },
              { t: 'Decisiones de arquitectura reales', d: 'Signals vs RxJS, PgBouncer, AOP, Zero-Trust — no tutoriales.' },
              { t: 'Listo para escala comercial', d: 'Backend stateless, pool de conexiones, Docker replicable.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-3 glass rounded-xl border-l-2 border-brand-gold/50">
                <ArrowRight className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white">{f.t}</h5>
                  <p className="text-[10px] text-slate-500">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      visual: (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-gold/20 blur-[80px] rounded-full animate-pulse" />
            <div className="relative p-10 glass rounded-full border-2 border-brand-gold bg-brand-gold/10">
              <ShieldCheck className="w-20 h-20 text-brand-gold" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full text-center">
            <div>
              <p className="text-2xl font-serif text-white">20+</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Interfaces</p>
            </div>
            <div>
              <p className="text-2xl font-serif text-white">Web</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">+ Android</p>
            </div>
            <div>
              <p className="text-2xl font-serif text-white">VPS</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Propio</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Tag color="purple">Backend Ready</Tag>
            <Tag color="blue">PWA + APK</Tag>
            <Tag color="emerald">500+ Tests</Tag>
          </div>
        </div>
      ),
    },

    // SLIDE 6 — Despedida
    {
      id: 6,
      section: 'DESPEDIDA',
      title: <>Muchas <br /> <span className="gold-gradient">Gracias</span></>,
      subtitle: 'Quedo a su disposición para cualquier pregunta técnica o funcional.',
      content: (
        <div className="pt-12 border-t border-white/5 space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-1 font-black">Centro Educativo</p>
              <p className="text-sm font-serif italic text-slate-300">IES Rafael Alberti, Cádiz</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-1 font-black">Grado Superior</p>
              <p className="text-sm font-serif italic text-slate-300">Desarrollo Multiplataforma</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="w-12 h-0.5 bg-brand-gold opacity-50" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-brand-gold font-black">DevNexus • 2026</p>
          </div>
        </div>
      ),
      visual: (
        <div
          className="group relative cursor-pointer"
          onClick={() => {
            setDirection(-1);
            setCurrentSlide(0);
          }}
        >
          <div className="absolute inset-0 bg-brand-gold/20 blur-[100px] group-hover:bg-brand-gold/40 transition-all rounded-full" />
          <div className="relative p-20 glass rounded-full border border-brand-gold/30 hover:border-brand-gold transition-colors flex flex-col items-center">
            <Code2 className="w-24 h-24 text-white mb-4 animate-float" />
            <span className="text-[10px] text-brand-gold uppercase tracking-[0.5em] font-black group-hover:scale-110 transition-transform">Volver al Inicio</span>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(s => s + 1);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(s => s - 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="relative h-screen w-screen bg-[#0A0A0A] text-slate-100 overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-gold/5 blur-[150px] transform translate-x-1/4 -translate-y-1/4 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-white/5 blur-[120px] transform -translate-x-1/4 translate-y-1/4 rounded-full" />
      </div>

      {/* Top right counter */}
      <div className="absolute top-6 right-12 z-[60] flex items-center gap-6">
        {currentSlide > 0 && (
          <div className="flex items-center gap-3 px-3 py-1.5 glass rounded-full border-white/5">
            <span className="text-[10px] font-serif italic text-white/40">0{currentSlide + 1}</span>
            <div className="w-8 h-[1px] bg-white/10" />
            <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold">DevNexus</span>
          </div>
        )}
      </div>

      {/* Side Navigation Dots */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-[60] hidden md:flex flex-col gap-3">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentSlide ? 1 : -1);
              setCurrentSlide(i);
            }}
            className={`w-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === i ? 'h-6 bg-brand-gold' : 'h-1.5 bg-white/10 hover:bg-white/30'
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Main Slide Content */}
      <main className="relative h-full w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <Slide key={currentSlide} slide={slides[currentSlide]} direction={direction} currentSlide={currentSlide} />
        </AnimatePresence>
      </main>

      {/* Navigation Buttons */}
      <div className="absolute bottom-8 right-12 z-[60] flex gap-3">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all ${currentSlide === 0 ? 'opacity-0' : 'opacity-100'} cursor-pointer border-white/10 shadow-xl`}
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer border-white/10 shadow-xl"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
