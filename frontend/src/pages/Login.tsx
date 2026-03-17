import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@nitc.ac.in');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (email === 'admin@nitc.ac.in' && password === 'admin123') {
        onLogin();
      } else {
        setError('Invalid credentials. Try admin@nitc.ac.in / admin123');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-amber blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-steel blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber via-steel to-amber opacity-60" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber/20 rounded-2xl mb-4 border border-amber/30">
            <div className="font-display text-2xl font-bold text-amber">A</div>
          </div>
          <h1 className="font-display text-4xl font-bold text-cream">Atlas</h1>
          <p className="text-steel text-sm mt-2 font-body tracking-wide uppercase">Indoor Navigation Admin</p>
          <p className="text-cream/40 text-xs font-body mt-1">National Institute of Technology Calicut</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <h2 className="font-display text-xl text-cream mb-6">Sign in to console</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-medium text-steel mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel/60" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 pl-9 text-sm text-cream placeholder-steel/50 focus:outline-none focus:border-amber/60 font-body"
                  placeholder="admin@nitc.ac.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-steel mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel/60" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 pl-9 pr-10 text-sm text-cream placeholder-steel/50 focus:outline-none focus:border-amber/60 font-body"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel/60 hover:text-steel">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-body bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-amber text-navy font-body font-semibold py-2.5 rounded-lg text-sm hover:bg-amber/90 transition-colors disabled:opacity-60 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-steel/50 mt-6 font-body">Demo: admin@nitc.ac.in / admin123</p>
        </div>
      </div>
    </div>
  );
}
