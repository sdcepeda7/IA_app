import React from "react";
import {
  Database,
  Sparkles,
  ShieldCheck,
  Code,
  Github,
  Linkedin,
  Instagram,
  Heart,
  ArrowRight,
  Zap,
  CreditCard,
} from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500 selection:text-white flex flex-col font-sans">
      {/* HEADER */}
      <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Arquitecto DB <span className="text-blue-500">AI</span>
          </span>
        </div>
        <div>
          <a
            href="https://www.paypal.com/invoice/p/#PKZ7CZ8YESH878WV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> Donar 1$
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-blue-400 mb-6">
          <Sparkles className="w-3 h-3" /> Potenciado por Google Gemini AI
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500 max-w-4xl">
          Diseña Bases de Datos a la velocidad del pensamiento
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Transforma tus ideas en diagramas Entidad-Relación profesionales,
          genera código SQL y audita tus esquemas automáticamente usando
          Inteligencia Artificial.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={onStart}
            className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            Comenzar Gratis{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="https://paypal.me/sdcepeda7"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5 text-slate-400" /> Apoyar Proyecto
          </a>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-6xl w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Generación Instantánea</h3>
            <p className="text-slate-400 text-sm">
              Describe tu base de datos en lenguaje natural y obtén un diagrama
              visual y código Mermaid en segundos.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Exportación SQL</h3>
            <p className="text-slate-400 text-sm">
              Convierte tus diagramas visuales directamente a código SQL
              (PostgreSQL) listo para producción.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Auditoría IA</h3>
            <p className="text-slate-400 text-sm">
              Detecta errores de normalización y recibe sugerencias de mejora
              para optimizar tu arquitectura.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="font-bold text-lg">Santiago Danilo Cepeda</p>
            <p className="text-slate-500 text-sm">
              Desarrollador Full Stack & Ing. de Datos
            </p>
          </div>

          <div className="flex gap-6">
            <a
              href="https://github.com/sdcepeda7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/santiago-danilo-cepeda-galeano-15511a293/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/sdcepeda7/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-pink-400 transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="text-center mt-8 text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} Arquitecto DB AI. Todos los derechos
          reservados.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
