import React, { useState, useEffect } from 'react';
import { WORKS, Work } from '../../data';
import IndexLabel from '../core/IndexLabel';
import RevealText from '../core/RevealText';
import { apiFetch } from '../../lib/api';

interface AdminScreenProps {
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  onSelectProject: (project: Work) => void;
}

export default function AdminScreen({ isAdmin, setIsAdmin, onSelectProject }: AdminScreenProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check login status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await apiFetch('/api/admin/status');
      const data = await res.json();
      setIsAdmin(!!data.isAdmin);
    } catch (err) {
      console.error('[Auth] Failed to check status:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
        }
        setIsAdmin(true);
        setError(null);
        setPassword('');
      } else {
        setError(data.error || 'Login failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await apiFetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        localStorage.removeItem('admin_token');
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('[Auth] Failed to logout:', err);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 min-h-[80vh] flex flex-col justify-start">
      {/* Header */}
      <div className="mb-12">
        <IndexLabel number={99} text="Administrative Portal" tone="klein" className="mb-4 inline-block" />
        <RevealText
          as="h1"
          lines={isAdmin ? ["Admin Dashboard", "Portfolio Workspace"] : ["Administrator Access", "Authorized Entry Only"]}
          className="font-sans font-bold text-4xl md:text-6xl tracking-tighter text-ink-900 leading-none"
        />
        <p className="font-sans text-sm text-ink-500 max-w-xl mt-6 leading-relaxed">
          {isAdmin 
            ? "Welcome back, Roy. You are authenticated as administrator. You can now configure galleries, manage uploads, optimize videos, and edit links directly on each project details page."
            : "Please verify your security credentials to access the portfolio editing dashboard. This session is rate-limited and logged."
          }
        </p>
      </div>

      <div className="max-w-2xl w-full">
        {!isAdmin ? (
          /* Login Form Card */
          <div className="border border-ink-150 p-6 md:p-8 bg-paper-100 rounded-xs relative">
            <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-ink-500 mb-6">
              — CREDENTIAL VERIFICATION
            </h3>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-ink-400 mb-2">
                  System Passkey
                </label>
                <div className="relative">
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={loading}
                    className="w-full bg-paper-0 border border-ink-200 px-4 py-3 text-sm font-mono text-ink-900 focus:outline-none focus:border-klein disabled:opacity-50 transition-all rounded-xs"
                    autoFocus
                  />
                  <button
                    id="admin-password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-wider text-ink-400 hover:text-klein select-none"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 border border-rose-200 bg-rose-50/50 text-rose-700 text-xs font-sans leading-relaxed rounded-xs">
                  <span className="font-semibold">Verification Failed:</span> {error}
                </div>
              )}

              <button
                id="admin-login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-ink-950 text-paper-0 py-3 text-xs font-mono uppercase tracking-widest hover:bg-klein transition-all duration-300 disabled:opacity-50 select-none font-semibold rounded-xs cursor-pointer"
              >
                {loading ? 'Authenticating System...' : 'Initiate Secure Login'}
              </button>
            </form>

            <div className="mt-6 p-4 border border-dashed border-ink-150 font-mono text-[9px] text-ink-400 leading-relaxed uppercase tracking-wider">
              Warning: Unauthorized access attempts are monitored and logged. Rate limiting blocks source IP after multiple failures.
            </div>
          </div>
        ) : (
          /* Logged In Dashboard Dashboard */
          <div className="space-y-8">
            {/* System Status */}
            <div className="border border-ink-150 p-6 bg-paper-100 rounded-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-xs text-emerald-800 text-[10px] font-mono uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Authenticated Admin Session
                  </span>
                  <p className="font-sans text-xs text-ink-500 mt-2">
                    Security Session Token: <span className="font-mono">Active</span>
                  </p>
                </div>

                <button
                  id="admin-logout-btn"
                  onClick={handleLogout}
                  className="px-4 py-2 border border-ink-300 bg-paper-0 hover:border-rose-600 hover:text-rose-600 text-ink-700 text-xs font-mono uppercase tracking-wider transition-all rounded-xs shrink-0 select-none cursor-pointer"
                >
                  Terminate Session (Logout)
                </button>
              </div>
            </div>

            {/* Quick-Jump to Project Editors */}
            <div className="space-y-4">
              <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-ink-500">
                — PROJECT SELECTOR (DIRECT GALLERY EDITOR)
              </h3>
              <p className="font-sans text-xs text-ink-500">
                Click any project listed below to immediately open its details page with full administrative editing capabilities enabled.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {WORKS.map((project) => (
                  <button
                    id={`admin-jump-project-${project.id}`}
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="flex flex-col text-left border border-ink-150 p-4 bg-paper-0 hover:border-klein hover:bg-paper-100 transition-all rounded-xs group cursor-pointer"
                  >
                    <span className="font-mono text-[9px] text-ink-400 uppercase tracking-widest mb-1.5">
                      Project #{String(project.number).padStart(2, '0')}
                    </span>
                    <span className="font-sans font-bold text-sm text-ink-900 group-hover:text-klein transition-all">
                      {project.title}
                    </span>
                    <span className="font-sans text-[11px] text-ink-400 mt-1 line-clamp-1">
                      {project.category} — {project.subCategory}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Help Guide */}
            <div className="p-6 border border-dashed border-ink-150 font-sans text-xs text-ink-500 leading-relaxed rounded-xs">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-ink-900 mb-2">
                Operational Notes:
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-ink-500">
                <li>Changes are securely persisted to the server file-system database on Cloud Run.</li>
                <li>Large videos are automatically optimized to compressed streamable MP4 format using FFmpeg in the background.</li>
                <li>Ensure you log out when using shared workstations to destroy cookie sessions.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
