
import React, { useState, useEffect } from 'react';
import { AsteroidSelector } from '@/components/AsteroidSelector';
import { CollisionAnalysis } from '@/components/CollisionAnalysis';
import { ImpactSimulation } from '@/components/ImpactSimulation';
import { Asteroid } from '@/types/asteroid';

const Index = () => {
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null);
  const [collisionData, setCollisionData] = useState<any>(null);
  const [showSimulation, setShowSimulation] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="relative z-10 p-6 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Asteroid Impact Simulator
        </h1>
        <p className="text-xl text-slate-300">
          Analyze near-Earth asteroids and simulate their potential impact on our planet
        </p>
      </header>

      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Asteroid Selection */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <AsteroidSelector
              onAsteroidSelect={setSelectedAsteroid}
              selectedAsteroid={selectedAsteroid}
            />
          </div>

          {/* Collision Analysis */}
          {selectedAsteroid && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 animate-fade-in">
              <CollisionAnalysis
                asteroid={selectedAsteroid}
                onAnalysisComplete={setCollisionData}
              />
            </div>
          )}

          {/* Impact Simulation */}
          {collisionData && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 animate-fade-in">
              <ImpactSimulation
                asteroid={selectedAsteroid}
                collisionData={collisionData}
                onStartSimulation={() => setShowSimulation(true)}
                showSimulation={showSimulation}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
