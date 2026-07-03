"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UploadCloud, ArrowRight, Database, TerminalSquare, AlertCircle, History } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Home() {
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [schema, setSchema] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeChartType, setActiveChartType] = useState<string>("bar");
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory.length > 0 || currentQuestion) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, currentQuestion]);

  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setDatasetId(data.dataset_id);
      setSchema(data.columns);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    handleFile(e.target.files[0]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAsk = async (e?: React.FormEvent, overrideQuestion?: string) => {
    if (e) e.preventDefault();
    const q = overrideQuestion || question;
    if (!datasetId || !q.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentQuestion(q);
    const originalQuestion = q;
    setQuestion("");
    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset_id: datasetId, question: q }),
      });
      if (!res.ok) throw new Error("Ask failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const newEntry = { question: originalQuestion, ...data };
      setChatHistory(prev => [...prev, newEntry]);
      if (data.chart) setActiveChartType(data.chart.type);
    } catch (err: any) {
      setError(err.message);
      setQuestion(originalQuestion);
    } finally {
      setLoading(false);
      setCurrentQuestion("");
    }
  };

  const scrollToQuestion = (idx: number) => {
    document.getElementById(`chat-item-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderChart = (result: any) => {
    if (!result || !result.chart || !result.numbers) return null;
    const { chart, numbers } = result;
    const data = Array.isArray(numbers) ? numbers : [];
    
    // Fallback for Scalar
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
           <div className="text-center">
             <div className="text-6xl md:text-8xl font-black font-mono text-neon-green bg-black py-4 px-8 inline-block border-4 border-black transform -rotate-1 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
               {numbers}
             </div>
             <p className="mt-8 font-bold uppercase text-gray-500">Result Value</p>
           </div>
        </div>
      );
    }

    const colors = ["#B6FF3B", "#000000", "#555555"];
    const typeToRender = activeChartType || chart.type;

    if (typeToRender === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey={chart.x} tick={{ fill: '#000', fontSize: 12, fontFamily: 'monospace' }} />
            <YAxis tick={{ fill: '#000', fontSize: 12, fontFamily: 'monospace' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '4px solid #000', borderRadius: 0 }} />
            <Bar dataKey={chart.y} fill="#B6FF3B" stroke="#000" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (typeToRender === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey={chart.x} tick={{ fill: '#000', fontSize: 12, fontFamily: 'monospace' }} />
            <YAxis tick={{ fill: '#000', fontSize: 12, fontFamily: 'monospace' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '4px solid #000', borderRadius: 0 }} />
            <Line type="monotone" dataKey={chart.y} stroke="#B6FF3B" strokeWidth={4} activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (typeToRender === "pie") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey={chart.y} nameKey={chart.x} cx="50%" cy="50%" outerRadius={100} label>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="#000" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '4px solid #000', borderRadius: 0 }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  return (
    <>

      <main className="max-w-6xl mx-auto p-4 w-full flex-1 flex flex-col pt-4 pb-8">
        
        {!datasetId && (
          <section className="flex flex-col items-center justify-start mt-2">
            
            <div className="max-w-3xl w-full brutal-box bg-gray-100 p-6 mb-6 border-dashed text-center">
              <h2 className="text-xl font-black uppercase mb-2 text-black">What is DataWhisper?</h2>
              <p className="text-base font-mono leading-relaxed">
                DataWhisper is an AI-powered data analyst designed for <span className="font-bold bg-neon-green px-1">100% numerical accuracy</span>. 
                Instead of relying on LLMs to "guess" math, DataWhisper reads your CSV, plans a strict Pandas data-processing pipeline, and executes it directly on the backend.
              </p>
            </div>

            <div 
              className={`brutal-box p-8 text-center max-w-xl w-full relative transition-colors ${isDragging ? 'bg-neon-green' : 'bg-white'}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <UploadCloud size={64} className="mx-auto mb-4 text-black drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]" strokeWidth={3} />
              <h2 className="text-3xl font-black mb-2 uppercase">Drop Your CSV</h2>
              <p className="font-mono mb-6 text-base">{isDragging ? 'Drop it here!' : 'We don\'t guess numbers. We compute them.'}</p>
              
              <label className="bg-black text-neon-green px-6 py-3 cursor-pointer inline-flex items-center gap-3 text-xl font-bold uppercase hover:bg-gray-800 transition-colors border-4 border-black">
                Select File
                <input type="file" className="hidden" accept=".csv" onChange={handleUpload} />
              </label>

              {loading && <p className="mt-4 font-mono font-bold animate-pulse text-black">Uploading...</p>}
              {error && <div className="mt-4 font-mono text-red-600 font-bold flex items-center justify-center gap-2"><AlertCircle /> {error}</div>}
            </div>
          </section>
        )}

        {datasetId && (
          <>
            {/* Fixed Pull-out Tab for History (only visible when sidebar is closed) */}
            {!isSidebarOpen && (
              <div className="fixed left-0 top-32 z-50">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-black text-neon-green px-4 py-3 font-bold uppercase border-4 border-l-0 border-black transition-all flex items-center gap-2 hover:translate-x-2 shadow-[4px_4px_0px_rgba(182,255,59,1)]"
                >
                  <History size={24} /> History
                </button>
              </div>
            )}

            {/* Fixed Full-Height Sidebar Drawer */}
            <div className={`fixed left-0 top-0 h-screen w-80 bg-neon-green border-r-8 border-black z-[100] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-[12px_0px_0px_rgba(0,0,0,0.1)]`}>
              <div className="p-4 flex justify-between items-center border-b-8 border-black bg-white">
                <h3 className="font-bold uppercase flex items-center gap-2 text-xl">
                  <History size={24} /> History
                </h3>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="bg-black text-neon-green hover:bg-gray-800 transition-colors p-2 border-4 border-black shadow-[4px_4px_0px_rgba(182,255,59,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_rgba(182,255,59,1)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              {/* Schema Dropdown/Popup Button (Moved outside overflow container) */}
              <div className="p-4 border-b-8 border-black bg-neon-green z-[120]">
                <div className="relative group">
                  <button className="w-full text-left bg-black text-neon-green border-4 border-black p-3 font-mono text-sm uppercase font-bold flex items-center gap-2 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
                    <Database size={20} /> View Schema
                  </button>
                  
                  {/* Floating Schema Panel (visible on hover) */}
                  <div className="absolute left-0 md:left-[105%] top-full md:top-0 mt-2 md:mt-0 hidden group-hover:block w-[75vw] md:w-72 bg-white border-8 border-black shadow-[12px_12px_0px_rgba(182,255,59,1)] z-[110] p-4 max-h-[70vh] overflow-y-auto">
                    <h4 className="font-bold uppercase mb-4 text-lg border-b-4 border-black pb-2 flex items-center gap-2">
                      <Database size={20} /> Schema
                    </h4>
                    <div className="space-y-2">
                      {schema.map((col, idx) => (
                        <div key={idx} className="bg-white border-4 border-black p-2 font-mono text-sm flex justify-between shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                          <span className="font-bold truncate mr-2" title={col.name}>{col.name}</span>
                          <span className="text-gray-500 whitespace-nowrap">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">

                {/* Chat History List */}
                {chatHistory.length > 0 ? (
                  <div>
                    <h3 className="font-mono text-sm uppercase text-black font-bold mb-3 px-1">Recents</h3>
                    <div className="space-y-3">
                      {chatHistory.map((h, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            scrollToQuestion(idx);
                            // On mobile, close sidebar after clicking a history item
                            if (window.innerWidth < 768) setIsSidebarOpen(false);
                          }}
                          className="w-full text-left bg-white border-4 border-black p-3 font-mono text-xs uppercase font-bold hover:bg-black hover:text-white transition-colors truncate shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5"
                        >
                          Q{idx + 1}: {h.question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 font-mono text-sm font-bold text-gray-700 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    No history yet.<br/>Ask a question!
                  </div>
                )}

              </div>
            </div>

            <section className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
              <div className="max-w-4xl mx-auto w-full space-y-12">
              

                
                {chatHistory.map((result, idx) => (
                  <section id={`chat-item-${idx}`} key={idx} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-b-8 border-black pb-12">
                    
                    {/* User Question */}
                    <div className="brutal-box p-6 bg-gray-100 border-dashed border-gray-400 text-black">
                      <h3 className="font-mono text-sm uppercase text-gray-500 font-bold mb-2">You asked:</h3>
                      <p className="text-2xl font-bold uppercase">{result.question}</p>
                    </div>

                    <div className="border-4 border-black p-8 bg-black text-white shadow-[8px_8px_0px_rgba(182,255,59,1)] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_rgba(182,255,59,1)]">
                      <h2 className="text-2xl font-black mb-4 uppercase text-neon-green">Answer</h2>
                      <p className="text-2xl md:text-3xl leading-tight font-sans">
                        {result.answer}
                      </p>
                    </div>

                    {result.chart && (
                      <div className="brutal-box p-6 bg-white overflow-hidden">
                        <h3 className="font-bold uppercase text-xl mb-6 border-b-4 border-black pb-2 flex justify-between items-center">
                          <span>Visualization</span>
                          <div className="flex gap-2">
                            {['bar', 'line', 'pie'].map(t => (
                              <button 
                                key={t}
                                onClick={() => setActiveChartType(t)}
                                className={`px-3 py-1 text-sm font-bold border-2 border-black transition-colors ${activeChartType === t ? 'bg-black text-neon-green' : 'bg-white text-black hover:bg-gray-200'}`}
                              >
                                {t.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </h3>
                        <div className="w-full">
                          {renderChart(result)}
                        </div>
                      </div>
                    )}

                    <div className="brutal-box p-6 bg-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-stripes opacity-20 -mr-16 -mt-16 rounded-full blur-xl"></div>
                      <h3 className="font-bold uppercase flex items-center gap-2 mb-4 text-xl border-b-4 border-black pb-2">
                        <TerminalSquare size={24} /> How this was computed
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-mono font-bold text-sm text-gray-500 uppercase mb-2">Operation Plan</h4>
                          <pre className="bg-black text-neon-green p-4 font-mono text-xs border-2 border-black overflow-x-auto h-48">
                            {JSON.stringify(result.plan, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-mono font-bold text-sm text-gray-500 uppercase mb-2">Execution Log</h4>
                          <div className="space-y-4 h-48 overflow-y-auto pr-2">
                            <div className="bg-white p-3 border-2 border-black font-mono text-sm">
                              <span className="font-bold text-blue-600">Pandas Operation:</span><br/>
                              {result.operation}
                            </div>
                            <div className="bg-white p-3 border-2 border-black font-mono text-sm">
                              <span className="font-bold text-green-600">Columns Used:</span><br/>
                              {result.columns_used?.join(", ")}
                            </div>
                            <div className="bg-white p-3 border-2 border-black font-mono text-sm">
                              <span className="font-bold text-purple-600">Raw Data (from Backend):</span><br/>
                              <div className="max-h-20 overflow-y-auto mt-2">
                                {JSON.stringify(result.numbers, null, 2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Follow ups - only render if this is the very last message */}
                    {idx === chatHistory.length - 1 && result.follow_ups && result.follow_ups.length > 0 && (
                      <div className="brutal-box p-6 bg-white border-dashed">
                        <h3 className="font-bold uppercase mb-4 text-sm text-gray-600">Suggested Follow-ups</h3>
                        <div className="flex flex-wrap gap-3">
                          {result.follow_ups.map((q: string, qidx: number) => (
                            <button
                              key={qidx}
                              onClick={() => handleAsk(undefined, q)}
                              className="bg-gray-100 hover:bg-neon-green border-2 border-black px-4 py-2 font-mono text-sm font-bold transition-colors text-left"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                ))}

                {/* Optimistic Loading UI */}
                {loading && currentQuestion && (
                  <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-b-8 border-black pb-12">
                    <div className="brutal-box p-6 bg-gray-100 border-dashed border-gray-400 text-black">
                      <h3 className="font-mono text-sm uppercase text-gray-500 font-bold mb-2">You asked:</h3>
                      <p className="text-2xl font-bold uppercase">{currentQuestion}</p>
                    </div>

                    <div className="border-4 border-black p-8 bg-black text-white shadow-[8px_8px_0px_rgba(182,255,59,1)]">
                      <h2 className="text-2xl font-black mb-4 uppercase text-neon-green flex items-center gap-4">
                        Thinking
                        <span className="flex gap-2">
                          <div className="w-3 h-3 bg-neon-green rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-neon-green rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-3 h-3 bg-neon-green rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </span>
                      </h2>
                      <div className="space-y-3 mt-6">
                        <div className="h-6 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                        <div className="h-6 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Input Form at the bottom */}
                <div ref={bottomRef} className="sticky bottom-6 z-50 pt-8">
                  {error && (
                    <div className="brutal-box p-4 mb-4 bg-red-400 border-red-900 flex items-center gap-4">
                      <AlertCircle size={24} />
                      <span className="font-mono font-bold">{error}</span>
                    </div>
                  )}

                  <form id="ask-form" onSubmit={handleAsk} className="brutal-box flex flex-col sm:flex-row shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
                    <input 
                      type="text" 
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything about your data..."
                      className="flex-1 min-w-0 p-6 text-xl md:text-2xl font-bold brutal-input uppercase border-none placeholder:text-gray-400 bg-white"
                      disabled={loading}
                    />
                    <button 
                      type="submit"
                      disabled={loading || !question}
                      className="bg-black text-neon-green px-8 py-6 font-bold uppercase text-2xl border-l-4 border-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? "Wait..." : (
                        <>Ask <ArrowRight strokeWidth={4} /></>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

    </>
  );
}
