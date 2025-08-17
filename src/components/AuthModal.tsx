/**
 * Authentication Modal Component
 * Login and Registration modal for Phase 3
 */

'use client';

import { useState } from 'react';
import { UserSystem } from '@/lib/userSystem';
import { User } from '@/types/phase3';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null); // Clear error when user types
  };

  const validateForm = (): boolean => {
    if (mode === 'register') {
      if (!formData.username.trim()) {
        setError('Username harus diisi');
        return false;
      }
      if (formData.username.length < 3) {
        setError('Username minimal 3 karakter');
        return false;
      }
      if (!formData.email.trim()) {
        setError('Email harus diisi');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Format email tidak valid');
        return false;
      }
      if (!formData.displayName.trim()) {
        setError('Nama tampilan harus diisi');
        return false;
      }
      if (!formData.password) {
        setError('Password harus diisi');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Konfirmasi password tidak cocok');
        return false;
      }
    } else {
      if (!formData.username.trim() && !formData.email.trim()) {
        setError('Username atau email harus diisi');
        return false;
      }
      if (!formData.password) {
        setError('Password harus diisi');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (mode === 'register') {
        result = await UserSystem.register({
          username: formData.username,
          email: formData.email,
          displayName: formData.displayName,
          password: formData.password
        });
      } else {
        const credential = formData.username || formData.email;
        result = await UserSystem.login(credential, formData.password);
      }
      
      if (result.success && result.user) {
        onSuccess(result.user);
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      displayName: '',
      password: '',
      confirmPassword: ''
    });
    setError(null);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {mode === 'login' ? 'Masuk' : 'Daftar'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {mode === 'login' 
              ? 'Masuk ke akun InspirasiHub Anda' 
              : 'Bergabung dengan komunitas inspirasi'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username/Email for Login, Username for Register */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {mode === 'login' ? 'Username atau Email' : 'Username'}
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder={mode === 'login' ? 'Masukkan username atau email' : 'Pilih username unik'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={loading}
            />
          </div>

          {/* Email (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Masukkan alamat email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={loading}
              />
            </div>
          )}

          {/* Display Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Tampilan
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Nama yang akan ditampilkan"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={loading}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={mode === 'login' ? 'Masukkan password' : 'Minimal 6 karakter'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={loading}
            />
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Ulangi password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={loading}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'login' ? 'Masuk...' : 'Mendaftar...'}
              </>
            ) : (
              mode === 'login' ? 'Masuk' : 'Daftar'
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
            {' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              disabled={loading}
            >
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}
            </button>
          </p>
        </div>

        {/* Demo Account Info */}
        {mode === 'login' && (
          <div className="px-6 pb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-300 text-xs">
                <strong>Demo:</strong> Username: <code>demo</code>, Password: <code>demo123</code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
