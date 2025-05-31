
export interface Asteroid {
  id: string;
  name: string;
  diameter: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
  close_approach_data: {
    epoch_date_close_approach: number;
    relative_velocity: {
      kilometers_per_second: string;
    };
    miss_distance: {
      kilometers: string;
    };
  }[];
  orbital_data: {
    orbit_class: {
      orbit_class_type: string;
      orbit_class_description: string;
    };
    inclination: string;
    eccentricity: string;
    semi_major_axis: string;
  };
  absolute_magnitude_h: number;
  is_potentially_hazardous_asteroid: boolean;
}

export interface CollisionAnalysis {
  willCollide: boolean;
  probability: number;
  timeToImpact?: number;
  impactVelocity?: number;
  kineticEnergy?: number;
  tsunamiRisk?: boolean;
  craterSize?: number;
}
