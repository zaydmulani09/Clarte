import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Download, 
  Github, 
  Code2, 
  Cpu, 
  Layers, 
  Terminal, 
  User as UserIcon, 
  LogOut, 
  ChevronRight,
  Send,
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Scene } from './components/Scene';
import { EtheralShadow } from './components/ui/etheral-shadow';
import { cn } from './lib/utils';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, handleFirestoreError, OperationType } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';

// --- Types ---
interface Release {
  id: string;
  version: string;
  fileUrl: string;
  notes: string;
  date: any;
}

interface UserData {
  uid: string;
  email: string | null;
  name: string | null;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              role: userDoc.data().role
            });
          } else {
            // New user, check if they should be admin (first user)
            // For simplicity, we'll check the email provided in context
            const role = firebaseUser.email === 'jymulani2@gmail.com' ? 'admin' : 'user';
            const newUser = {
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              provider: 'google',
              role: role,
              createdAt: serverTimestamp()
            };
            await setDoc(userDocRef, newUser);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              role: role
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });

    const q = query(collection(db, 'releases'), orderBy('date', 'desc'));
    const unsubscribeReleases = onSnapshot(q, (snapshot) => {
      const releasesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Release[];
      setReleases(releasesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'releases');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeReleases();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactStatus('sending');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await addDoc(collection(db, 'messages'), {
        ...data,
        createdAt: serverTimestamp()
      });
      setContactStatus('success');
      setTimeout(() => setContactStatus('idle'), 3000);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setContactStatus('idle');
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  return (
    <div className="min-h-screen text-white selection:bg-indigo-500/30">
      <Scene />
      <div className="fixed inset-0 -z-10 opacity-40">
        <EtheralShadow
          color="rgba(30, 27, 75, 1)"
          animation={{ scale: 80, speed: 40 }}
          noise={{ opacity: 0.3, scale: 1.5 }}
          sizing="fill"
          className="w-full h-full"
        />
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Code2 className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Clarte IDE</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#download" className="hover:text-white transition-colors">Download</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            {user?.role === 'admin' && (
              <a href="/admin" className="text-indigo-400 hover:text-indigo-300 transition-colors">Admin</a>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white backdrop-blur-md border border-white/5"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all active:scale-95"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
              v1.0.0 Now Available
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Code with Clarity.<br />Build with Clarte.
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
              A modern programming language and IDE built from the ground up for performance, 
              safety, and developer happiness.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => {
                  const url = releases[0]?.fileUrl || 'https://github.com/zaydmulani09/Clarte/releases/download/v1.0.0/clarte_gui.exe';
                  window.location.href = url;
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600/80 backdrop-blur-md border border-indigo-500/30 text-white font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                Download Clarte
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating IDE Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="max-w-6xl mx-auto mt-24 relative"
        >
          <div className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-4 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <div className="ml-4 px-3 py-1 rounded-md bg-white/5 text-[10px] text-white/40 font-mono">
                main.clrt — Clarte IDE
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 h-[500px]">
              <div className="col-span-3 border-r border-white/5 p-4 hidden md:block">
                <div className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-4">Project</div>
                <div className="space-y-2">
                  {['src', 'lib', 'tests', 'clarte.config'].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-white/40 hover:text-white/80 cursor-pointer">
                      <ChevronRight className="w-3 h-3" /> {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-12 md:col-span-9 p-4 font-mono text-sm leading-relaxed overflow-hidden">
                <div className="space-y-1">
                  <div className="flex gap-4"><span className="text-white/20 w-4 text-right">1</span> <span className="text-indigo-400">import</span> <span className="text-white/80">"std/io"</span></div>
                  <div className="flex gap-4"><span className="text-white/20 w-4 text-right">2</span> </div>
                  <div className="flex gap-4"><span className="text-white/20 w-4 text-right">3</span> <span className="text-indigo-400">func</span> <span className="text-yellow-400">main</span>() {"{"}</div>
                  <div className="flex gap-4"><span className="text-white/20 w-4 text-right">4</span>   <span className="text-indigo-400">let</span> <span className="text-white/80">app = Clarte.</span><span className="text-yellow-400">init</span>()</div>
                  <div className="flex gap-4"><span className="text-white/20 w-4 text-right">5</span>   <span className="text-white/40">// Initialize the engine</span></div>
                  <div className="flex gap-4"><span className="text-white/20 w-4 text-right">6</span>   <span className="text-white/80">app.</span><span className="text-yellow-400">run</span>()</div>
                  <div className="flex gap-4"><span className="text-white/20 w-4 text-right">7</span> {"}"}</div>
                </div>
                <motion.div 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-5 bg-indigo-500 inline-block ml-1 align-middle"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Designed for the Future</h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Clarte combines the performance of low-level languages with the ergonomics 
              of modern high-level syntax.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Cpu className="w-8 h-8 text-emerald-400" />,
                title: "Native Performance",
                desc: "Compiled directly to machine code with zero-overhead abstractions and a lightning-fast runtime."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-indigo-400" />,
                title: "Memory Safety",
                desc: "Advanced ownership model ensures memory safety without a garbage collector. No more segfaults."
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-400" />,
                title: "Instant Reload",
                desc: "Our custom compiler architecture enables sub-millisecond hot-reloading for rapid development."
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                <div className="mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-[40px] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl">
            <h2 className="text-4xl font-bold mb-8">Ready to build?</h2>
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={() => {
                  const url = releases[0]?.fileUrl || 'https://github.com/zaydmulani09/Clarte/releases/download/v1.0.0/clarte_gui.exe';
                  window.location.href = url;
                }}
                className="px-12 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-xl hover:bg-white/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-3 shadow-2xl shadow-white/5"
              >
                <Download className="w-6 h-6" />
                Download for Windows
              </button>
              <div className="flex items-center gap-4 text-sm text-white/40">
                <span>Version {releases[0]?.version || '1.0.0'}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>64-bit Installer</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>Released {releases[0] ? (releases[0].date?.toDate ? releases[0].date.toDate().toLocaleDateString() : new Date(releases[0].date).toLocaleDateString()) : 'Today'}</span>
              </div>
            </div>
            
            <div className="mt-12 pt-12 border-t border-white/5 text-left">
              <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">Release Notes</h4>
              <p className="text-white/60 leading-relaxed italic">
                "{releases[0]?.notes || 'Initial public release of Clarte IDE. Features advanced syntax highlighting and a custom debugger.'}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-white/40">Have questions or feedback? We'd love to hear from you.</p>
          </div>
          
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Name</label>
                <input 
                  required
                  name="name"
                  type="text" 
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email</label>
                <input 
                  required
                  name="email"
                  type="email" 
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Message</label>
              <textarea 
                required
                name="message"
                rows={4}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button 
              disabled={contactStatus !== 'idle'}
              className={cn(
                "w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 backdrop-blur-xl border",
                contactStatus === 'idle' ? "bg-indigo-500/20 border-indigo-500/30 hover:bg-indigo-500/30 text-white" : 
                contactStatus === 'success' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
              )}
            >
              {contactStatus === 'idle' && <><Send className="w-5 h-5" /> Send Message</>}
              {contactStatus === 'sending' && <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {contactStatus === 'success' && <><CheckCircle2 className="w-5 h-5" /> Message Sent!</>}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold">Clarte IDE</span>
            </div>
            <p className="text-sm text-white/20">© 2026 Clarte Technologies. All rights reserved.</p>
          </div>
          
          <div className="flex items-center gap-12 text-sm font-medium text-white/40">
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            <span className="text-white/10">v{releases[0]?.version || '1.0.0'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
