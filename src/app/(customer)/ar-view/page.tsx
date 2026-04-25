'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ARMascot } from '@/components/customer/ARMascot';
import { VisionLens } from '@/components/customer/VisionLens';
import { IngredientGame } from '@/components/customer/IngredientGame';

export default function ARView() {
  const [activeTab, setActiveTab] = useState<'mascot' | 'vision' | 'game'>('mascot');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">🎮 AR Menu Explorer</h1>
        <p className="text-gray-600 mt-2">
          Experience dining with AI, AR, and gamification
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Button
          variant={activeTab === 'mascot' ? 'default' : 'outline'}
          onClick={() => setActiveTab('mascot')}
          className="flex items-center gap-2"
        >
          🤖 AI Mascot
        </Button>
        <Button
          variant={activeTab === 'vision' ? 'default' : 'outline'}
          onClick={() => setActiveTab('vision')}
          className="flex items-center gap-2"
        >
          📸 Vision Lens
        </Button>
        <Button
          variant={activeTab === 'game' ? 'default' : 'outline'}
          onClick={() => setActiveTab('game')}
          className="flex items-center gap-2"
        >
          🎯 Catch Game
        </Button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'mascot' && <ARMascot />}
        {activeTab === 'vision' && <VisionLens />}
        {activeTab === 'game' && <IngredientGame />}
      </div>
    </div>
  );
}
