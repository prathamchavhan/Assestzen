"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { UploadCloud, CheckCircle, Download, Link as LinkIcon, Image as ImageIcon, Video, Loader2, Trash2, Moon, Sun, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { processImage, processVideo } from '@/lib/api';
import { useTheme } from 'next-themes';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [actions, setActions] = useState<string[]>(["Compress"]);
  const [targetSizeKb, setTargetSizeKb] = useState(20);
  const [targetFormat, setTargetFormat] = useState("Original");
  const [videoCompLevel, setVideoCompLevel] = useState("Medium");

  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [results, setResults] = useState<{ file: File, url?: string, blob?: Blob, oldSize: number, newSize?: number, name: string, error?: string }[]>([]);

  const headerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setResults([]);
    let processedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video');

      try {
        let res;
        if (isVideo) {
          if (actions.includes("Compress")) {
            res = await processVideo(file, videoCompLevel, (p) => setGlobalProgress((i / files.length) * 100 + (p / files.length)));
            const blob = new Blob([res.data], { type: 'video/mp4' });
            processedFiles.push({ file, blob, oldSize: file.size, newSize: blob.size, name: `compressed_${file.name}` });
          } else {
            processedFiles.push({ file, oldSize: file.size, name: file.name, error: "Videos only support compression." });
          }
        } else {
          res = await processImage(file, actions.join(","), targetSizeKb, targetFormat, (p) => setGlobalProgress((i / files.length) * 100 + (p / files.length)));

          if (actions.includes("Convert to URL")) {
            processedFiles.push({ file, url: res.data.url, oldSize: file.size, name: res.data.filename });
          } else {
            const blob = new Blob([res.data]);

            let finalExt = file.name.split('.').pop() || "jpg";
            const isBg = actions.includes("Remove Background") || actions.includes("All-in-One (BG + Compress + Convert)");
            const isConvert = actions.includes("Convert Format") || actions.includes("All-in-One (BG + Compress + Convert)");

            if (isBg) {
              finalExt = "png";
            }
            if (isConvert && targetFormat !== "Original") {
              const fmtMap: Record<string, string> = { "WebP": "webp", "AVIF": "avif", "PNG": "png", "JPG": "jpg" };
              finalExt = fmtMap[targetFormat] || finalExt;
            }

            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const fileName = `opti_${baseName}.${finalExt}`;

            processedFiles.push({ file, blob, oldSize: file.size, newSize: blob.size, name: fileName });
          }
        }
      } catch (e: any) {
        console.error(e);
        let errMsg = "Processing failed. Check API.";
        if (e.response && e.response.data && e.response.data.detail) {
          errMsg = `API Error: ${e.response.data.detail}`;
        }
        if (e.response && e.response.data && e.response.data.trace) {
          console.error("Backend Trace:", e.response.data.trace);
          // Show the last line of the python stack trace
          const lines = e.response.data.trace.trim().split('\n');
          errMsg = lines[lines.length - 1].substring(0, 100);
        }
        processedFiles.push({ file, oldSize: file.size, name: file.name, error: errMsg });
      }
      setGlobalProgress(((i + 1) / files.length) * 100);
    }

    setResults(processedFiles);
    setIsProcessing(false);
    setGlobalProgress(100);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-500">
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-24">

        <header ref={headerRef} className="flex justify-between items-center mb-16 opacity-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md">
              <MonitorPlay size={24} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Assestzen</h1>
          </div>

          {mounted && (
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          )}
        </header>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-16">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
            Media optimization,<br />reimagined.
          </h2>
          <p className="text-xl md:text-2xl text-black/60 dark:text-white/60 max-w-2xl leading-relaxed font-medium">
            The pristine toolkit to compress, convert, and cleanly strip backgrounds from your media autonomously.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="lg:col-span-4 space-y-6">
            <Card className="border border-black/10 dark:border-white/10 shadow-xl bg-white dark:bg-black rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">

                <div className="space-y-4">
                  <label className="text-xs font-bold tracking-widest text-black/50 dark:text-white uppercase">Optimization Actions</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["Compress", "Convert Format", "Remove Background", "Convert to URL"].map((a) => (
                      <Button
                        key={a}
                        variant="outline"
                        onClick={() =>
                          setActions(prev =>
                            prev.includes(a)
                              ? prev.filter(x => x !== a)
                              : [...prev, a]
                          )
                        }
                        className={`h-12 text-xs font-bold tracking-wider transition-all border shadow-sm rounded-none ${actions.includes(a)
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                          : 'border-black/20 dark:border-white/20 bg-transparent text-black/60 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                      >
                        {a}
                      </Button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {(actions.includes("Compress")) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
                      <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold tracking-widest text-black/50 dark:text-white/50 uppercase">Image Target (KB)</label>
                          <span className="text-sm font-bold bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">{targetSizeKb} KB</span>
                        </div>
                        <div className="pt-2 pb-4">
                          <input
                            type="range"
                            min={1}
                            max={500}
                            value={targetSizeKb}
                            onChange={(e) => setTargetSizeKb(parseInt(e.target.value))}
                            className="w-full h-2 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
                        <label className="text-xs font-bold tracking-widest text-black/50 dark:text-white/50 uppercase">Video Encoding</label>
                        <Select value={videoCompLevel} onValueChange={(v) => v && setVideoCompLevel(v)}>
                          <SelectTrigger className="w-full h-12 bg-transparent rounded-xl border-black/20 dark:border-white/20 focus:ring-black dark:focus:ring-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white">
                            <SelectItem value="Low">Low (CRF 28, Fast)</SelectItem>
                            <SelectItem value="Medium">Medium (CRF 23)</SelectItem>
                            <SelectItem value="High">High (CRF 18, Slower)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
                  <label className="text-xs font-bold tracking-widest text-black/50 dark:text-white/50 uppercase">Image Output</label>
                  <Select value={targetFormat} onValueChange={(v) => v && setTargetFormat(v)} disabled={!actions.includes("Convert Format")}>
                    <SelectTrigger className="w-full h-12 bg-transparent rounded-xl border-black/20 dark:border-white/20 focus:ring-black dark:focus:ring-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white">
                      <SelectItem value="Original">Original</SelectItem>
                      <SelectItem value="WebP">WebP</SelectItem>
                      <SelectItem value="AVIF">AVIF</SelectItem>
                      <SelectItem value="PNG">PNG</SelectItem>
                      <SelectItem value="JPG">JPG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="lg:col-span-8 flex flex-col gap-6">

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative group border-2 border-dashed border-black/20 dark:border-white/20 rounded-[2rem] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-500 p-12 text-center flex flex-col items-center justify-center min-h-[380px] cursor-pointer"
            >
              <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} />

              <div className="w-24 h-24 rounded-3xl bg-black dark:bg-white shadow-xl flex items-center justify-center mb-8 group-hover:-translate-y-3 transition-transform duration-500 border border-black/10 dark:border-white/10">
                <UploadCloud className="w-10 h-10 text-white dark:text-black" />
              </div>

              <h3 className="text-2xl font-bold mb-3">Drop your files here</h3>
              <p className="text-black/50 dark:text-white/50 font-medium text-lg max-w-sm">Images & MP4 Videos automatically parsed and queued.</p>

              {files.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-3 justify-center px-4 w-full">
                  {files.map((f, i) => (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key={i} className="px-5 py-3 pr-4 bg-white dark:bg-black shadow-sm border border-black/10 dark:border-white/10 rounded-xl text-sm font-semibold inline-flex items-center gap-3 relative z-10 transition-transform hover:scale-105">
                      {f.type.startsWith('video') ? <Video strokeWidth={2.5} size={18} /> : <ImageIcon strokeWidth={2.5} size={18} />}
                      <span className="truncate max-w-[140px] tracking-tight">{f.name}</span>
                      <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFiles(files.filter((_, idx) => idx !== i)); }} className="text-black/40 dark:text-white/40 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="w-full h-20 text-xl font-bold rounded-[1.5rem] bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black shadow-2xl active:scale-[0.98] transition-all relative overflow-hidden group border border-transparent">
              <span className="relative z-10 flex items-center justify-center tracking-wide">
                {isProcessing ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Generating Magic ({Math.round(globalProgress)}%)</> : "✨ Ignite Engine"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 dark:from-black/0 dark:via-black/20 dark:to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>

            <AnimatePresence>
              {isProcessing && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="space-y-4 py-8 px-6 bg-white dark:bg-black rounded-3xl shadow-sm border border-black/10 dark:border-white/10">
                    <div className="flex justify-between text-sm font-bold tracking-widest uppercase text-black/60 dark:text-white/60"><span>Working magic...</span><span>{Math.round(globalProgress)}%</span></div>
                    <Progress value={globalProgress} className="h-4 bg-black/10 dark:bg-white/10 rounded-full [&>div]:bg-black dark:[&>div]:bg-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {results.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mt-6">
                <h3 className="text-3xl font-black tracking-tight mb-8">Optimization Results</h3>
                <div className="grid gap-5">
                  {results.map((res, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                      <Card className="overflow-hidden border border-black/10 dark:border-white/10 shadow-xl bg-white dark:bg-black rounded-2xl hover:border-black/30 dark:hover:border-white/30 transition-colors text-black dark:text-white">
                        <div className="flex flex-col p-6 gap-6">
                          <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-inner ${res.error ? 'bg-black/5 dark:bg-white/10 text-red-500 border border-black/10 dark:border-white/10' : 'bg-black dark:bg-white text-white dark:text-black border border-black/10 dark:border-white/10 overflow-hidden'}`}>
                              {res.error ? <Trash2 size={24} /> : ((res.blob || res.url) && !res.file.type.startsWith('video') ? <img src={res.blob ? window.URL.createObjectURL(res.blob) : res.url!} className="w-full h-full object-cover" alt="thumb" /> : <CheckCircle size={28} className="drop-shadow-sm" />)}
                            </div>
                            <div className="flex-1 min-w-0 text-center sm:text-left">
                              <p className="font-extrabold text-lg truncate mb-2">{res.name}</p>
                              {res.error ? (
                                <p className="text-sm text-red-500 font-bold bg-red-50 dark:bg-red-950/50 inline-block px-3 py-1 rounded-lg">{res.error}</p>
                              ) : (
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm font-semibold">
                                  <span className="bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10">{(res.oldSize / 1024).toFixed(1)} KB</span>
                                  {res.newSize && (
                                    <>
                                      <span className="text-black/30 dark:text-white/30">→</span>
                                      <span className="bg-black/10 dark:bg-white/20 text-black dark:text-white px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10">{(res.newSize / 1024).toFixed(1)} KB</span>
                                      <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg text-xs font-black shadow-md tracking-wider">
                                        -{(100 - (res.newSize / res.oldSize) * 100).toFixed(1)}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto shrink-0 mt-6 sm:mt-0">
                              {res.url ? (
                                <Button size="lg" className="w-full sm:w-auto rounded-xl font-bold bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white shadow-sm hover:bg-black/5 dark:hover:bg-white/10" onClick={() => { navigator.clipboard.writeText(res.url!); alert("URL Copied to clipboard!"); }}>
                                  <LinkIcon size={18} className="mr-2" /> Copy URL
                                </Button>
                              ) : res.blob ? (
                                <Button size="lg" className="w-full sm:w-auto rounded-xl font-bold shadow-md bg-black hover:bg-black/80 text-white dark:bg-white dark:text-black dark:hover:bg-white/90" onClick={() => {
                                  const url = window.URL.createObjectURL(res.blob!);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = res.name;
                                  a.click();
                                }}>
                                  <Download size={18} className="mr-2" /> Download
                                </Button>
                              ) : null}
                            </div>
                          </div>
                          {(res.blob || res.url) && !res.file.type.startsWith('video') && (
                            <div className="w-full flex justify-center bg-black/5 dark:bg-white/5 rounded-xl p-4 mt-2 border border-black/10 dark:border-white/10 relative group">
                              <img src={res.blob ? window.URL.createObjectURL(res.blob!) : res.url!} alt="Processed preview" className="max-h-96 object-contain rounded-lg shadow-sm" />
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      </main>
    </div>
  );
}
