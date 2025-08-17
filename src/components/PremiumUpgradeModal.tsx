/**
 * Premium Upgrade Modal - Phase 5
 * Beautiful modal for upgrading to premium subscriptions
 * Date: August 17, 2025
 */

'use client';

import React, { useState } from 'react';
import { PremiumTier, PremiumUpgradeModalProps } from '../types/phase5';
import PremiumService from '../lib/premiumService';

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  featureRequested,
  onUpgrade
}) => {
  const [selectedTier, setSelectedTier] = useState<PremiumTier['id']>('premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnnualDiscount, setShowAnnualDiscount] = useState(true);

  const premiumService = PremiumService.getInstance();
  const tiers = premiumService.getPremiumTiers().filter(tier => tier.id !== 'free');

  const handleUpgrade = async (tierId: PremiumTier['id']) => {
    setIsProcessing(true);
    try {
      // Simulate upgrade process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onUpgrade(tierId);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const TierCard: React.FC<{ tier: PremiumTier; isPopular?: boolean }> = ({ tier, isPopular }) => (
    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl ${
      selectedTier === tier.id 
        ? 'border-blue-500 shadow-lg scale-105' 
        : 'border-gray-200 dark:border-gray-700'
    } ${isPopular ? 'ring-2 ring-purple-500' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            🔥 MOST POPULAR
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {tier.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {tier.description}
        </p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatPrice(showAnnualDiscount ? tier.price.yearly / 12 : tier.price.monthly)}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">/bulan</span>
        </div>
        {showAnnualDiscount && tier.price.yearly < tier.price.monthly * 12 && (
          <div className="mt-2">
            <span className="text-green-600 font-semibold">
              Hemat {formatPrice((tier.price.monthly * 12) - tier.price.yearly)} per tahun!
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <span className="text-2xl mr-3">{feature.icon}</span>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {feature.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white">Limits:</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>📝 Quote harian: {tier.limits.dailyQuotes === -1 ? 'Unlimited' : tier.limits.dailyQuotes}</div>
          <div>🤖 AI request: {tier.limits.aiRequests === -1 ? 'Unlimited' : `${tier.limits.aiRequests}/hari`}</div>
          <div>🎨 Custom themes: {tier.limits.customThemes === -1 ? 'Unlimited' : tier.limits.customThemes}</div>
          <div>📊 Analytics history: {tier.limits.analyticsHistory} hari</div>
        </div>
      </div>

      <button
        onClick={() => setSelectedTier(tier.id)}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
          selectedTier === tier.id
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {selectedTier === tier.id ? '✓ Dipilih' : 'Pilih Plan'}
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              🚀 Upgrade ke Premium
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Unlock fitur-fitur canggih untuk pengalaman inspirasi yang tak terbatas
            </p>
            {featureRequested && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  🔒 Fitur <strong>{featureRequested}</strong> membutuhkan upgrade premium
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <span className={`mr-3 ${!showAnnualDiscount ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
              Bulanan
            </span>
            <button
              onClick={() => setShowAnnualDiscount(!showAnnualDiscount)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showAnnualDiscount ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showAnnualDiscount ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${showAnnualDiscount ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
              Tahunan
            </span>
            {showAnnualDiscount && (
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                💰 HEMAT 30%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {tiers.map((tier, index) => (
              <TierCard 
                key={tier.id} 
                tier={tier} 
                isPopular={tier.id === 'premium'}
              />
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            🔥 Yang Akan Anda Dapatkan
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🚀</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Unlimited Access</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Akses tak terbatas ke semua quote dan fitur premium
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🤖</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">AI Powered</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fitur AI canggih untuk pencarian dan rekomendasi personal
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎨</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Personalization</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kustomisasi tema dan pengalaman sesuai preferensi Anda
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Nanti Saja
            </button>
            <button
              onClick={() => handleUpgrade(selectedTier)}
              disabled={isProcessing || selectedTier === currentTier}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </div>
              ) : (
                `🚀 Upgrade ke ${tiers.find(t => t.id === selectedTier)?.name}`
              )}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Jaminan uang kembali 30 hari • Batal kapan saja • Tanpa komitmen
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
          <div className="flex justify-center items-center space-x-8">
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Instant Access</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🎯</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Cancel Anytime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">💎</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Premium Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgradeModal;
