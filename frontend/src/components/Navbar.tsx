"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { MonitorPlay, QrCode, Activity, Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

const navItems = [
    { name: 'Toolkit', href: '/', icon: MonitorPlay },
    { name: 'QR Tools', href: '/qr', icon: QrCode },
    { name: 'Keep-Alive', href: '/keep-alive', icon: Activity },
];

export function Navbar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
            <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md group-hover:scale-105 transition-transform">
                            <MonitorPlay size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tight hidden sm:block">Assetzen</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={`
                    relative px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                    ${isActive
                                            ? 'text-white dark:text-black'
                                            : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
                                        }
                  `}>
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-bg"
                                                className="absolute inset-0 bg-black dark:bg-white rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon size={16} className="relative z-10" />
                                        <span className="relative z-10">{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-10 h-10 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden rounded-full w-10 h-10"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-white dark:bg-black border-b border-black/5 dark:border-white/5 p-6 space-y-4"
                >
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`
                  flex items-center gap-4 p-4 rounded-2xl text-lg font-black transition-all
                  ${isActive
                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                        : 'bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50'
                                    }
                `}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </motion.div>
            )}
        </nav>
    );
}
