"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Trophy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MathGameProps {
    compact?: boolean;
}

export function MathGame({ compact = false }: MathGameProps) {
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [question, setQuestion] = useState({ text: '', answer: 0 });
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [questionCount, setQuestionCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const generateQuestion = useCallback(() => {
        const types = [
            'percentage', 'square', 'cube', 'sqrt', 'lcm', 'hcf',
            'series', 'profitLoss', 'ratio', 'average', 'remainder',
            'power', 'speedTime', 'simplify', 'factorial', 'modular'
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        let text = '', answer = 0;

        const gcd = (x: number, y: number): number => y === 0 ? x : gcd(y, x % y);
        const lcm = (x: number, y: number): number => (x * y) / gcd(x, y);

        switch (type) {
            case 'percentage': {
                const percents = [10, 15, 20, 25, 30, 40, 50, 60, 75];
                const p = percents[Math.floor(Math.random() * percents.length)];
                const bases = [80, 120, 150, 200, 250, 300, 400, 500, 600, 800];
                const base = bases[Math.floor(Math.random() * bases.length)];
                text = `${p}% of ${base} = ?`;
                answer = (p * base) / 100;
                break;
            }
            case 'square': {
                const n = Math.floor(Math.random() * 25) + 6;
                text = `${n}² = ?`;
                answer = n * n;
                break;
            }
            case 'cube': {
                const n = Math.floor(Math.random() * 10) + 3;
                text = `${n}³ = ?`;
                answer = n * n * n;
                break;
            }
            case 'sqrt': {
                const roots = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625];
                const sq = roots[Math.floor(Math.random() * roots.length)];
                text = `√${sq} = ?`;
                answer = Math.sqrt(sq);
                break;
            }
            case 'lcm': {
                const a = Math.floor(Math.random() * 12) + 4;
                const b = Math.floor(Math.random() * 12) + 4;
                text = `LCM of ${a} and ${b} = ?`;
                answer = lcm(a, b);
                break;
            }
            case 'hcf': {
                const a = Math.floor(Math.random() * 30) + 12;
                const b = Math.floor(Math.random() * 30) + 12;
                text = `HCF of ${a} and ${b} = ?`;
                answer = gcd(a, b);
                break;
            }
            case 'series': {
                const start = Math.floor(Math.random() * 10) + 1;
                const diff = Math.floor(Math.random() * 8) + 2;
                const terms = [start, start + diff, start + 2 * diff, start + 3 * diff];
                text = `${terms.join(', ')}, ? (next)`;
                answer = start + 4 * diff;
                break;
            }
            case 'profitLoss': {
                const cp = [100, 150, 200, 250, 300, 400, 500][Math.floor(Math.random() * 7)];
                const profitPct = [10, 15, 20, 25, 30, 40, 50][Math.floor(Math.random() * 7)];
                text = `CP = ₹${cp}, Profit = ${profitPct}%. SP = ?`;
                answer = cp + (cp * profitPct) / 100;
                break;
            }
            case 'ratio': {
                const r1 = Math.floor(Math.random() * 5) + 2;
                const r2 = Math.floor(Math.random() * 5) + 2;
                const total = (r1 + r2) * (Math.floor(Math.random() * 8) + 3);
                text = `Divide ${total} in ratio ${r1}:${r2}. Larger part = ?`;
                const larger = Math.max(r1, r2);
                answer = (total * larger) / (r1 + r2);
                break;
            }
            case 'average': {
                const count = Math.floor(Math.random() * 3) + 3;
                const nums: number[] = [];
                for (let i = 0; i < count; i++) nums.push(Math.floor(Math.random() * 30) + 5);
                const sum = nums.reduce((a, b) => a + b, 0);
                const remainder = sum % count;
                if (remainder !== 0) nums[0] += (count - remainder);
                const cleanSum = nums.reduce((a, b) => a + b, 0);
                text = `Average of ${nums.join(', ')} = ?`;
                answer = cleanSum / count;
                break;
            }
            case 'remainder': {
                const divisor = Math.floor(Math.random() * 8) + 3;
                const quotient = Math.floor(Math.random() * 20) + 5;
                const rem = Math.floor(Math.random() * (divisor - 1)) + 1;
                const dividend = divisor * quotient + rem;
                text = `${dividend} ÷ ${divisor} → remainder = ?`;
                answer = rem;
                break;
            }
            case 'power': {
                const base = Math.floor(Math.random() * 6) + 2;
                const exp = Math.floor(Math.random() * 4) + 2;
                text = `${base}^${exp} = ?`;
                answer = Math.pow(base, exp);
                break;
            }
            case 'speedTime': {
                const speeds = [20, 30, 40, 50, 60, 80];
                const speed = speeds[Math.floor(Math.random() * speeds.length)];
                const times = [2, 3, 4, 5, 6];
                const time = times[Math.floor(Math.random() * times.length)];
                text = `Speed=${speed}km/h, Time=${time}hrs. Distance=?`;
                answer = speed * time;
                break;
            }
            case 'simplify': {
                const a = Math.floor(Math.random() * 20) + 5;
                const b = Math.floor(Math.random() * 15) + 3;
                const c = Math.floor(Math.random() * 10) + 2;
                text = `${a} + ${b} × ${c} = ? (BODMAS)`;
                answer = a + b * c;
                break;
            }
            case 'factorial': {
                const n = Math.floor(Math.random() * 5) + 3;
                let fact = 1;
                for (let i = 2; i <= n; i++) fact *= i;
                text = `${n}! = ?`;
                answer = fact;
                break;
            }
            case 'modular': {
                const base = Math.floor(Math.random() * 50) + 20;
                const mod = Math.floor(Math.random() * 8) + 3;
                text = `${base} mod ${mod} = ?`;
                answer = base % mod;
                break;
            }
            default: {
                text = '15 + 27 = ?';
                answer = 42;
            }
        }

        setQuestion({ text, answer });
        setUserAnswer('');
        setFeedback(null);
        setQuestionCount(prev => prev + 1);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    useEffect(() => {
        generateQuestion();
    }, [generateQuestion]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseInt(userAnswer);
        if (isNaN(parsed)) return;

        if (parsed === question.answer) {
            setFeedback('correct');
            setScore(prev => prev + 10);
            setStreak(prev => {
                const newStreak = prev + 1;
                setBestStreak(best => Math.max(best, newStreak));
                return newStreak;
            });
        } else {
            setFeedback('wrong');
            setStreak(0);
        }

        setTimeout(() => generateQuestion(), 600);
    };

    if (compact) {
        return (
            <div className="w-full">
                <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-black/50 dark:text-white/50" />
                    <span className="text-xs font-bold tracking-widest text-black/50 dark:text-white/50 uppercase">Brain Teaser</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-black">{question.text} = ?</span>
                    <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
                        <input
                            ref={inputRef}
                            type="number"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="w-20 h-9 px-3 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                            placeholder="?"
                        />
                        <Button type="submit" size="sm" className="h-9 px-3 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold">Go</Button>
                    </form>
                    <span className="text-xs font-bold bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full">{score}pts</span>
                </div>
                <AnimatePresence>
                    {feedback && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`text-xs font-bold mt-2 ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}
                        >
                            {feedback === 'correct' ? '✓ Correct!' : `✗ Answer: ${question.answer}`}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
        >
            <div className="bg-white dark:bg-black rounded-3xl border border-black/10 dark:border-white/10 shadow-xl overflow-hidden">
                <div className="bg-black dark:bg-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-white dark:text-black" />
                        <span className="text-white dark:text-black font-bold text-sm tracking-widest uppercase">Math Challenge</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-white/70 dark:text-black/70">
                            <Zap size={14} />
                            <span className="text-xs font-bold">{streak} streak</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/70 dark:text-black/70">
                            <Trophy size={14} />
                            <span className="text-xs font-bold">Best: {bestStreak}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 text-center">
                    <div className="mb-2">
                        <span className="text-xs font-bold tracking-widest text-black/30 dark:text-white/30 uppercase">Question #{questionCount}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={questionCount}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-5xl md:text-6xl font-black tracking-tighter mb-8">{question.text} = ?</p>
                        </motion.div>
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="flex items-center justify-center gap-4 mb-6">
                        <input
                            ref={inputRef}
                            type="number"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="w-32 h-16 text-center text-2xl font-black bg-black/5 dark:bg-white/5 border-2 border-black/15 dark:border-white/15 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30 focus:border-black/30 dark:focus:border-white/30 transition-all"
                            placeholder="?"
                            autoFocus
                        />
                        <Button type="submit" size="lg" className="h-16 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-lg active:scale-95 transition-transform">
                            Submit
                        </Button>
                    </form>

                    <AnimatePresence>
                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="mb-4"
                            >
                                {feedback === 'correct' ? (
                                    <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 text-lg font-black bg-green-50 dark:bg-green-950/50 px-4 py-2 rounded-xl">
                                        <CheckCircle size={20} /> Correct! +10
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 text-red-500 text-lg font-black bg-red-50 dark:bg-red-950/50 px-4 py-2 rounded-xl">
                                        ✗ Answer was {question.answer}
                                    </span>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-center gap-6">
                        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-5 py-3">
                            <p className="text-xs font-bold tracking-widest text-black/40 dark:text-white/40 uppercase mb-1 text-center">Score</p>
                            <p className="text-2xl font-black">{score}</p>
                        </div>
                        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-5 py-3">
                            <p className="text-xs font-bold tracking-widest text-black/40 dark:text-white/40 uppercase mb-1 text-center">Solved</p>
                            <p className="text-2xl font-black">{questionCount - 1}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
