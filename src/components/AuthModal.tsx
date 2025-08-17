/**
 * Modern Authentication Modal Component
 * Enhanced with OAuth providers and Phone Authentication for Phase 3
 */

'use client';

import { useState, useRef } from 'react';
import { UserSystem } from '@/lib/userSystem';
import { User } from '@/types/phase3';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'register' | 'phone';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'phone' | 'verify'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    verificationCode: ''
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
    } else if (mode === 'phone') {
      if (!formData.phoneNumber.trim()) {
        setError('Nomor telepon harus diisi');
        return false;
      }
      if (!/^\+[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
        setError('Format nomor telepon tidak valid (contoh: +6281234567890)');
        return false;
      }
      if (!formData.username.trim()) {
        setError('Username harus diisi');
        return false;
      }
      if (formData.username.length < 3) {
        setError('Username minimal 3 karakter');
        return false;
      }
      if (!formData.displayName.trim()) {
        setError('Nama tampilan harus diisi');
        return false;
      }
    } else if (mode === 'verify') {
      if (!formData.verificationCode.trim()) {
        setError('Kode verifikasi harus diisi');
        return false;
      }
      if (formData.verificationCode.length !== 6) {
        setError('Kode verifikasi harus 6 digit');
        return false;
      }
    } else {
      if (!formData.username.trim() && !formData.email.trim() && !formData.phoneNumber.trim()) {
        setError('Username, email, atau nomor telepon harus diisi');
        return false;
      }
      if (!formData.password && mode === 'login') {
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

  // Phone authentication functions
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate phone number
      if (!formData.phoneNumber.trim()) {
        throw new Error('Nomor HP tidak boleh kosong');
      }

      // Setup reCAPTCHA if not already done
      if (!recaptchaRef.current) {
        const recaptcha = await UserSystem.setupRecaptcha('recaptcha-container');
        recaptchaRef.current = recaptcha;
      }

      // Send verification code
      const result = await UserSystem.sendPhoneVerification(formData.phoneNumber, recaptchaRef.current);
      
      if (result.success && result.confirmationResult) {
        setConfirmationResult(result.confirmationResult);
        setMode('verify');
      } else {
        throw new Error(result.error || 'Gagal mengirim kode verifikasi');
      }
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mengirim kode verifikasi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate verification code
      if (!formData.verificationCode.trim()) {
        throw new Error('Kode verifikasi tidak boleh kosong');
      }

      if (!confirmationResult) {
        throw new Error('Konfirmasi tidak ditemukan. Silakan kirim ulang kode.');
      }

      // Verify phone number
      const result = await UserSystem.verifyPhoneCode(confirmationResult, formData.verificationCode);
      
      if (result.success && result.user) {
        onSuccess(result.user);
      } else {
        throw new Error(result.error || 'Verifikasi gagal');
      }
    } catch (error: any) {
      setError(error.message || 'Kode verifikasi tidak valid');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = provider === 'google' 
        ? await UserSystem.loginWithGoogle()
        : await UserSystem.loginWithGitHub();
      
      if (result.success && result.user) {
        onSuccess(result.user);
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Setup reCAPTCHA
      const recaptcha = await UserSystem.setupRecaptcha('recaptcha-container');
      recaptchaRef.current = recaptcha;
      
      // Send verification code
      const result = await UserSystem.sendPhoneVerification(formData.phoneNumber, recaptcha);
      
      if (result.success && result.confirmationResult) {
        setConfirmationResult(result.confirmationResult);
        setMode('verify');
      } else {
        setError(result.error || 'Gagal mengirim kode verifikasi');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!validateForm() || !confirmationResult) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await UserSystem.verifyPhoneCode(
        confirmationResult,
        formData.verificationCode,
        {
          username: formData.username,
          displayName: formData.displayName
        }
      );
      
      if (result.success && result.user) {
        onSuccess(result.user);
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Kode verifikasi tidak valid');
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
      confirmPassword: '',
      phoneNumber: '',
      verificationCode: ''
    });
    setError(null);
    setConfirmationResult(null);
  };

  const switchMode = (newMode?: 'login' | 'register' | 'phone') => {
    if (newMode) {
      setMode(newMode);
    } else {
      setMode(mode === 'login' ? 'register' : 'login');
    }
    resetForm();
  };

  const handleModeSwitch = () => {
    switchMode();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-8 text-center border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-6"></div> {/* Spacer */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {mode === 'login' ? 'Selamat Datang' : 'Bergabung'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {mode === 'login' 
              ? 'Masuk untuk melanjutkan perjalanan inspirasi Anda' 
              : 'Mari mulai perjalanan inspirasi bersama'}
          </p>
        </div>

        <div className="p-8">
          {/* OAuth Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {mode === 'login' ? 'Masuk' : 'Daftar'} dengan Google
            </button>
            
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {mode === 'login' ? 'Masuk' : 'Daftar'} dengan GitHub
            </button>

            <button
              onClick={() => setMode('phone')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Masuk dengan Nomor HP
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">atau</span>
            </div>
          </div>

          {/* Form */}
          {mode === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handlePhoneInputChange}
                  placeholder="+62 812 3456 7890"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  disabled={loading}
                />
              </div>

              {/* reCAPTCHA container */}
              <div id="recaptcha-container"></div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {loading ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Kembali ke Login
              </button>
            </form>
          ) : mode === 'verify' ? (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kode Verifikasi
                </label>
                <input
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handlePhoneInputChange}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-center text-lg tracking-widest"
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>

              {/* Back to Phone Input */}
              <button
                type="button"
                onClick={() => setMode('phone')}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Kirim Ulang Kode
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username/Email for Login, Username for Register */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {mode === 'login' ? 'Username, Email, atau Nomor HP' : 'Username'}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={mode === 'login' ? 'Masukkan username atau email' : 'Pilih username unik'}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
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
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  disabled={loading}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'login' ? 'Sedang masuk...' : 'Sedang mendaftar...'}
                </>
              ) : (
                mode === 'login' ? 'Masuk' : 'Daftar'
              )}
            </button>
          </form>
          )}

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
              {' '}
              <button
                type="button"
                onClick={handleModeSwitch}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                disabled={loading}
              >
                {mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}
              </button>
            </p>
          </div>

          {/* Demo Account Info */}
          {mode === 'login' && (
            <div className="mt-4">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-blue-800 dark:text-blue-300 text-xs text-center">
                  <strong>Demo:</strong> Username: <code className="bg-white dark:bg-gray-800 px-1 rounded">demo</code>, Password: <code className="bg-white dark:bg-gray-800 px-1 rounded">demo123</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
