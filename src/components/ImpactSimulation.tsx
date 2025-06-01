
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, MapPin, Zap } from 'lucide-react';
import { Asteroid, CollisionAnalysis } from '@/types/asteroid';

interface ImpactSimulationProps {
  asteroid: Asteroid | null;
  collisionData: CollisionAnalysis;
  onStartSimulation: () => void;
  showSimulation: boolean;
}

export const ImpactSimulation: React.FC<ImpactSimulationProps> = ({
  asteroid,
  collisionData,
  onStartSimulation,
  showSimulation
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationPhase, setSimulationPhase] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);

  // Predefined impact locations
  const impactLocations = [
    { name: 'Pacific Ocean', lat: 0, lng: -150, description: 'Deep ocean impact - massive tsunamis' },
    { name: 'Sahara Desert', lat: 23, lng: 10, description: 'Continental impact - global dust cloud' },
    { name: 'Atlantic Ocean', lat: 30, lng: -40, description: 'Atlantic impact - coastal devastation' },
    { name: 'Siberia', lat: 60, lng: 100, description: 'Remote land impact - limited casualties' },
    { name: 'Mediterranean Sea', lat: 35, lng: 15, description: 'Enclosed sea impact - regional effects' }
  ];

  const startSimulation = async (location: {lat: number, lng: number}) => {
    setSelectedLocation(location);
    setIsSimulating(true);
    onStartSimulation();

    // Simulation phases
    const phases = [
      'Asteroid entering atmosphere...',
      'Atmospheric compression heating...',
      'Impact imminent...',
      'IMPACT! Shockwave expanding...',
      'Crater formation...',
      'Debris ejection...',
      'Secondary effects spreading...',
      'Simulation complete.'
    ];

    for (let i = 0; i < phases.length; i++) {
      setSimulationPhase(phases[i]);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsSimulating(false);
  };

  const ImpactMap = () => {
    const [impactStarted, setImpactStarted] = useState(false);

    useEffect(() => {
      if (isSimulating && selectedLocation) {
        setImpactStarted(true);
      }
    }, [isSimulating, selectedLocation]);

    return (
      <div className="relative h-96 bg-gradient-to-b from-blue-900 to-blue-600 rounded-lg overflow-hidden">
        {/* World Map Visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Earth representation */}
            <div className="absolute inset-4 bg-gradient-to-br from-green-600 via-blue-500 to-blue-700 rounded-full shadow-2xl">
              {/* Continents simplified */}
              <div className="absolute top-8 left-0 w-16 h-12 bg-green-700 rounded-lg opacity-80"></div>
              <div className="absolute top-16 right-16 w-12 h-8 bg-green-700 rounded-lg opacity-80"></div>
              <div className="absolute bottom-12 left-8 w-20 h-10 bg-green-700 rounded-lg opacity-80"></div>
              
              {/* Impact locations */}
              {impactLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => startSimulation({lat: location.lat, lng: location.lng})}
                  disabled={isSimulating}
                  className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white 
                           hover:bg-red-400 hover:scale-125 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    left: `${50 + (location.lng / 180) * 30}%`,
                    top: `${50 - (location.lat / 90) * 30}%`
                  }}
                  title={location.description}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                                bg-slate-800 text-white px-2 py-1 rounded text-xs
                                opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                    {location.name}
                  </div>
                </button>
              ))}

              {/* Impact animation */}
              {impactStarted && selectedLocation && (
                <div 
                  className="absolute w-4 h-4"
                  style={{
                    left: `${50 + (selectedLocation.lng / 180) * 30}%`,
                    top: `${50 - (selectedLocation.lat / 90) * 30}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Expanding shockwave */}
                  <div className="absolute inset-0 animate-ping">
                    <div className="w-4 h-4 bg-orange-500 rounded-full opacity-75"></div>
                  </div>
                  <div className="absolute inset-0 animate-pulse">
                    <div className="w-8 h-8 bg-red-500 rounded-full opacity-50 -m-2"></div>
                  </div>
                  <div className="absolute inset-0 animate-bounce">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full opacity-25 -m-4"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simulation overlay */}
        {isSimulating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-white animate-pulse">
                {simulationPhase}
              </div>
              <div className="flex space-x-2 justify-center">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <MapPin className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Impact Simulation</h2>
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4">
        <h3 className="font-bold text-lg mb-3 text-purple-400">Select Impact Location</h3>
        <p className="text-slate-300 mb-4">
          Click on a red marker to simulate the asteroid impact at that location.
        </p>
        
        <ImpactMap />
      </div>

      {selectedLocation && (
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3 text-orange-400">Impact Effects</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-bold text-white">Immediate</h4>
              <p className="text-sm text-slate-300">
                Crater: {collisionData.craterSize?.toFixed(1)} km diameter
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-2"></div>
              <h4 className="font-bold text-white">Regional</h4>
              <p className="text-sm text-slate-300">
                Shockwave extends {(collisionData.craterSize || 0 * 10).toFixed(0)} km
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"></div>
              <h4 className="font-bold text-white">Global</h4>
              <p className="text-sm text-slate-300">
                {collisionData.tsunamiRisk ? 'Tsunami waves' : 'Atmospheric effects'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <Button 
          onClick={() => {
            if (!selectedLocation) {
              startSimulation(impactLocations[0]);
            }
          }}
          disabled={isSimulating}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
        >
          <Play className="w-5 h-5 mr-2" />
          {isSimulating ? 'Simulating Impact...' : 'Start Random Impact Simulation'}
        </Button>
      </div>
    </div>
  );
};
