import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Play,
  Code,
  Settings,
  AlertCircle,
  Copy,
  Check,
  Eraser,
  Loader2,
  FileJson,
  Sparkles,
  ShieldCheck,
  Moon,
  Sun,
  Download,
} from "lucide-react";

declare global {
  interface Window {
    mermaid: any;
  }
}

const App: React.FC = () => {
  // --- ESTADOS ---
  const [inputText, setInputText] = useState<string>("");
  const [diagramCode, setDiagramCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [apiKey, setApiKey] = useState<string>(
    "AIzaSyAOTPtdPbuAdCulQGYJYxjV1i8ev1Z7NM4"
  );

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [mermaidLoaded, setMermaidLoaded] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"diagram" | "sql" | "analysis">(
    "diagram"
  );
  const [sqlOutput, setSqlOutput] = useState<string>("");
  const [analysisOutput, setAnalysisOutput] = useState<string>("");
  const [loadingFeature, setLoadingFeature] = useState<boolean>(false);

  const mermaidRef = useRef<HTMLDivElement>(null);
  const defaultPrompt =
    "Escribe un enunciado... \nEjemplo: Una universidad ofrece cursos impartidos por profesores. Los estudiantes se inscriben en cursos y obtienen una calificación. Cada curso pertenece a un departamento.";

  // --- INICIALIZACIÓN ---
  useEffect(() => {
    const initMermaid = () => {
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: isDarkMode ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        });
        setMermaidLoaded(true);
        if (diagramCode && mermaidRef.current) {
          renderDiagram();
        }
      }
    };

    if (!window.mermaid) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js";
      script.async = true;
      script.onload = initMermaid;
      document.body.appendChild(script);
    } else {
      initMermaid();
    }
  }, [isDarkMode]);

  // --- RENDERIZADO ---
  useEffect(() => {
    if (
      activeTab === "diagram" &&
      diagramCode &&
      mermaidLoaded &&
      mermaidRef.current
    ) {
      renderDiagram();
    }
  }, [diagramCode, mermaidLoaded, activeTab]);

  const renderDiagram = async () => {
    try {
      const element = mermaidRef.current;
      if (!element || !window.mermaid) return;

      element.innerHTML = "";
      const id = `mermaid-${Date.now()}`;
      const { svg } = await window.mermaid.render(id, diagramCode);
      element.innerHTML = svg;
      setError(null);
    } catch (err: any) {
      console.error("Mermaid Error:", err);
    }
  };

  // --- LLAMADA A GEMINI ---
  const callGeminiAPI = async (prompt: string): Promise<string | null> => {
    if (!apiKey) {
      setError("Falta la API Key.");
      return null;
    }
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (err: any) {
      throw new Error("Error IA: " + err.message);
    }
  };

  // --- FUNCIÓN DE LIMPIEZA ---
  const sanitizeMermaidCode = (code: string): string => {
    let clean = code
      .replace(/```mermaid/g, "")
      .replace(/```/g, "")
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N")
      .replace(/[áäàâ]/g, "a")
      .replace(/[ÁÄÀÂ]/g, "A")
      .replace(/[éëèê]/g, "e")
      .replace(/[ÉËÈÊ]/g, "E")
      .replace(/[íïìî]/g, "i")
      .replace(/[ÍÏÌÎ]/g, "I")
      .replace(/[óöòô]/g, "o")
      .replace(/[ÓÖÒÔ]/g, "O")
      .replace(/[úüùû]/g, "u")
      .replace(/[ÚÜÙÛ]/g, "U")
      .replace(/\((.*?)\)/g, "")
      .trim();

    const startIndex = clean.indexOf("erDiagram");
    if (startIndex !== -1) {
      clean = clean.substring(startIndex);
    }

    return clean;
  };

  // --- FUNCIONES LÓGICAS ---
  const generateDiagram = async () => {
    if (!inputText.trim()) {
      setError("Escribe una descripción.");
      return;
    }
    setLoading(true);
    setError(null);
    setDiagramCode("");
    setSqlOutput("");
    setAnalysisOutput("");
    setActiveTab("diagram");
    try {
      const prompt = `Eres un experto ingeniero de datos. Genera código Mermaid.js 'erDiagram' basado en: "${inputText}". 
      REGLAS: 
      1. Devuelve SOLAMENTE el código. Sin explicaciones ni saludos.
      2. Sintaxis 'erDiagram'.
      3. NO uses espacios en nombres de entidades (usa_guiones).
      4. NO uses caracteres especiales.`;

      const result = await callGeminiAPI(prompt);
      if (result) setDiagramCode(sanitizeMermaidCode(result));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSQL = async () => {
    if (!diagramCode) return;
    setLoadingFeature(true);
    setActiveTab("sql");
    try {
      const prompt = `Convierte este diagrama ER a SQL (PostgreSQL): ${diagramCode}. 
      REGLAS: 
      1. Devuelve código SQL formateado y legible.
      2. Usa saltos de línea e indentación correcta.
      3. Solo código CREATE TABLE.`;
      const result = await callGeminiAPI(prompt);
      if (result)
        setSqlOutput(
          result
            .replace(/```sql/g, "")
            .replace(/```/g, "")
            .trim()
        );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingFeature(false);
    }
  };

  const analyzeSchema = async () => {
    if (!diagramCode) return;
    setLoadingFeature(true);
    setActiveTab("analysis");
    try {
      const prompt = `Analiza este diagrama ER: ${diagramCode}. Busca errores y sugiere mejoras. Responde en Markdown Español.`;
      const result = await callGeminiAPI(prompt);
      if (result) setAnalysisOutput(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingFeature(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- FUNCIÓN DESCARGA CORREGIDA (Usa viewBox) ---
  const downloadDiagram = () => {
    if (!mermaidRef.current) return;
    const svgElement = mermaidRef.current.querySelector("svg");
    if (!svgElement) return;

    // 1. Obtener dimensiones reales del SVG (viewBox) para evitar recortes
    // Esto es clave: getBoundingClientRect solo ve lo que está en pantalla.
    // viewBox ve el dibujo completo.
    const viewBox = svgElement.getAttribute("viewBox");
    let width, height;

    if (viewBox) {
      const parts = viewBox.split(" ").map(parseFloat);
      width = parts[2];
      height = parts[3];
    } else {
      const rect = svgElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }

    // 2. Configurar Canvas con alta resolución (x3)
    const scale = 3;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 3. Serializar el SVG
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // 4. Pintar fondo (importante para que no salga transparente/negro en viewers)
      ctx.fillStyle = isDarkMode ? "#0f172a" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 5. Dibujar imagen escalada
      ctx.drawImage(img, 0, 0, width * scale, height * scale);

      // 6. Descargar
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `diagrama-db-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // --- TEMA ---
  const theme = {
    bgMain: isDarkMode
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-50 text-slate-900",
    header: isDarkMode
      ? "bg-slate-900 border-slate-800"
      : "bg-white border-slate-200",
    panel: isDarkMode
      ? "bg-slate-900 border-slate-800"
      : "bg-white border-slate-200",
    input: isDarkMode
      ? "bg-slate-950 border-slate-800 text-slate-200"
      : "bg-slate-50 border-slate-200 text-slate-700",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    codeBlock: isDarkMode
      ? "bg-slate-950 border-slate-800 text-green-400"
      : "bg-slate-50 border-slate-100 text-slate-600",
    tabActive: "border-blue-500 text-blue-500",
    tabInactive: isDarkMode
      ? "border-transparent text-slate-400"
      : "border-transparent text-slate-500",
    diagramBg: isDarkMode
      ? "bg-[radial-gradient(#334155_1px,transparent_1px)]"
      : "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]",
  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${theme.bgMain}`}
    >
      <header
        className={`${theme.header} border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Arquitecto DB <span className="text-blue-500">AI</span>
            </h1>
            <p className={`text-xs ${theme.textMuted} font-medium`}>
              Generador Inteligente
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-all ${
              isDarkMode
                ? "hover:bg-slate-800 text-yellow-400"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all ${
              isDarkMode
                ? "hover:bg-slate-800 text-slate-400"
                : "hover:bg-slate-100 text-slate-500"
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showSettings && (
        <div
          className={`${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-blue-50 border-blue-100"
          } border-b p-6`}
        >
          <div className="max-w-4xl mx-auto">
            <label
              className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                isDarkMode ? "text-blue-400" : "text-blue-800"
              }`}
            >
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${theme.input}`}
            />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div
          className={`w-full lg:w-1/3 p-6 flex flex-col border-r overflow-y-auto ${theme.panel}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`font-bold text-sm uppercase tracking-wide ${theme.textMuted}`}
            >
              1. Descripción
            </h2>
            <button
              onClick={() => setInputText("")}
              className={`text-xs ${theme.textMuted} hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 rounded`}
            >
              <Eraser className="w-3 h-3" /> Borrar
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={defaultPrompt}
            className={`flex-1 w-full p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-4 ${theme.input}`}
          />
          <button
            onClick={generateDiagram}
            disabled={loading || !inputText.trim() || !mermaidLoaded}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              loading || !inputText.trim()
                ? "bg-slate-500/50 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            {loading ? "Procesando..." : "Generar Diagrama"}
          </button>
        </div>

        <div
          className={`w-full lg:w-2/3 flex flex-col overflow-hidden relative ${
            isDarkMode ? "bg-black/20" : "bg-slate-50/50"
          }`}
        >
          <div
            className={`${theme.header} border-b px-4 pt-4 flex items-center justify-between shadow-sm z-10`}
          >
            <div className="flex gap-6">
              {["diagram", "sql", "analysis"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === "sql" && diagramCode) generateSQL();
                    if (tab === "analysis" && diagramCode) analyzeSchema();
                    if (tab === "diagram" || diagramCode)
                      setActiveTab(tab as any);
                  }}
                  className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors capitalize ${
                    activeTab === tab ? theme.tabActive : theme.tabInactive
                  } ${
                    !diagramCode && tab !== "diagram"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {tab === "diagram" && <Database className="w-4 h-4" />}
                  {tab === "sql" && <FileJson className="w-4 h-4" />}
                  {tab === "analysis" && <ShieldCheck className="w-4 h-4" />}
                  {tab === "diagram"
                    ? "Diagrama"
                    : tab === "sql"
                    ? "SQL"
                    : "Auditoría"}
                </button>
              ))}
            </div>

            {/* CONTENEDOR DE BOTONES DE ACCIÓN (INTEGRACIÓN SOLICITADA) */}
            <div className="flex items-center gap-2 mb-3">
              {/* BOTÓN DESCARGAR (Nuevo) */}
              {activeTab === "diagram" && diagramCode && (
                <button
                  onClick={downloadDiagram}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                    isDarkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                  }`}
                >
                  <Download className="w-3 h-3" />
                  PNG
                </button>
              )}

              {/* BOTÓN COPIAR (Existente) */}
              {(diagramCode || sqlOutput || analysisOutput) && (
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeTab === "sql"
                        ? sqlOutput
                        : activeTab === "analysis"
                        ? analysisOutput
                        : diagramCode
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    isDarkMode
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}{" "}
                  Copiar
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden flex flex-col">
            {error && (
              <div className="absolute top-4 left-4 right-4 z-50 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg flex items-start gap-3 text-sm backdrop-blur-md">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />{" "}
                <div>{error}</div>
              </div>
            )}

            {/* VISTA DIAGRAMA */}
            <div
              className={`flex-1 overflow-auto flex flex-col ${
                activeTab !== "diagram" ? "hidden" : ""
              } ${theme.diagramBg} [background-size:16px_16px]`}
            >
              {!diagramCode ? (
                <div
                  className={`flex-1 flex flex-col items-center justify-center p-8 ${theme.textMuted}`}
                >
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                      isDarkMode ? "bg-slate-800" : "bg-slate-100"
                    }`}
                  >
                    <Sparkles className="w-10 h-10 opacity-50" />
                  </div>
                  <p>Describe tu base de datos para comenzar</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex items-center justify-center p-8 min-h-[400px]">
                    <div
                      ref={mermaidRef}
                      className="mermaid w-full flex items-center justify-center"
                    ></div>
                  </div>
                  <div className={`border-t p-4 ${theme.panel}`}>
                    <div
                      className={`text-xs font-bold mb-2 flex items-center gap-2 ${theme.textMuted}`}
                    >
                      <Code className="w-3 h-3" /> CÓDIGO MERMAID
                    </div>
                    <pre
                      className={`text-xs font-mono p-2 rounded border overflow-x-auto ${theme.codeBlock}`}
                    >
                      {diagramCode}
                    </pre>
                  </div>
                </>
              )}
            </div>

            {/* VISTA SQL */}
            <pre
              className={`flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap ${
                activeTab !== "sql" ? "hidden" : ""
              } ${
                isDarkMode
                  ? "bg-blue text-blue-100" // <--- MODO NOCHE: Azul oscuro y texto claro
                  : "bg-gray-100 text-slate-900 border-l border-slate-200" // <--- MODO CLARO: Blanco y texto oscuro
              }`}
            >
              {loadingFeature ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                sqlOutput || "Genera el diagrama primero..."
              )}
            </pre>

            {/* VISTA ANÁLISIS */}
            <div
              className={`flex-1 overflow-auto p-8 prose max-w-none ${
                activeTab !== "analysis" ? "hidden" : ""
              } ${isDarkMode ? "prose-invert bg-slate-900" : "bg-white"}`}
            >
              {loadingFeature ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {analysisOutput || "Genera el diagrama primero..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
