"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const signup = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "An error occurred");
        }
    };

    const googleSignup = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "An error occurred");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-8 py-20 transition-colors duration-500">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <div className="bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10">
                    <h1 className="font-serif text-4xl text-zinc-950 dark:text-white mb-3 text-center">
                        Create Account
                    </h1>
                    <p className="font-sans text-zinc-600 dark:text-zinc-400 text-center mb-10">
                        Join us and start your learning journey
                    </p>

                    <button 
                        onClick={googleSignup}
                        className="w-full px-6 py-4 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-lg font-sans font-medium hover:border-accent/50 transition-all duration-500 mb-6 hover:scale-[1.02]"
                    >
                        Continue with Google
                    </button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-zinc-50/80 dark:bg-zinc-900/50 font-mono text-zinc-500 dark:text-zinc-600">
                                or
                            </span>
                        </div>
                    </div>

                    <input 
                        type="email" 
                        placeholder="Email address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 mb-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-sans text-zinc-950 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-accent/50 focus:outline-none transition-all duration-500"
                    />

                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 mb-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-sans text-zinc-950 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-accent/50 focus:outline-none transition-all duration-500"
                    />

                    <motion.button 
                        onClick={signup}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-6 py-4 bg-accent text-white font-sans font-medium rounded-lg hover:bg-accent/90 transition-all duration-500 shadow-lg hover:shadow-xl border border-accent/20"
                    >
                        Create Account
                    </motion.button>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 px-5 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg"
                        >
                            <p className="font-sans text-sm text-red-800 dark:text-red-400 text-center">
                                {error}
                            </p>
                        </motion.div>
                    )}
                    
                    <p className="font-sans text-center mt-8 text-zinc-600 dark:text-zinc-400">
                        Already have an account?{" "}
                        <a 
                            href="/login" 
                            className="text-accent hover:text-accent/80 font-medium transition-colors duration-500"
                        >
                            Login
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
