"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe,
    Clock,
    Activity,
    Plus,
    Trash2,
    Play,
    Square,
    ArrowLeft,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    getKeepAliveTasks,
    addKeepAliveTask,
    deleteKeepAliveTask,
    toggleKeepAliveTask
} from '@/lib/api';
import { useTheme } from 'next-themes';
import Link from 'next/link';

interface KeepAliveTask {
    id: number;
    url: string;
    alias: string | null;
    interval_minutes: number;
    last_ping: string | null;
    last_status: number | null;
    is_active: boolean;
}

export default function KeepAlivePage() {
    const { theme } = useTheme();
    const [tasks, setTasks] = useState<KeepAliveTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [url, setUrl] = useState('');
    const [alias, setAlias] = useState('');
    const [interval, setInterval] = useState(14);
    const [formLoading, setFormLoading] = useState(false);

    const fetchTasks = async () => {
        try {
            const res = await getKeepAliveTasks();
            setTasks(res.data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        const timer = window.setInterval(fetchTasks, 30000); // Refresh every 30s
        return () => window.clearInterval(timer);
    }, []);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setFormLoading(true);
        try {
            await addKeepAliveTask(url, alias, interval);
            setUrl('');
            setAlias('');
            setInterval(14);
            setIsAdding(false);
            fetchTasks();
        } catch (error) {
            console.error("Failed to add task:", error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteTask = async (id: number) => {
        try {
            await deleteKeepAliveTask(id);
            fetchTasks();
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    const handleToggleTask = async (id: number) => {
        try {
            await toggleKeepAliveTask(id);
            fetchTasks();
        } catch (error) {
            console.error("Failed to toggle task:", error);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-500">
            <main className="max-w-5xl mx-auto px-6 py-12 lg:py-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors mb-6 font-bold text-sm uppercase tracking-widest">
                            <ArrowLeft size={16} /> Back to Toolkit
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                            Keep-Alive <span className="text-black/20 dark:text-white/20">Service</span>
                        </h1>
                        <p className="text-xl text-black/60 dark:text-white/60 font-medium">
                            Prevent your free-tier services from sleeping.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className="h-16 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-xl active:scale-95 transition-all"
                    >
                        {isAdding ? <Square className="mr-2" size={20} /> : <Plus className="mr-2" size={20} />}
                        {isAdding ? "Cancel" : "Add Service"}
                    </Button>
                </div>

                {/* Add Form */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 48 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <Card className="border-2 border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] rounded-[2rem]">
                                <CardContent className="p-8">
                                    <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-12 lg:col-span-5 space-y-2">
                                            <label className="text-xs font-bold tracking-widest text-black/50 dark:text-white/50 uppercase ml-1">Service URL</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" size={20} />
                                                <input
                                                    type="url"
                                                    required
                                                    value={url}
                                                    onChange={e => setUrl(e.target.value)}
                                                    placeholder="https://your-service.onrender.com"
                                                    className="w-full h-14 pl-12 pr-5 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-6 lg:col-span-3 space-y-2">
                                            <label className="text-xs font-bold tracking-widest text-black/50 dark:text-white/50 uppercase ml-1">Alias (Optional)</label>
                                            <input
                                                value={alias}
                                                onChange={e => setAlias(e.target.value)}
                                                placeholder="My App Dev"
                                                className="w-full h-14 px-5 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-6 lg:col-span-2 space-y-2">
                                            <label className="text-xs font-bold tracking-widest text-black/50 dark:text-white/50 uppercase ml-1">Interval (Min)</label>
                                            <div className="relative">
                                                <Timer className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" size={18} />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="60"
                                                    required
                                                    value={interval}
                                                    onChange={e => setInterval(parseInt(e.target.value))}
                                                    className="w-full h-14 pl-12 pr-5 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-12 lg:col-span-2 flex items-end">
                                            <Button
                                                type="submit"
                                                disabled={formLoading}
                                                className="w-full h-14 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold shadow-lg"
                                            >
                                                {formLoading ? <RefreshCw className="animate-spin" size={20} /> : "Save"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Task List */}
                <div className="grid gap-6">
                    {loading ? (
                        <div className="py-24 text-center">
                            <RefreshCw className="mx-auto animate-spin text-black/20 dark:text-white/20 mb-4" size={48} />
                            <p className="font-bold text-black/40 dark:text-white/40 uppercase tracking-widest text-sm">Booting Services...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="py-24 px-12 border-2 border-dashed border-black/10 dark:border-white/10 rounded-[3rem] text-center bg-black/[0.01] dark:bg-white/[0.01]">
                            <Activity className="mx-auto text-black/10 dark:text-white/10 mb-6" size={64} />
                            <h3 className="text-2xl font-bold mb-2">No active monitors</h3>
                            <p className="text-black/40 dark:text-white/40 max-w-sm mx-auto font-medium">Add your first service to start preventing it from spinning down.</p>
                        </div>
                    ) : (
                        tasks.map((task, idx) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="border border-black/10 dark:border-white/10 bg-white dark:bg-black rounded-3xl overflow-hidden hover:border-black/30 dark:hover:border-white/30 transition-all shadow-md hover:shadow-xl">
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">

                                        {/* Status Indicator */}
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 ${!task.is_active
                                            ? 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-black/20 dark:text-white/20'
                                            : task.last_status === 200
                                                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                                : task.last_status ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                                    : 'bg-black dark:bg-white border-transparent text-white dark:text-black'
                                            }`}>
                                            {!task.is_active ? <Square size={28} /> : task.last_status === 200 ? <CheckCircle2 size={28} /> : task.last_status ? <AlertCircle size={28} /> : <Activity size={28} className="animate-pulse" />}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 text-center md:text-left">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                                <h3 className="text-xl font-black truncate">{task.alias || "Unnamed Service"}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${task.is_active ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40'
                                                    }`}>
                                                    {task.is_active ? 'Active' : 'Paused'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center md:justify-start gap-2 text-black/50 dark:text-white/50 font-mono text-sm">
                                                <Globe size={14} />
                                                <span className="truncate">{task.url}</span>
                                                <a href={task.url} target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-8 px-8 py-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Interval</p>
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <Clock size={12} className="text-black/50 dark:text-white/50" />
                                                    <p className="font-bold text-sm">{task.interval_minutes}m</p>
                                                </div>
                                            </div>
                                            <div className="w-[1px] h-8 bg-black/10 dark:border-white/10" />
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Last Ping</p>
                                                <p className="font-bold text-sm">
                                                    {task.last_ping ? new Date(task.last_ping).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleToggleTask(task.id)}
                                                className={`w-12 h-12 rounded-xl transition-all ${task.is_active
                                                    ? 'border-black/20 dark:border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                                                    : 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                                                    }`}
                                            >
                                                {task.is_active ? <Square size={18} /> : <Play size={18} />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="w-12 h-12 rounded-xl border-black/10 dark:border-white/10 hover:border-red-500 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Footer Tip */}
                <div className="mt-16 text-center">
                    <p className="text-sm font-bold text-black/30 dark:text-white/30 tracking-wide flex items-center justify-center gap-2">
                        <AlertCircle size={14} /> Tip: Render free tier spins down after 15m of inactivity. Set 14m to be safe.
                    </p>
                </div>

            </main>
        </div>
    );
}
