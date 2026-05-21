"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { UploadCloud, CheckCircle, Download, Link as LinkIcon, Image as ImageIcon, Video, Loader2, Trash2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { processImage, processVideo } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { MathGame } from '@/components/MathGame';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [actions, setActions] = useState<string[]>(["Compress"]);
  const [targetSizeKb, setTargetSizeKb] = useState(20);
  const [targetFormat, setTargetFormat] = useState("Original");
  const [videoCompLevel, setVideoCompLevel] = useState("Medium");

  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [results, setResults] = useState<{ file: File, url?: string, blob?: Blob, oldSize: number, newSize?: number, name: string, error?: string }[]>([]);

  const heroRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    gsap.fromTo(heroRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setResults([]);
    setGlobalProgress(0);

    let completed = 0;
    const total = files.length;

    const processOne = async (file: File, index: number) => {
      const isVideo = file.type.startsWith('video');

      try {
        let res;
        if (isVideo) {
          if (actions.includes("Compress")) {
            res = await processVideo(file, videoCompLevel, (p) => { });
            const blob = new Blob([res.data], { type: 'video/mp4' });
            return { file, blob, oldSize: file.size, newSize: blob.size, name: `compressed_${file.name}` };
          } else {
            return { file, oldSize: file.size, name: file.name, error: "Videos only support compression." };
          }
        } else {
          res = await processImage(file, actions.join(","), targetSizeKb, targetFormat, () => { });

          if (actions.includes("Convert to URL")) {
            return { file, url: res.data.url, oldSize: file.size, name: res.data.filename };
          } else {
            const blob = new Blob([res.data]);
            let finalExt = file.name.split('.').pop() || "jpg";
            const isBg = actions.includes("Remove Background") || actions.includes("All-in-One (BG + Compress + Convert)");
            const isConvert = actions.includes("Convert Format") || actions.includes("All-in-One (BG + Compress + Convert)");

            if (isBg) finalExt = "png";
            if (isConvert && targetFormat !== "Original") {
              const fmtMap: Record<string, string> = { "WebP": "webp", "AVIF": "avif", "PNG": "png", "JPG": "jpg" };
              finalExt = fmtMap[targetFormat] || finalExt;
            }

            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const fileName = `opti_${baseName}.${finalExt}`;
            return { file, blob, oldSize: file.size, newSize: blob.size, name: fileName };
          }
        }
      } catch (e: any) {
        console.error(e);
        let errMsg = "Processing failed.";
        return { file, oldSize: file.size, name: file.name, error: errMsg };
      } finally {
        completed++;
        setGlobalProgress((completed / total) * 100);
      }
    };

    const promises = files.map((file, i) => processOne(file, i));
    const settled = await Promise.allSettled(promises);

    const processedFiles = settled.map((result) => {
      if (result.status === 'fulfilled') return result.value;
      return { file: new File([], 'unknown'), oldSize: 0, name: 'unknown', error: 'Unexpected error' };
    });

    setResults(processedFiles);
    setIsProcessing(false);
    setGlobalProgress(100);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-500">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24 lg:pt-40">
        <div ref={heroRef} className="mb-20">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.95]">
            Media toolkit,<br />
            <span className="text-black/20 dark:text-white/20">reimagined.</span>
          </h2>
          <p className="text-xl md:text-2xl text-black/60 dark:text-white/60 max-w-2xl leading-relaxed font-medium">
            The pristine toolkit to compress, convert, and cleanly strip backgrounds from your media autonomously.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="lg:col-span-4 space-y-8">
            <Card className="border border-black/10 dark:border-white/10 shadow-2xl bg-white dark:bg-black rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-10">
                <div className="space-y-6">
                  <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase ml-1">Optimization Layer</label>
                  <div className="grid grid-cols-1 gap-3">
                    {["Compress", "Convert Format", "Remove Background", "Convert to URL"].map((a) => (
                      <Button
                        key={a}
                        variant="outline"
                        onClick={() =>
                          setActions(prev =>
                            prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
                          )
                        }
                        className={`h-14 text-sm font-black tracking-wider transition-all border-2 rounded-2xl ${actions.includes(a)
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xl'
                          : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                      >
                        {a}
                      </Button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {actions.includes("Compress") && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-8 overflow-hidden pt-4 border-t border-black/5 dark:border-white/5">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Target Density</label>
                          <span className="text-sm font-black bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full shadow-lg">{targetSizeKb}KB</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={500}
                          value={targetSizeKb}
                          onChange={(e) => setTargetSizeKb(parseInt(e.target.value))}
                          className="w-full h-2.5 bg-black/5 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-black dark:accent-white"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase ml-1">Video Precision</label>
                        <Select value={videoCompLevel} onValueChange={(v) => v && setVideoCompLevel(v)}>
                          <SelectTrigger className="w-full h-14 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border-2 border-black/5 dark:border-white/5 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-black/10 dark:border-white/10 bg-white dark:bg-black">
                            <SelectItem value="Low">Low (CRF 28)</SelectItem>
                            <SelectItem value="Medium">Medium (CRF 23)</SelectItem>
                            <SelectItem value="High">High (CRF 18)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                  <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase ml-1">Export Format</label>
                  <Select value={targetFormat} onValueChange={(v) => v && setTargetFormat(v)} disabled={!actions.includes("Convert Format")}>
                    <SelectTrigger className="w-full h-14 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border-2 border-black/5 dark:border-white/5 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-black/10 dark:border-white/10 bg-white dark:bg-black">
                      {["Original", "WebP", "AVIF", "PNG", "JPG"].map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upload & Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="lg:col-span-8 flex flex-col gap-8">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('hidden-file-input')?.click()}
              className="relative group border-2 border-dashed border-black/10 dark:border-white/10 rounded-[3rem] bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-700 p-16 text-center flex flex-col items-center justify-center min-h-[450px] cursor-pointer shadow-inner"
            >
              <input id="hidden-file-input" type="file" multiple className="hidden" onChange={(e) => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])} />

              <div className="w-28 h-28 rounded-[2.5rem] bg-black dark:bg-white shadow-2xl flex items-center justify-center mb-10 group-hover:-translate-y-5 transition-transform duration-700">
                <UploadCloud className="w-12 h-12 text-white dark:text-black" />
              </div>

              <h3 className="text-3xl font-black mb-4">Ingest Media</h3>
              <p className="text-black/40 dark:text-white/40 font-bold text-xl max-w-sm">Images & MP4 Videos automatically queued.</p>

              {files.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-3 justify-center px-4 w-full">
                  {files.map((f, i) => (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} key={i} className="px-6 py-4 bg-white dark:bg-black shadow-xl border border-black/5 dark:border-white/5 rounded-2xl text-sm font-black flex items-center gap-4 hover:scale-105 transition-transform">
                      <span className="truncate max-w-[180px]">{f.name}</span>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFiles(files.filter((_, idx) => idx !== i)); }} className="text-black/20 dark:text-white/20 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <Button size="lg" disabled={files.length === 0 || isProcessing} onClick={handleProcess} className="w-full h-24 text-2xl font-black rounded-[2rem] bg-black dark:bg-white hover:opacity-90 text-white dark:text-black shadow-2xl active:scale-[0.98] transition-all relative overflow-hidden group">
              <span className="relative z-10 flex items-center justify-center tracking-tighter">
                {isProcessing ? <><Loader2 className="mr-4 h-8 w-8 animate-spin" /> Engine Running ({Math.round(globalProgress)}%)</> : "Ignite Optimization Engine"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>

            {/* Results */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="space-y-8">
                  <div className="p-8 bg-black/[0.02] dark:bg-white/[0.02] rounded-[2.5rem] border-2 border-black/5 dark:border-white/5">
                    <div className="flex justify-between text-sm font-black tracking-widest uppercase mb-4 text-black/40 dark:text-white/40">
                      <span>Syncing {files.length} Assets</span>
                      <span>{Math.round(globalProgress)}%</span>
                    </div>
                    <Progress value={globalProgress} className="h-4 bg-black/5 dark:bg-white/10 rounded-full [&>div]:bg-black dark:[&>div]:bg-white shadow-inner" />
                  </div>
                  <MathGame />
                </motion.div>
              )}
            </AnimatePresence>

            {results.length > 0 && (
              <div className="space-y-8 mt-4">
                <h3 className="text-4xl font-black tracking-tighter">Output Assets</h3>
                <div className="grid gap-6">
                  {results.map((res, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                      <Card className="p-8 border border-black/10 dark:border-white/10 shadow-2xl bg-white dark:bg-black rounded-[2rem] hover:border-black dark:hover:border-white transition-all group">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="w-20 h-20 shrink-0 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
                            {(res.blob || res.url) && !res.file.type.startsWith('video') ? <img src={res.blob ? URL.createObjectURL(res.blob) : res.url!} className="w-full h-full object-cover" alt="thumb" /> : <CheckCircle size={32} className="text-black/20 dark:text-white/20" />}
                          </div>
                          <div className="flex-1 min-w-0 text-center md:text-left">
                            <p className="font-black text-xl truncate mb-3">{res.name}</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                              <span className="bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-xl text-xs font-bold border border-black/5 dark:border-white/5">{(res.oldSize / 1024).toFixed(1)}KB</span>
                              {res.newSize && <><span className="text-black/20">→</span><span className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-xl text-xs font-black">{(res.newSize / 1024).toFixed(1)}KB</span></>}
                            </div>
                          </div>
                          <div className="shrink-0 flex gap-4 w-full md:w-auto">
                            {res.blob ? (
                              <Button size="lg" className="flex-1 md:flex-none h-14 px-8 rounded-2xl font-black bg-black dark:bg-white text-white dark:text-black shadow-xl" onClick={() => {
                                const url = URL.createObjectURL(res.blob!);
                                const a = document.createElement('a'); a.href = url; a.download = res.name; a.click();
                              }}>
                                <Download className="mr-2" size={20} /> Export
                              </Button>
                            ) : res.url && (
                              <Button variant="outline" size="lg" className="flex-1 md:flex-none h-14 px-8 rounded-2xl font-black border-2 border-black/10" onClick={() => { navigator.clipboard.writeText(res.url!); alert("URL Copied!"); }}>
                                <LinkIcon className="mr-2" size={20} /> Copy URL
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
