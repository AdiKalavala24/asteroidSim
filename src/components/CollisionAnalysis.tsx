
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Calculator, Zap } from 'lucide-react';
import { Asteroid, CollisionAnalysis as CollisionAnalysisType } from '@/types/asteroid';

interface CollisionAnalysisProps {
  asteroid: Asteroid;
  onAnalysisComplete: (analysis: CollisionAnalysisType) => void;
}

export const CollisionAnalysis: React.FC<CollisionAnalysisProps> = ({
  asteroid,
  onAnalysisComplete
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<CollisionAnalysisType | null>(null);

  const calculateCollisionProbability = async () => {
    setAnalyzing(true);
    setProgress(0);

    // Simulate analysis progress
    const progressSteps = [10, 25, 40, 60, 80, 95, 100];
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(step);
    }

    // Calculate collision analysis based on orbital parameters
    const closestApproach = asteroid.close_approach_data[0];
    const missDistance = parseFloat(closestApproach.miss_distance.kilometers);
    const velocity = parseFloat(closestApproach.relative_velocity.kilometers_per_second);
    const diameter = (asteroid.diameter.estimated_diameter_min + asteroid.diameter.estimated_diameter_max) / 2;
    
    // Earth's radius is ~6,371 km
    const earthRadius = 6371;
    
    // Simplified collision probability calculation
    // Based on miss distance, orbital uncertainty, and gravitational effects
    let probability = 0;
    let willCollide = false;
    
    if (missDistance < earthRadius * 2) {
      // Very close approach - high probability
      probability = Math.max(0.1, 1 - (missDistance / (earthRadius * 10)));
      willCollide = missDistance < earthRadius * 1.5;
    } else if (missDistance < earthRadius * 10) {
      // Close approach - moderate probability considering orbital uncertainty
      probability = Math.max(0.001, 0.1 - (missDistance / (earthRadius * 100)));
    } else {
      // Distant approach - very low probability
      probability = Math.max(0.0001, 0.01 - (missDistance / (earthRadius * 1000)));
    }

    // Factor in asteroid characteristics
    if (asteroid.is_potentially_hazardous_asteroid) {
      probability *= 2; // PHAs have higher uncertainty
    }

    // Calculate impact parameters
    const mass = (4/3) * Math.PI * Math.pow(diameter/2, 3) * 2500; // Assume density of 2.5 g/cm³
    const kineticEnergy = 0.5 * mass * Math.pow(velocity * 1000, 2); // Joules
    const craterSize = Math.pow(kineticEnergy / 1e15, 0.25) * 1000; // Simplified crater size
    const tsunamiRisk = diameter > 100 && willCollide; // Large asteroids can cause tsunamis

    const analysisResult: CollisionAnalysisType = {
      willCollide,
      probability: Math.min(probability, 0.95), // Cap at 95%
      timeToImpact: willCollide ? Date.now() + (Math.random() * 365 * 24 * 60 * 60 * 1000) : undefined,
      impactVelocity: velocity,
      kineticEnergy: kineticEnergy,
      tsunamiRisk,
      craterSize
    };

    setAnalysis(analysisResult);
    onAnalysisComplete(analysisResult);
    setAnalyzing(false);
  };

  useEffect(() => {
    calculateCollisionProbability();
  }, [asteroid]);

  const formatEnergy = (energy: number) => {
    if (energy > 1e18) {
      return `${(energy / 1e18).toFixed(1)} EJ`; // Exajoules
    } else if (energy > 1e15) {
      return `${(energy / 1e15).toFixed(1)} PJ`; // Petajoules
    } else if (energy > 1e12) {
      return `${(energy / 1e12).toFixed(1)} TJ`; // Terajoules
    }
    return `${(energy / 1e9).toFixed(1)} GJ`; // Gigajoules
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Calculator className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Collision Analysis</h2>
      </div>

      {analyzing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Analyzing orbital mechanics...</span>
            <span className="text-purple-400 font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Main Result */}
          <div className={`rounded-lg p-6 border-2 ${
            analysis.willCollide 
              ? 'bg-red-900/30 border-red-500' 
              : 'bg-green-900/30 border-green-500'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              {analysis.willCollide && <AlertTriangle className="w-8 h-8 text-red-400" />}
              <div>
                <h3 className="text-xl font-bold">
                  {analysis.willCollide ? 'COLLISION DETECTED!' : 'Safe Passage'}
                </h3>
                <p className="text-slate-300">
                  Collision Probability: <span className="font-bold text-purple-400">
                    {(analysis.probability * 100).toFixed(4)}%
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h4 className="font-bold text-white">Impact Velocity</h4>
              </div>
              <p className="text-2xl font-bold text-yellow-400">
                {analysis.impactVelocity?.toFixed(1)} km/s
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2">Kinetic Energy</h4>
              <p className="text-2xl font-bold text-orange-400">
                {formatEnergy(analysis.kineticEnergy || 0)}
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2">Crater Size</h4>
              <p className="text-2xl font-bold text-red-400">
                {analysis.craterSize?.toFixed(1)} km
              </p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-bold text-white mb-3">Risk Assessment</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Tsunami Risk:</span>
                <span className={`font-bold ${analysis.tsunamiRisk ? 'text-red-400' : 'text-green-400'}`}>
                  {analysis.tsunamiRisk ? 'HIGH' : 'LOW'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Global Impact:</span>
                <span className={`font-bold ${
                  (analysis.kineticEnergy || 0) > 1e18 ? 'text-red-400' : 
                  (analysis.kineticEnergy || 0) > 1e15 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {(analysis.kineticEnergy || 0) > 1e18 ? 'EXTINCTION LEVEL' : 
                   (analysis.kineticEnergy || 0) > 1e15 ? 'REGIONAL' : 'LOCAL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
