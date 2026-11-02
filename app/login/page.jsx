"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import useCrud from "@/hooks/useCRUD";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";

const testimonials = [
    {
        quote: "Satu-satunya cara untuk melakukan pekerjaan hebat adalah dengan mencintai apa yang Anda lakukan. Temukan gairah Anda, dan kesuksesan akan mengikuti.",
        name: "Steve Jobs",
        title: "Visioner & Co-founder Apple",
    },
    {
        quote: "Kesulitan memperkuat pikiran, seperti kerja keras memperkuat tubuh. Setiap tantangan adalah kesempatan untuk tumbuh menjadi lebih kuat.",
        name: "Seneca",
        title: "Filsuf Stoik",
    },
    {
        quote: "Orang yang memindahkan gunung memulai dengan membawa batu-batu kecil. Fokus pada kemajuan setiap hari, sekecil apa pun itu.",
        name: "Confucius",
        title: "Filsuf Tiongkok",
    },
];

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { login, error, loading } = useCrud("signin");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await login({ username, password });
            const expires = new Date();
            expires.setHours(expires.getHours() + 6);
            document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}`;
            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const handleNextTestimonial = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
            setIsAnimating(false);
        }, 300);
    }, [isAnimating]);

    const handlePrevTestimonial = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
            setIsAnimating(false);
        }, 300);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            handleNextTestimonial();
        }, 5000); // Durasi testimonial diperpanjang

        return () => clearInterval(timer);
    }, [handleNextTestimonial]);

    const currentData = testimonials[currentTestimonial];

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800 overflow-hidden">
            <div
                className={`w-full max-w-6xl mx-auto flex rounded-[2.5rem] bg-white shadow-2xl overflow-hidden transition-all duration-1000 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ minHeight: '800px' }}
            >
                {/* Panel Formulir Login */}
                <div
                    className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-3">Selamat Datang Kembali</h1>
                        <p className="text-slate-500 mb-10">Silakan masukkan akun Anda untuk melanjutkan.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="username" className="block text-slate-600 font-medium text-sm mb-2">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 w-full p-3.5 placeholder-slate-400 transition-all duration-300"
                                    placeholder="Masukkan username"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                            <div className="mb-10">
                                <label htmlFor="password" className="block text-slate-600 font-medium text-sm mb-2">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 w-full p-3.5 placeholder-slate-400 transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm mb-4 text-center">{error.message || 'Username atau password salah.'}</p>}
                            
                            <button
                                type="submit"
                                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_4px_20px_rgba(56,189,248,0.3)] disabled:bg-slate-300 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Panel Inspirasi */}
                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-sky-500 to-cyan-400 p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-60 h-60 border-8 border-white/20 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/4 -right-12 w-48 h-48 bg-white/10 rounded-full"></div>
                    <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white p-4 rounded-full shadow-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                        <Star className="text-sky-500" size={24} fill="currentColor" />
                    </div>

                    <div className="z-10 flex flex-col h-full text-white">
                        <div className={`flex-grow transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="text-8xl font-bold text-sky-200/80 leading-none">“</span>
                            <h2 className="text-4xl font-bold leading-tight -mt-8">
                                Inspirasi Untuk Hari Anda.
                            </h2>
                            <p className="text-sky-100 mt-6 font-light text-lg min-h-[140px]">
                                {currentData.quote}
                            </p>
                            <div className="mt-8">
                                <p className="font-bold text-xl">{currentData.name}</p>
                                <p className="text-sky-200">{currentData.title}</p>
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl shadow-2xl z-10 mb-8">
                                <h3 className="font-bold">Tingkatkan Bisnis Anda Sekarang</h3>
                                <p className="text-sm text-sky-100 mt-2">Jadilah yang terdepan dalam mengelola usaha dengan cara modern.</p>
                                <div className="flex -space-x-3 overflow-hidden mt-4">
                                    <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white/50" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar Pengguna 1" />
                                    <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white/50" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="Avatar Pengguna 2" />
                                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white/50 bg-white/30 text-white text-xs font-bold">+99</div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handlePrevTestimonial} className="w-14 h-14 bg-transparent border-2 border-white/50 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 transform hover:scale-110">
                                    <ArrowLeft size={24} />
                                </button>
                                <button onClick={handleNextTestimonial} className="w-14 h-14 bg-white rounded-full text-sky-600 flex items-center justify-center hover:bg-sky-50 transition-all duration-300 transform hover:scale-110 shadow-lg">
                                    <ArrowRight size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}