
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Asteroid } from '@/types/asteroid';
import { useToast } from '@/hooks/use-toast';

interface AsteroidSelectorProps {
  onAsteroidSelect: (asteroid: Asteroid | null) => void;
  selectedAsteroid: Asteroid | null;
}

export const AsteroidSelector: React.FC<AsteroidSelectorProps> = ({
  onAsteroidSelect,
  selectedAsteroid
}) => {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAsteroids = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get date range for the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      const response = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&api_key=DEMO_KEY`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch asteroid data');
      }
      
      const data = await response.json();
      const allAsteroids: Asteroid[] = [];
      
      // Flatten the asteroids from all dates
      Object.values(data.near_earth_objects).forEach((dayAsteroids: any) => {
        allAsteroids.push(...dayAsteroids);
      });
      
      // Sort by size (largest first) and take top 20
      const sortedAsteroids = allAsteroids
        .sort((a, b) => b.absolute_magnitude_h - a.absolute_magnitude_h)
        .slice(0, 20);
      
      setAsteroids(sortedAsteroids);
      console.log('Fetched asteroids:', sortedAsteroids.length);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error fetching asteroid data",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsteroids();
  }, []);

  const handleAsteroidSelect = (asteroidId: string) => {
    const asteroid = asteroids.find(a => a.id === asteroidId);
    onAsteroidSelect(asteroid || null);
  };

  const getAsteroidSize = (asteroid: Asteroid) => {
    const avgDiameter = (
      asteroid.diameter.estimated_diameter_min + 
      asteroid.diameter.estimated_diameter_max
    ) / 2;
    return avgDiameter.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Select an Asteroid</h2>
        <Button 
          onClick={fetchAsteroids} 
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh Data'
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-400 font-medium">Error loading asteroid data</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {asteroids.length > 0 && (
        <div className="space-y-4">
          <Select onValueChange={handleAsteroidSelect}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Choose an asteroid to analyze..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {asteroids.map((asteroid) => (
                <SelectItem 
                  key={asteroid.id} 
                  value={asteroid.id}
                  className="text-white hover:bg-slate-600"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{asteroid.name}</span>
                    <div className="flex items-center space-x-2 text-sm text-slate-300">
                      <span>~{getAsteroidSize(asteroid)}m</span>
                      {asteroid.is_potentially_hazardous_asteroid && (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedAsteroid && (
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-lg text-purple-400">{selectedAsteroid.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Diameter</p>
                  <p className="text-white font-medium">{getAsteroidSize(selectedAsteroid)}m</p>
                </div>
                <div>
                  <p className="text-slate-400">Hazardous</p>
                  <p className={`font-medium ${selectedAsteroid.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedAsteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Orbit Class</p>
                  <p className="text-white font-medium">{selectedAsteroid.orbital_data.orbit_class.orbit_class_type}</p>
                </div>
                <div>
                  <p className="text-slate-400">Approaches</p>
                  <p className="text-white font-medium">{selectedAsteroid.close_approach_data.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
