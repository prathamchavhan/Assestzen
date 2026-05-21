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
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Timer,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    getKeepAliveTasks,
    addKeepAliveTask,
    deleteKeepAliveTask,
    toggleKeepAliveTask
} from '@/lib/api';
import { Navbar } from '@/components/Navbar';

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
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-24 lg:pt-40">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div className="flex-1">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                            Keep-Alive <span className="text-black/20 dark:text-white/20">Service</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-black/60 dark:text-white/60 font-medium max-w-xl leading-relaxed">
                            Prevent your free-tier services from sleeping with automated background pings.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className="h-20 px-10 rounded-[1.5rem] bg-black dark:bg-white text-white dark:text-black font-black text-xl shadow-2xl active:scale-95 transition-all w-full md:w-auto"
                    >
                        {isAdding ? <Square className="mr-3" size={24} /> : <Plus className="mr-3" size={24} />}
                        {isAdding ? "Cancel" : "Add Service"}
                    </Button>
                </motion.div>

                {/* Add Form */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 64 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <Card className="border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] rounded-[2.5rem] shadow-inner">
                                <CardContent className="p-8 md:p-12">
                                    <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                        <div className="md:col-span-12 lg:col-span-5 space-y-3">
                                            <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase ml-1">Service URL</label>
                                            <div className="relative">
                                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" size={20} />
                                                <input
                                                    type="url"
                                                    required
                                                    value={url}
                                                    onChange={e => setUrl(e.target.value)}
                                                    placeholder="https://app.render.com"
                                                    className="w-full h-16 pl-14 pr-6 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-6 lg:col-span-3 space-y-3">
                                            <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase ml-1">Alias</label>
                                            <input
                                                value={alias}
                                                onChange={e => setAlias(e.target.value)}
                                                placeholder="My Backend"
                                                className="w-full h-16 px-6 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-6 lg:col-span-2 space-y-3">
                                            <label className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase ml-1">Interval (Min)</label>
                                            <div className="relative">
                                                <Timer className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" size={20} />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="60"
                                                    required
                                                    value={interval}
                                                    onChange={e => setInterval(parseInt(e.target.value))}
                                                    className="w-full h-16 pl-14 pr-6 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-12 lg:col-span-2 flex items-end">
                                            <Button
                                                type="submit"
                                                disabled={formLoading}
                                                className="w-full h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-lg shadow-xl"
                                            >
                                                {formLoading ? <Loader2 className="animate-spin" size={24} /> : "Save Target"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Task List */}
                <div className="grid gap-8">
                    {loading ? (
                        <div className="py-32 text-center">
                            <Loader2 className="mx-auto animate-spin text-black/10 dark:text-white/10 mb-6" size={64} />
                            <p className="font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] text-sm">Syncing Monitors</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="py-32 px-12 border-2 border-dashed border-black/5 dark:border-white/5 rounded-[3rem] text-center bg-black/[0.01] dark:bg-white/[0.01]">
                            <Activity className="mx-auto text-black/5 dark:text-white/5 mb-8" size={80} />
                            <h3 className="text-3xl font-black mb-3">No Active Watchers</h3>
                            <p className="text-black/40 dark:text-white/40 max-w-sm mx-auto font-bold text-lg">Add your first service to prevent it from sleeping during inactivity.</p>
                        </div>
                    ) : (
                        tasks.map((task, idx) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="border border-black/5 dark:border-white/5 bg-white dark:bg-black rounded-[2.5rem] overflow-hidden hover:border-black/20 dark:hover:border-white/20 transition-all shadow-xl hover:shadow-2xl group">
                                    <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
                                        {/* Status */}
                                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 border-2 transition-colors ${!task.is_active
                                            ? 'bg-black/5 border-black/5 text-black/20 dark:bg-white/5 dark:border-white/5 dark:text-white/20'
                                            : task.last_status === 200
                                                ? 'bg-green-500/10 border-green-500/10 text-green-500'
                                                : task.last_status ? 'bg-red-500/10 border-red-500/10 text-red-500'
                                                    : 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                                            }`}>
                                            {!task.is_active ? <Square size={32} /> : task.last_status === 200 ? <CheckCircle2 size={32} /> : task.last_status ? <AlertCircle size={32} /> : <Activity size={32} className="animate-pulse" />}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 text-center md:text-left">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3 text-2xl font-black tracking-tight">
                                                <h3 className="truncate max-w-[300px]">{task.alias || "Service"}</h3>
                                                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${task.is_active ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-black/5 text-black/30 dark:bg-white/5 dark:text-white/30'}`}>
                                                    {task.is_active ? 'Online' : 'Paused'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center md:justify-start gap-3 text-black/40 dark:text-white/40 font-bold text-lg">
                                                <Globe size={18} />
                                                <span className="truncate max-w-[400px]">{task.url}</span>
                                                <a href={task.url} target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                                                    <ExternalLink size={18} />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-10 px-10 py-6 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-2">Cycle</p>
                                                <div className="flex items-center gap-2 justify-center">
                                                    <Clock size={14} className="text-black/40 dark:text-white/40" />
                                                    <p className="font-black text-lg">{task.interval_minutes}m</p>
                                                </div>
                                            </div>
                                            <div className="w-[1px] h-10 bg-black/5 dark:bg-white/10" />
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-2">Telemetry</p>
                                                <p className="font-black text-lg">
                                                    {task.last_ping ? new Date(task.last_ping).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleToggleTask(task.id)}
                                                className={`w-14 h-14 rounded-2xl transition-all border-2 ${task.is_active
                                                    ? 'border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                                                    : 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                                                    }`}
                                            >
                                                {task.is_active ? <Square size={20} /> : <Play size={20} />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="w-14 h-14 rounded-2xl border-2 border-black/5 dark:border-white/5 hover:border-red-500 hover:text-red-500 transition-all hover:scale-105"
                                            >
                                                <Trash2 size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Tip */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-20 p-8 rounded-[2rem] bg-black/5 dark:bg-white/5 text-center">
                    <p className="text-sm font-black text-black/30 dark:text-white/30 tracking-widest flex items-center justify-center gap-3 uppercase">
                        <AlertCircle size={18} /> Render free tier spins down after 15m. Recommendation: Set 14m.
                    </p>
                </motion.div>
            </main>
        </div>
    );
}
