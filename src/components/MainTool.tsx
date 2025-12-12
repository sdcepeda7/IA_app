import React, { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
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
  Cpu,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

declare global {
  interface Window {
    mermaid: any;
  }
}

const MODELS = [
  {
    id: "gemini-flash-lite-latest",
    name: "Gemini flash lite (Ultra Rápido - Recomendado)",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash (Rapido - Estable - Recomendado)",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro (Mayor Razonamiento)",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini flash lastest (Rápido - Más Reciente)",
  },
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3.0 Pro Preview (Máximo Razonamiento)",
  },
];

const MainTool: React.FC = () => {
  // --- ESTADOS ---
  const [inputText, setInputText] = useState<string>("");
  const [diagramCode, setDiagramCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [apiKey, setApiKey] = useState<string>(
    process.env.REACT_APP_GEMINI_API_KEY || ""
  );

  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);

  const [isFixing, setIsFixing] = useState<boolean>(false);

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [mermaidLoaded, setMermaidLoaded] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<
    "diagram" | "code" | "sql" | "analysis"
  >("diagram");
  const [sqlOutput, setSqlOutput] = useState<string>("");
  const [analysisOutput, setAnalysisOutput] = useState<string>("");
  const [loadingFeature, setLoadingFeature] = useState<boolean>(false);

  // --- REFS ---
  const retryCount = useRef<number>(0);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // --- ESTADOS ZOOM/PAN ---
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const defaultPrompt =
    "Escribe un enunciado... \nEjemplo: Una universidad ofrece cursos impartidos por profesores. Los estudiantes se inscriben en cursos y obtienen una calificación. Cada curso pertenece a un departamento.";

  // --- INICIALIZACION MERMAID ---
  useEffect(() => {
    const initMermaid = () => {
      if (window.mermaid) {
        window.mermaid.parseError = (err: any) => {
          console.log("Error de sintaxis Mermaid (Silenciado):", err);
        };

        window.mermaid.initialize({
          startOnLoad: false,
          theme: isDarkMode ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          suppressErrorRendering: true,
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

  // --- EFECTO RENDERIZADO ---
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

  // --- LOGICA ZOOM/PAN ---
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 1, 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 1, 0.9));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- RENDERIZADO DIAGRAMA ---
  const renderDiagram = async () => {
    const element = mermaidRef.current;
    if (!element || !window.mermaid) return;

    try {
      await window.mermaid.parse(diagramCode);

      element.innerHTML = "";
      const id = `mermaid-${Date.now()}`;
      const { svg } = await window.mermaid.render(id, diagramCode);
      element.innerHTML = svg;

      setError(null);
      retryCount.current = 0;
      resetView();
    } catch (err: any) {
      element.innerHTML = "";
      console.error("Intento fallido:", retryCount.current + 1);

      if (retryCount.current < 1) {
        retryCount.current += 1;
        generateDiagram();
      } else {
        setError(
          "La IA generó un diagrama inválido dos veces. Prueba simplificando tu descripción o cambiando de modelo."
        );
      }
    }
  };

  // --- API GEMINI ---
  const callGeminiAPI = async (prompt: string): Promise<string | null> => {
    if (!apiKey) {
      setError("Falta la API Key.");
      return null;
    }
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Error en la API");
      }

      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (err: any) {
      throw new Error("Error IA: " + err.message);
    }
  };

  // --- LIMPIEZA CODIGO ---
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

  // --- GENERACION DIAGRAMA ---
  const generateDiagram = async () => {
    if (!inputText.trim()) {
      setError("Escribe una descripción.");
      return;
    }
    setLoading(true);
    setError(null);
    setDiagramCode("");
    setSqlOutput(""); // Se limpia el SQL previo
    setAnalysisOutput(""); // Se limpia la auditoria previa
    setActiveTab("diagram");

    if (mermaidRef.current) mermaidRef.current.innerHTML = "";

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

  // --- GENERACION SQL ---
  const generateSQL = async () => {
    if (!diagramCode) return;
    setLoadingFeature(true);
    setActiveTab("sql");
    try {
      const prompt = `Convierte este diagrama ER a SQL (PostgreSQL): ${diagramCode}. 
      REGLAS: 
      1. Devuelve código SQL formateado y legible.
      2. Usa saltos de línea e indentación correcta.
      3. Solo código CREATE TABLE.
      4. Devuelve SOLAMENTE el código. Sin explicaciones ni saludos. `;

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

  // --- ANALISIS AUDITORIA ---
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

  // --- APLICAR CORRECCIONES ---
  const applyFixes = async () => {
    if (!diagramCode || !analysisOutput) return;
    setIsFixing(true);
    try {
      const prompt = `Actúa como un Ingeniero de Datos Senior.
      
      Tengo este código Mermaid ER actual:
      ${diagramCode}

      Y tengo este reporte de auditoría con errores y sugerencias:
      ${analysisOutput}

      TU TAREA: Reescribe el código Mermaid completo aplicando las correcciones sugeridas en la auditoría.
      REGLAS:
      1. Mantén la sintaxis erDiagram.
      2. Devuelve SOLAMENTE el código limpio. Sin explicaciones, ni markdown, ni saludos.
      3. Asegúrate de corregir las relaciones y atributos mencionados.`;

      const result = await callGeminiAPI(prompt);

      if (result) {
        const cleanCode = sanitizeMermaidCode(result);
        setDiagramCode(cleanCode);
        setActiveTab("diagram");
        setSqlOutput(""); // Limpia SQL al aplicar correcciones
        setAnalysisOutput(""); // Limpia auditoria al aplicar correcciones
        setError(null);
      }
    } catch (err: any) {
      setError("No se pudieron aplicar las correcciones: " + err.message);
    } finally {
      setIsFixing(false);
    }
  };

  // --- UTILIDADES ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDiagram = () => {
    if (!mermaidRef.current) return;
    const svgElement = mermaidRef.current.querySelector("svg");
    if (!svgElement) return;

    const viewBox = svgElement.getAttribute("viewBox");
    let width: number, height: number;

    if (viewBox) {
      const parts = viewBox.split(" ").map(parseFloat);
      width = parts[2];
      height = parts[3];
    } else {
      const rect = svgElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }

    const scale = 3;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = isDarkMode ? "#0f172a" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width * scale, height * scale);

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
      <style>{`
        a[href*="codesandbox.io"] {
          display: none !important;
          pointer-events: none !important;
        }
      `}</style>
      <header
        className={`${theme.header} border-b px-6 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-sm`}
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
          } border-b p-6 transition-all`}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <div>
              <label
                className={`block text-xs font-bold mb-2 uppercase tracking-wide flex items-center gap-2 ${
                  isDarkMode ? "text-blue-400" : "text-blue-800"
                }`}
              >
                <Cpu className="w-4 h-4" /> Modelo de Inteligencia Artificial
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer appearance-none ${theme.input}`}
              >
                {MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <p className={`text-xs mt-2 ${theme.textMuted}`}>
                Selecciona el modelo que mejor se adapte a tu necesidad
                (Velocidad vs Potencia).
              </p>
            </div>
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
            onClick={() => {
              retryCount.current = 0;
              generateDiagram();
            }}
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
              {["diagram", "code", "sql", "analysis"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    // SECCION LOGICA PESTAÑAS
                    if (tab === "sql" && diagramCode && !sqlOutput)
                      generateSQL();
                    if (tab === "analysis" && diagramCode && !analysisOutput)
                      analyzeSchema();
                    if (tab === "diagram" || tab === "code" || diagramCode)
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
                  {tab === "code" && <Code className="w-4 h-4" />}
                  {tab === "sql" && <FileJson className="w-4 h-4" />}
                  {tab === "analysis" && <ShieldCheck className="w-4 h-4" />}

                  {tab === "diagram"
                    ? "Diagrama"
                    : tab === "code"
                    ? "Mermaid"
                    : tab === "sql"
                    ? "SQL"
                    : "Auditoría"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-3">
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
                  )}
                  Copiar
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden flex flex-col">
            {error && (
              <div className="absolute top-4 left-4 right-4 z-50 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg flex items-start gap-3 text-sm backdrop-blur-md">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* --- SECCION DIAGRAMA --- */}
            <div
              className={`flex-1 overflow-hidden relative flex flex-col ${
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
                  <div
                    className={`absolute bottom-6 right-6 z-20 flex flex-col gap-2 rounded-xl p-2 shadow-lg border ${
                      isDarkMode
                        ? "bg-slate-900/70 border-slate-700 backdrop-blur"
                        : "bg-white/70 border-slate-200 backdrop-blur"
                    }`}
                  >
                    <button
                      onClick={handleZoomIn}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? "hover:bg-slate-800 text-slate-300"
                          : "hover:bg-slate-200 text-slate-700"
                      }`}
                      title="Acercar"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? "hover:bg-slate-800 text-slate-300"
                          : "hover:bg-slate-200 text-slate-700"
                      }`}
                      title="Alejar"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                    <button
                      onClick={resetView}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? "hover:bg-slate-800 text-slate-300"
                          : "hover:bg-slate-200 text-slate-700"
                      }`}
                      title="Resetear vista"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>

                  <div
                    className="flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <div
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: "center center",
                        transition: isDragging
                          ? "none"
                          : "transform 0.5s ease-out",
                      }}
                      className="w-full h-full flex items-center justify-center p-8 min-h-[400px]"
                    >
                      <div
                        ref={mermaidRef}
                        className="mermaid select-none pointer-events-none"
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <pre
              className={`flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap ${
                activeTab !== "code" ? "hidden" : ""
              } ${
                isDarkMode
                  ? "bg-slate-950 text-slate-200"
                  : "bg-gray-50 text-slate-700 border-l border-slate-200"
              }`}
            >
              {diagramCode || "Genera el diagrama primero..."}
            </pre>

            {/* --- SECCION SQL --- */}
            <div
              className={`flex-1 overflow-auto font-mono text-sm leading-relaxed ${
                activeTab !== "sql" ? "hidden" : ""
              } ${isDarkMode ? "bg-slate-950" : "bg-slate-300"}`}
            >
              {loadingFeature ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                <SyntaxHighlighter
                  language="sql"
                  style={isDarkMode ? vscDarkPlus : vs}
                  showLineNumbers={true}
                  wrapLongLines={true}
                  customStyle={{
                    margin: 0,
                    padding: "1.5rem",
                    height: "100%",
                    fontSize: "14px",
                    background: "transparent",
                    fontFamily:
                      'Menlo, Monaco, Consolas, "Courier New", monospace', // FUENTE FIX
                  }}
                >
                  {sqlOutput ||
                    "-- Genera el diagrama primero para ver el código SQL..."}
                </SyntaxHighlighter>
              )}
            </div>

            {/* --- SECCION AUDITORIA --- */}
            <div
              className={`flex-1 overflow-auto flex flex-col ${
                activeTab !== "analysis" ? "hidden" : ""
              } ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
            >
              {loadingFeature ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <>
                  {analysisOutput && (
                    <div
                      className={`p-4 border-b flex justify-between items-center ${
                        isDarkMode
                          ? "border-slate-800 bg-slate-900/50"
                          : "border-slate-100 bg-slate-50/80"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}
                      >
                        Reporte de IA
                      </span>

                      <button
                        onClick={applyFixes}
                        disabled={isFixing}
                        className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm ${
                          isDarkMode
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-800"
                            : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 disabled:bg-slate-100"
                        }`}
                      >
                        {isFixing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        {isFixing
                          ? "Aplicando mejoras..."
                          : "Aplicar Correcciones Automáticamente"}
                      </button>
                    </div>
                  )}

                  <div
                    className={`p-8 prose max-w-none ${
                      isDarkMode ? "prose-invert" : ""
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {analysisOutput ||
                        "Genera el diagrama primero para auditarlo..."}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainTool;
