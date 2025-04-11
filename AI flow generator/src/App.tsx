import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, Copy, Wand2, CheckCircle2, XCircle, Brain, Sparkles, ChevronDown, Image, File as FileVector, Cpu, Network, Boxes } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
});

function App() {
  const [requirements, setRequirements] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mermaidCode) {
      mermaid.render('mermaid-diagram', mermaidCode).then(({ svg }) => {
        if (diagramRef.current) {
          diagramRef.current.innerHTML = svg;
        }
      }).catch((err) => {
        setError('Failed to render diagram: ' + err.message);
      });
    }
  }, [mermaidCode]);

  const generateDiagram = async () => {
    if (!requirements.trim()) {
      setError('Please enter your requirements');
      textareaRef.current?.focus();
      return;
    }

    setLoading(true);
    setError('');
    setMermaidCode('');

    try {
      const response = await fetch('http://localhost:4000/generate-mermaid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirements }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diagram');
      }

      const data = await response.json();
      setMermaidCode(data.mermaidCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadDiagram = async (format: 'png' | 'jpeg' | 'svg') => {
    if (!diagramRef.current) return;

    try {
      let dataUrl: string;
      let filename: string;

      if (format === 'svg') {
        const svgElement = diagramRef.current.querySelector('svg');
        if (!svgElement) throw new Error('SVG not found');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
        filename = 'mermaid-diagram.svg';
      } else {
        dataUrl = await (format === 'png' ? 
          htmlToImage.toPng(diagramRef.current) : 
          htmlToImage.toJpeg(diagramRef.current));
        filename = `mermaid-diagram.${format}`;
      }

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      setError(`Failed to download diagram as ${format.toUpperCase()}`);
    }
    setShowDownloadMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full mix-blend-screen filter blur-xl animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                background: `radial-gradient(circle, rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, 255, 0.1) 0%, transparent 70%)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 p-6 sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl rotate-45 transform-gpu transition-transform duration-500 hover:rotate-90"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain size={28} className="text-white transform -rotate-45 transition-transform duration-500 group-hover:rotate-90" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Mermaid AI Flow Generator
            </h1>
            <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
              <Cpu size={14} className="animate-pulse" />
              Powered by Advanced AI
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Input Section */}
        <div className="mb-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black/50 backdrop-blur-xl rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Network size={20} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-white/90">AI Processing Interface</h2>
            </div>
            <textarea
              ref={textareaRef}
              className="w-full h-40 p-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-white placeholder-white/30 transition-all duration-300 ease-in-out"
              placeholder="Describe your diagram requirements here..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
            <button
              className={`mt-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg flex items-center gap-3 font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              onClick={generateDiagram}
              disabled={loading}
            >
              {loading ? (
                <Brain size={24} className="animate-pulse" />
              ) : (
                <Wand2 size={24} />
              )}
              {loading ? 'Neural Processing...' : 'Generate Flow'}
              {loading && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
                </div>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
              <XCircle size={20} />
              {error}
            </div>
          )}
        </div>

        {/* Split View */}
        {(mermaidCode || loading) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Section */}
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg p-6 transition-all duration-500 ease-in-out relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Boxes size={20} className="text-purple-400" />
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Generated Code
                  </h2>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-white/5 rounded-lg group relative transition-all duration-300"
                  title="Copy to clipboard"
                  disabled={!mermaidCode}
                >
                  {copied ? (
                    <CheckCircle2 size={20} className="text-green-400" />
                  ) : (
                    <Copy size={20} className="group-hover:scale-110 transition-transform duration-300" />
                  )}
                </button>
              </div>
              <div className="relative overflow-hidden rounded-lg transition-all duration-300">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                    <div className="h-4 bg-white/5 rounded w-2/3"></div>
                  </div>
                ) : (
                  <SyntaxHighlighter
                    language="markdown"
                    style={atomDark}
                    className="rounded-lg transition-all duration-300 !bg-black/30"
                  >
                    {mermaidCode}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>

            {/* Diagram Section */}
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg p-6 transition-all duration-500 ease-in-out">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Network size={20} className="text-purple-400" />
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Neural Visualization
                  </h2>
                </div>
                <div className="relative" ref={downloadMenuRef}>
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="p-2 hover:bg-white/5 rounded-lg group transition-all duration-300 flex items-center gap-2"
                    title="Download options"
                    disabled={!mermaidCode}
                  >
                    <Download size={20} className="group-hover:scale-110 transition-transform duration-300" />
                    <ChevronDown size={16} className={`transition-transform duration-300 ${showDownloadMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showDownloadMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                      <button
                        onClick={() => downloadDiagram('png')}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors duration-200"
                      >
                        <Image size={16} />
                        PNG Image
                      </button>
                      <button
                        onClick={() => downloadDiagram('jpeg')}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors duration-200"
                      >
                        <Image size={16} />
                        JPEG Image
                      </button>
                      <button
                        onClick={() => downloadDiagram('svg')}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors duration-200"
                      >
                        <FileVector size={16} />
                        SVG Vector
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative min-h-[400px] transition-all duration-300">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Neural Network Animation */}
                      <div className="absolute -inset-16 opacity-30">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-purple-400 rounded-full"
                            style={{
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`,
                              animation: `pulse 2s infinite ${Math.random() * 2}s`,
                            }}
                          >
                            <div
                              className="absolute w-16 h-px bg-gradient-to-r from-purple-400 to-transparent"
                              style={{
                                transform: `rotate(${Math.random() * 360}deg)`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      {/* Processing Rings */}
                      <div className="relative w-32 h-32">
                        <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-2 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-[spin_2s_linear_infinite]" />
                        <div className="absolute inset-4 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-[spin_1s_linear_infinite]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Brain size={32} className="text-purple-400 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    ref={diagramRef}
                    className="bg-white rounded-lg p-6 min-h-[400px] flex items-center justify-center transition-all duration-300"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;