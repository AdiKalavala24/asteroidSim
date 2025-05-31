
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
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
    setOpen(false);
  };

  const getAsteroidSize = (asteroid: Asteroid) => {
    const avgDiameter = (
      asteroid.estimated_diameter.kilometers.estimated_diameter_min + 
      asteroid.estimated_diameter.kilometers.estimated_diameter_max
    ) / 2;
    return avgDiameter.toFixed(1);
  };

  const getClosestApproachDistance = (asteroid: Asteroid) => {
    if (!asteroid.close_approach_data || asteroid.close_approach_data.length === 0) {
      return 'Unknown';
    }
    
    // Get the closest approach (smallest miss distance)
    const closestApproach = asteroid.close_approach_data.reduce((closest, current) => {
      const closestDistance = parseFloat(closest.miss_distance.kilometers);
      const currentDistance = parseFloat(current.miss_distance.kilometers);
      return currentDistance < closestDistance ? current : closest;
    });
    
    const distanceKm = parseFloat(closestApproach.miss_distance.kilometers);
    
    // Format distance for readability
    if (distanceKm > 1000000) {
      return `${(distanceKm / 1000000).toFixed(1)}M km`;
    } else if (distanceKm > 1000) {
      return `${(distanceKm / 1000).toFixed(0)}K km`;
    } else {
      return `${distanceKm.toFixed(0)} km`;
    }
  };

  const filteredAsteroids = asteroids.filter(asteroid =>
    asteroid.name.toLowerCase().includes(searchValue.toLowerCase())
  );

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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                {selectedAsteroid
                  ? selectedAsteroid.name
                  : "Choose an asteroid to analyze..."}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-slate-700 border-slate-600" align="start">
              <Command className="bg-slate-700">
                <CommandInput 
                  placeholder="Search asteroids..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                  className="text-white"
                />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty className="text-slate-300">No asteroid found.</CommandEmpty>
                  <CommandGroup>
                    {filteredAsteroids.map((asteroid) => (
                      <CommandItem
                        key={asteroid.id}
                        value={asteroid.id}
                        onSelect={() => handleAsteroidSelect(asteroid.id)}
                        className="text-white hover:bg-slate-600 cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium">{asteroid.name}</span>
                            <span className="text-xs text-slate-400">
                              {getAsteroidSize(asteroid)}km diameter • {getClosestApproachDistance(asteroid)} from Earth
                            </span>
                          </div>
                          {asteroid.is_potentially_hazardous_asteroid && (
                            <AlertTriangle className="w-4 h-4 text-red-400 ml-2" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedAsteroid && (
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-lg text-purple-400">{selectedAsteroid.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Diameter</p>
                  <p className="text-white font-medium">{getAsteroidSize(selectedAsteroid)}km</p>
                </div>
                <div>
                  <p className="text-slate-400">Closest Distance</p>
                  <p className="text-white font-medium">{getClosestApproachDistance(selectedAsteroid)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Hazardous</p>
                  <p className={`font-medium ${selectedAsteroid.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedAsteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
                  </p>
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
