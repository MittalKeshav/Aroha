'use client';

import React, { useState } from 'react';
import { useTasks } from '@/context/TasksContext';

export default function AuthModal() {
  const { loginIndependent, loginWithGoogle, loginAsGuest, userProfile, isLoaded, authError } = useTasks();
  
  const [mode, setMode] = useState<'main' | 'guest'>('main');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [guestName, setGuestName] = useState('');
  
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const error = localError || authError;

  // Reset modal state when user logs out so they see the fresh main screen
  React.useEffect(() => {
    if (!userProfile) {
      setMode('main');
      setIsSignUp(false);
      setLoading(false);
      setLocalError('');
      setGuestName('');
      setPassword('');
      // We can keep the email/displayName if they want, but better to clear passwords/errors
    }
  }, [userProfile]);

  // If the app is still loading context, or if the user is already logged in, don't show the modal.
  if (!isLoaded || userProfile) return null;

  const handleIndependentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      await loginIndependent(email, password, isSignUp ? displayName : undefined, isSignUp, rememberMe);
    } catch (err: any) {
      console.error(err);
      setLocalError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    // CRITICAL FIX: We MUST call loginWithGoogle() BEFORE any state updates like setLoading(true).
    // React 18 delays state updates, which causes the browser to lose the "trusted click context" and block the popup!
    const loginPromise = loginWithGoogle();
    
    setLocalError('');
    setLoading(true);
    
    try {
      await loginPromise;
    } catch (err: any) {
      console.error(err);
      setLocalError(err.message || 'Google Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setLocalError('Please enter a display name.');
      return;
    }
    setLocalError('');
    setLoading(true);
    try {
      await loginAsGuest(guestName);
    } catch (err: any) {
      console.error(err);
      setLocalError(err.message || 'Guest Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10 overflow-hidden transform transition-all duration-500 scale-100 opacity-100">
        
        {/* Subtle Gradient Glow inside modal */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none"></div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[32px] text-white">rocket_launch</span>
          </div>
          <h2 className="text-display font-display text-white mb-2">Aroha</h2>
          <p className="text-body-lg text-on-surface-variant italic opacity-80">
            "One step higher every day."
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-label-md text-center">
            {error}
          </div>
        )}

        {mode === 'main' ? (
          <div className="relative z-10 flex flex-col gap-6">
            
            {/* Independent Auth Form */}
            <form onSubmit={handleIndependentSubmit} className="flex flex-col gap-4">
              
              {isSignUp && (
                <div>
                  <input 
                    type="text" 
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-body-md"
                  />
                </div>
              )}
              
              <div>
                <input 
                  type="email" 
                  placeholder="Email or Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-body-md"
                />
              </div>
              
              <div>
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-body-md"
                />
              </div>

              <div className="flex items-center justify-between mt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer appearance-none w-4 h-4 border border-outline-variant rounded-sm checked:bg-primary checked:border-primary cursor-pointer transition-colors"
                    />
                    <span className="material-symbols-outlined text-[12px] text-on-primary absolute pointer-events-none opacity-0 peer-checked:opacity-100" style={{ fontWeight: 'bold' }}>check</span>
                  </div>
                  <span className="text-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">Remember Me</span>
                </label>

                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-label-md text-primary hover:text-primary-container transition-colors"
                >
                  {isSignUp ? 'Back to Login' : 'Create Account'}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-label-md py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : (isSignUp ? 'Sign Up' : 'Log In')}
              </button>
            </form>

            <div className="flex items-center gap-4 opacity-60">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-label-sm text-white/60">OR</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleGoogleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-label-md py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {/* Google Logo SVG */}
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Continue with Google
              </button>
              
              <button 
                type="button"
                onClick={() => { setMode('guest'); setLocalError(''); }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-surface-container/50 hover:bg-surface-container text-white border border-white/10 font-label-md py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">person_outline</span>
                Continue as Guest
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center">
              <h3 className="text-headline-sm font-headline-sm text-white mb-2">Welcome, Guest!</h3>
              <p className="text-body-sm text-on-surface-variant">Please enter a display name so we know what to call you.</p>
            </div>

            <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Your Display Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-body-md text-center"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setMode('main')}
                  disabled={loading}
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-white font-label-md py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-label-md py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start using Aroha'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
