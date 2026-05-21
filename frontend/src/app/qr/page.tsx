"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ScanLine, ImageIcon, Trash2, Loader2, Download, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { MathGame } from '@/components/MathGame';
import { generateQR, decodeQR } from '@/lib/api';

export default function QRPage() {
    const [qrTab, setQrTab] = useState<'generate' | 'scan'>('generate');
    const [qrInput, setQrInput] = useState('');
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [qrResult, setQrResult] = useState<{ blob?: Blob; text?: string; error?: string } | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    const handleGenerateQR = async () => {
        setQrLoading(true);
        setQrResult(null);
        try {
            const res = await generateQR(qrInput, qrFile || undefined);
            const blob = new Blob([res.data], { type: 'image/png' });
            setQrResult({ blob });
        } catch (e: any) {
            let errMsg = 'QR generation failed.';
            if (e.response?.data) {
                try {
                    const text = await e.response.data.text?.();
                    const parsed = JSON.parse(text);
                    errMsg = parsed.detail || errMsg;
                } catch { /* ignore */ }
            }
            setQrResult({ error: errMsg });
        }
        setQrLoading(false);
    };

    const handleDecodeQR = async (file: File) => {
        setQrLoading(true);
        setQrResult(null);
        try {
            const res = await decodeQR(file);
            setQrResult({ text: res.data.decoded_text });
        } catch (e: any) {
            let errMsg = 'QR decoding failed.';
            if (e.response?.data?.detail) {
                errMsg = e.response.data.detail;
            }
            setQrResult({ error: errMsg });
        }
        setQrLoading(false);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-500">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16 text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                        QR Code <span className="text-black/20 dark:text-white/20">Toolkit</span>
                    </h1>
                    <p className="text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto leading-relaxed font-medium">
                        Instantly generate branded QR codes or scan and decode image-based codes with precision.
                    </p>
                </motion.div>

                <Card className="border border-black/10 dark:border-white/10 shadow-2xl bg-white dark:bg-black rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-0">
                        {/* Tabs */}
                        <div className="flex border-b border-black/10 dark:border-white/10">
                            <button
                                onClick={() => { setQrTab('generate'); setQrResult(null); }}
                                className={`flex-1 flex items-center justify-center gap-3 py-6 text-sm font-black tracking-widest uppercase transition-all ${qrTab === 'generate'
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <QrCode size={20} /> Generate
                            </button>
                            <button
                                onClick={() => { setQrTab('scan'); setQrResult(null); }}
                                className={`flex-1 flex items-center justify-center gap-3 py-6 text-sm font-black tracking-widest uppercase transition-all ${qrTab === 'scan'
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <ScanLine size={20} /> Scan
                            </button>
                        </div>

                        <div className="p-8 md:p-12">
                            <AnimatePresence mode="wait">
                                {qrTab === 'generate' ? (
                                    <motion.div key="generate" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase ml-1">Content (Text or URL)</label>
                                            <input
                                                type="text"
                                                value={qrInput}
                                                onChange={(e) => setQrInput(e.target.value)}
                                                placeholder="https://assetzen.ai or a message..."
                                                className="w-full h-16 px-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-lg font-medium placeholder:text-black/20 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase ml-1">Logo Overlay (Optional)</label>
                                            <div
                                                onClick={() => document.getElementById('qr-file-input')?.click()}
                                                className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                                            >
                                                <input
                                                    id="qr-file-input"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files?.[0] && setQrFile(e.target.files[0])}
                                                />
                                                {qrFile ? (
                                                    <div className="flex items-center justify-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg">
                                                            <ImageIcon size={24} />
                                                        </div>
                                                        <span className="font-bold truncate max-w-[200px] text-lg">{qrFile.name}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); setQrFile(null); }} className="p-2 text-black/30 dark:text-white/30 hover:text-red-500 transition-colors">
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-black/20 dark:text-white/20 group-hover:scale-110 transition-transform">
                                                            <ImageIcon size={24} />
                                                        </div>
                                                        <p className="text-black/40 dark:text-white/40 font-bold">Embed a logo in the center</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            size="lg"
                                            disabled={(!qrInput && !qrFile) || qrLoading}
                                            onClick={handleGenerateQR}
                                            className="w-full h-20 text-xl font-black rounded-2xl bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black shadow-2xl active:scale-[0.98] transition-all"
                                        >
                                            {qrLoading ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Igniting Engine...</> : <><QrCode className="mr-3" size={24} /> Generate QR</>}
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="scan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase ml-1">Upload QR</label>
                                            <div
                                                onClick={() => document.getElementById('qr-scan-input')?.click()}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    if (e.dataTransfer.files?.[0]) handleDecodeQR(e.dataTransfer.files[0]);
                                                }}
                                                className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] p-16 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all flex flex-col items-center justify-center min-h-[300px] group shadow-inner"
                                            >
                                                <input
                                                    id="qr-scan-input"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files?.[0] && handleDecodeQR(e.target.files[0])}
                                                />
                                                <div className="w-20 h-20 rounded-3xl bg-black/5 dark:bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                                    <ScanLine className="w-10 h-10 text-black/30 dark:text-white/30" />
                                                </div>
                                                <h3 className="text-2xl font-black mb-2">Drop your QR code here</h3>
                                                <p className="text-black/40 dark:text-white/40 font-bold max-w-xs mx-auto">Instantly decode any QR code from an image file.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Loading State with Mini-game */}
                            <AnimatePresence>
                                {qrLoading && (
                                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="mt-12">
                                        <div className="flex items-center gap-3 mb-6 bg-black/5 dark:bg-white/5 p-4 rounded-2xl w-fit">
                                            <Loader2 className="h-5 w-5 animate-spin text-black/50 dark:text-white/50" />
                                            <span className="text-sm font-black text-black/50 dark:text-white/50 tracking-widest uppercase">Processing Request...</span>
                                        </div>
                                        <MathGame />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* QR Result */}
                            <AnimatePresence>
                                {qrResult && (
                                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="mt-12 pt-12 border-t border-black/10 dark:border-white/10">
                                        {qrResult.error ? (
                                            <div className="bg-red-500/5 p-8 rounded-3xl border border-red-500/10 text-center">
                                                <p className="text-red-500 font-black text-lg">{qrResult.error}</p>
                                            </div>
                                        ) : qrResult.blob ? (
                                            <div className="flex flex-col items-center gap-10">
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="bg-white p-8 rounded-[2rem] shadow-2xl border border-black/5"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(qrResult.blob)}
                                                        alt="Generated QR"
                                                        className="w-72 h-72 object-contain"
                                                    />
                                                </motion.div>
                                                <Button
                                                    size="lg"
                                                    className="h-16 px-10 rounded-2xl font-black shadow-2xl bg-black hover:bg-black/80 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 active:scale-95 transition-all text-lg"
                                                    onClick={() => {
                                                        const url = URL.createObjectURL(qrResult.blob!);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = 'qrcode.png';
                                                        a.click();
                                                    }}
                                                >
                                                    <Download size={24} className="mr-3" /> Download High-Res
                                                </Button>
                                            </div>
                                        ) : qrResult.text ? (
                                            <div className="space-y-8">
                                                <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[2rem] p-10 shadow-inner">
                                                    <p className="text-xs font-black tracking-widest text-black/30 dark:text-white/30 uppercase mb-4">Decoded Result</p>
                                                    <p className="text-2xl font-black break-all leading-tight tracking-tight">{qrResult.text}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-4">
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        className="h-16 flex-1 rounded-2xl font-black border-black/20 dark:border-white/20 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-lg"
                                                        onClick={() => { navigator.clipboard.writeText(qrResult.text!); alert('Copied to clipboard!'); }}
                                                    >
                                                        <Copy size={20} className="mr-3" /> Copy Content
                                                    </Button>
                                                    {(qrResult.text.startsWith('http://') || qrResult.text.startsWith('https://')) && (
                                                        <Button
                                                            variant="outline"
                                                            size="lg"
                                                            className="h-16 flex-1 rounded-2xl font-black border-black/20 dark:border-white/20 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-lg"
                                                            onClick={() => window.open(qrResult.text!, '_blank')}
                                                        >
                                                            <ExternalLink size={20} className="mr-3" /> Visit Endpoint
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
