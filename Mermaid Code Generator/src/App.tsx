import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, Copy, Wand2, CheckCircle2, XCircle, UserCircle, Brain, Sparkles } from 'lucide-react';
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
  const diagramRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const downloadDiagram = async () => {
    if (!diagramRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(diagramRef.current);
      const link = document.createElement('a');
      link.download = 'mermaid-diagram.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      setError('Failed to download diagram');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-gray-700/50 p-6 sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Wand2 size={24} className="text-white relative z-10 transform group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Mermaid AI Flow Generator
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Input Section */}
        <div className="mb-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <textarea
              ref={textareaRef}
              className="w-full h-40 p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-white transition-all duration-300 ease-in-out"
              placeholder="Describe your diagram requirements here..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
            <button
              className={`mt-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg flex items-center gap-3 font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 ${
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
              {loading ? 'AI Processing...' : 'Generate Diagram'}
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
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 transition-all duration-500 ease-in-out relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Generated Code
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-700/50 rounded-lg group relative transition-all duration-300"
                  title="Copy to clipboard"
                  disabled={!mermaidCode}
                >
                  {copied ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : (
                    <Copy size={20} className="group-hover:scale-110 transition-transform duration-300" />
                  )}
                </button>
              </div>
              <div className="relative overflow-hidden rounded-lg transition-all duration-300">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
                  </div>
                ) : (
                  <SyntaxHighlighter
                    language="markdown"
                    style={atomDark}
                    className="rounded-lg transition-all duration-300"
                  >
                    {mermaidCode}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>

            {/* Diagram Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 transition-all duration-500 ease-in-out">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Preview
                </h2>
                <button
                  onClick={downloadDiagram}
                  className="p-2 hover:bg-gray-700/50 rounded-lg group transition-all duration-300"
                  title="Download diagram"
                  disabled={!mermaidCode}
                >
                  <Download size={20} className="group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
              <div className="relative min-h-[400px] transition-all duration-300">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Outer Ring */}
                      <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
                      {/* Middle Ring */}
                      <div className="absolute inset-2 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-[spin_2s_linear_infinite]" />
                      {/* Inner Ring */}
                      <div className="absolute inset-4 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-[spin_1s_linear_infinite]" />
                      {/* Center Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain size={32} className="text-purple-400 animate-pulse" />
                      </div>
                      {/* Floating Particles */}
                      <div className="absolute -inset-8">
                        {[...Array(6)].map((_, i) => (
                          <Sparkles
                            key={i}
                            size={16}
                            className={`absolute text-blue-400 animate-ping`}
                            style={{
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`,
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '1.5s',
                            }}
                          />
                        ))}
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