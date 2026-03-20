import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Upload, 
  ArrowLeft,
  Trash2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { auth, db, onAuthStateChanged, handleFirestoreError, OperationType } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

interface Release {
  id: string;
  version: string;
  notes: string;
  date: any;
}

export default function AdminPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [activeTab, setActiveTab] = useState<'releases' | 'contacts'>('releases');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdminUser(true);
          } else {
            setIsAdminUser(false);
          }
        } catch (error) {
          setIsAdminUser(false);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setIsAdminUser(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (isAdminUser !== true) return;

    setIsLoading(true);
    const qReleases = query(collection(db, 'releases'), orderBy('date', 'desc'));
    const unsubscribeReleases = onSnapshot(qReleases, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Release[];
      setReleases(data);
      if (activeTab === 'releases') setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'releases');
    });

    const qMessages = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Contact[];
      setContacts(data);
      if (activeTab === 'contacts') setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    return () => {
      unsubscribeReleases();
      unsubscribeMessages();
    };
  }, [isAdminUser, activeTab]);

  const handleCreateRelease = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { version, notes } = Object.fromEntries(formData.entries());
    
    try {
      await addDoc(collection(db, 'releases'), {
        version,
        notes,
        fileUrl: '/downloads/clarte.exe',
        date: serverTimestamp()
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'releases');
    }
  };

  const handleDeleteRelease = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release?')) return;
    try {
      await deleteDoc(doc(db, 'releases', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `releases/${id}`);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `messages/${id}`);
    }
  };

  if (isAdminUser === false) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-white/40 mb-8">You do not have permission to access the admin console.</p>
        <a href="/" className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/20 transition-all">Return Home</a>
      </div>
    );
  }

  if (isAdminUser === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="font-bold">Admin Console</span>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('releases')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all backdrop-blur-md border ${activeTab === 'releases' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-white/40 hover:text-white/60'}`}
          >
            <Upload className="w-5 h-5" />
            Releases
          </button>
          <button 
            onClick={() => setActiveTab('contacts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all backdrop-blur-md border ${activeTab === 'contacts' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-white/40 hover:text-white/60'}`}
          >
            <MessageSquare className="w-5 h-5" />
            Messages
          </button>
        </div>

        <div className="mt-auto">
          <a href="/" className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Site
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            {activeTab === 'releases' ? 'Manage Releases' : 'Contact Messages'}
          </h1>
          <p className="text-white/40">
            {activeTab === 'releases' ? 'Deploy new versions and update release notes.' : 'View and manage inquiries from users.'}
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'releases' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <form onSubmit={handleCreateRelease} className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] space-y-6">
                <h3 className="text-xl font-bold mb-6">New Release</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Version</label>
                  <input 
                    required
                    name="version"
                    type="text" 
                    placeholder="1.0.1"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Release Notes</label>
                  <textarea 
                    required
                    name="notes"
                    rows={4}
                    placeholder="What's new in this version?"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>
                <button className="w-full py-4 rounded-xl bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-white font-bold hover:bg-indigo-500/30 transition-all">
                  Publish Release
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {releases.map((rel) => (
                <div key={rel.id} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold">v{rel.version}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase">Stable</span>
                    </div>
                    <p className="text-sm text-white/40">{rel.notes}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/20 mb-2">
                      {rel.date?.toDate ? rel.date.toDate().toLocaleDateString() : new Date(rel.date).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => handleDeleteRelease(rel.id)}
                      className="p-2 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {contacts.length === 0 ? (
              <div className="p-12 text-center text-white/20 border border-dashed border-white/10 rounded-3xl">
                No messages yet.
              </div>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{c.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/40">
                        <span className="flex items-center gap-1.5"><ExternalLink className="w-3 h-3" /> {c.email}</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> 
                          {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteMessage(c.id)}
                      className="p-2 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-white/60 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5">
                    {c.message}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
