export interface Part {
  id: string
  name: string
  category: string
  replacementCount: number
  reliability: number
  estimatedLifespan: number
  costHistory: number[]
}

export interface Service {
  id: string
  vehicleId: string
  date: Date
  type: 'maintenance' | 'repair' | 'inspection' | 'cleaning'
  description: string
  partsReplaced: Part[]
  cost: number
  mileageAtService: number
  notes?: string
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  licensePlate: string
  mileage: number
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  color?: string
  purchaseDate: Date
  services: Service[]
  healthScore: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  vehicles: Vehicle[]
}

// Dummy Parts Data
export const dummyParts: Part[] = [
  {
    id: 'part1',
    name: 'Engine Oil Filter',
    category: 'Maintenance',
    replacementCount: 8,
    reliability: 95,
    estimatedLifespan: 12,
    costHistory: [15, 15, 16, 15, 16, 15, 17, 15],
  },
  {
    id: 'part2',
    name: 'Brake Pads',
    category: 'Safety',
    replacementCount: 3,
    reliability: 88,
    estimatedLifespan: 50000,
    costHistory: [120, 135, 128],
  },
  {
    id: 'part3',
    name: 'Air Filter',
    category: 'Maintenance',
    replacementCount: 4,
    reliability: 92,
    estimatedLifespan: 24,
    costHistory: [25, 26, 25, 27],
  },
  {
    id: 'part4',
    name: 'Battery',
    category: 'Electrical',
    replacementCount: 1,
    reliability: 85,
    estimatedLifespan: 48,
    costHistory: [180],
  },
  {
    id: 'part5',
    name: 'Transmission Fluid',
    category: 'Maintenance',
    replacementCount: 2,
    reliability: 91,
    estimatedLifespan: 60,
    costHistory: [90, 95],
  },
];

// Dummy Services Data
export const dummyServices: Service[] = [
  {
    id: 'svc1',
    vehicleId: 'veh1',
    date: new Date('2024-12-15'),
    type: 'maintenance',
    description: 'Regular oil change and filter replacement',
    partsReplaced: [dummyParts[0], dummyParts[2]],
    cost: 85,
    mileageAtService: 45230,
    notes: 'Vehicle in excellent condition',
  },
  {
    id: 'svc2',
    vehicleId: 'veh1',
    date: new Date('2024-10-22'),
    type: 'inspection',
    description: 'Annual safety inspection',
    partsReplaced: [],
    cost: 150,
    mileageAtService: 44100,
    notes: 'All safety checks passed',
  },
  {
    id: 'svc3',
    vehicleId: 'veh1',
    date: new Date('2024-08-10'),
    type: 'repair',
    description: 'Brake pad replacement',
    partsReplaced: [dummyParts[1]],
    cost: 320,
    mileageAtService: 42500,
    notes: 'Replaced front and rear brake pads',
  },
  {
    id: 'svc4',
    vehicleId: 'veh1',
    date: new Date('2024-06-05'),
    type: 'maintenance',
    description: 'Transmission fluid change',
    partsReplaced: [dummyParts[4]],
    cost: 200,
    mileageAtService: 40800,
    notes: 'Smooth shifting after service',
  },
  {
    id: 'svc5',
    vehicleId: 'veh2',
    date: new Date('2024-11-30'),
    type: 'maintenance',
    description: 'Battery replacement',
    partsReplaced: [dummyParts[3]],
    cost: 280,
    mileageAtService: 78500,
    notes: 'New battery installed',
  },
];

// Dummy Vehicles Data
export const dummyVehicles: Vehicle[] = [
  {
    id: 'veh1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2019,
    licensePlate: 'ABC-1234',
    mileage: 45230,
    fuelType: 'petrol',
    color: 'Silver',
    purchaseDate: new Date('2019-03-15'),
    services: dummyServices.filter(s => s.vehicleId === 'veh1'),
    healthScore: 92,
  },
  {
    id: 'veh2',
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    licensePlate: 'XYZ-5678',
    mileage: 78500,
    fuelType: 'hybrid',
    color: 'Blue',
    purchaseDate: new Date('2020-07-20'),
    services: dummyServices.filter(s => s.vehicleId === 'veh2'),
    healthScore: 85,
  },
  {
    id: 'veh3',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2022,
    licensePlate: 'ELC-9012',
    mileage: 32100,
    fuelType: 'electric',
    color: 'Black',
    purchaseDate: new Date('2022-01-10'),
    services: [],
    healthScore: 98,
  },
];

// Dummy User Data
export const dummyUser: User = {
  id: 'user1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  vehicles: dummyVehicles,
};

// Analytics Data
export const costTrendData = [
  { month: 'Jan', cost: 150, services: 1 },
  { month: 'Feb', cost: 280, services: 2 },
  { month: 'Mar', cost: 200, services: 1 },
  { month: 'Apr', cost: 420, services: 3 },
  { month: 'May', cost: 180, services: 1 },
  { month: 'Jun', cost: 350, services: 2 },
  { month: 'Jul', cost: 240, services: 1 },
  { month: 'Aug', cost: 500, services: 2 },
  { month: 'Sep', cost: 320, services: 2 },
  { month: 'Oct', cost: 150, services: 1 },
  { month: 'Nov', cost: 280, services: 2 },
  { month: 'Dec', cost: 85, services: 1 },
];

export const serviceFrequencyData = [
  { type: 'maintenance', count: 8, fill: '#14b8a6' },
  { type: 'repair', count: 3, fill: '#06b6d4' },
  { type: 'inspection', count: 4, fill: '#0891b2' },
  { type: 'cleaning', count: 2, fill: '#0d9488' },
];

export const partReliabilityData = dummyParts.map(part => ({
  name: part.name,
  reliability: part.reliability,
  replacements: part.replacementCount,
}));

export const drivingHabitsData = [
  { habit: 'City Driving', percentage: 65 },
  { habit: 'Highway Driving', percentage: 25 },
  { habit: 'Heavy Traffic', percentage: 10 },
];

export const vehicleHealthData = [
  { month: 'Jan', health: 85 },
  { month: 'Feb', health: 87 },
  { month: 'Mar', health: 86 },
  { month: 'Apr', health: 88 },
  { month: 'May', health: 89 },
  { month: 'Jun', health: 88 },
  { month: 'Jul', health: 87 },
  { month: 'Aug', health: 89 },
  { month: 'Sep', health: 90 },
  { month: 'Oct', health: 91 },
  { month: 'Nov', health: 92 },
  { month: 'Dec', health: 92 },
];

export const alerts = [
  {
    id: 'alert1',
    vehicleId: 'veh1',
    type: 'warning',
    message: 'Brake pads wear at 75% - Schedule replacement soon',
    date: new Date('2024-12-20'),
  },
  {
    id: 'alert2',
    vehicleId: 'veh2',
    type: 'info',
    message: 'Regular maintenance due in 2 months',
    date: new Date('2024-12-18'),
  },
  {
    id: 'alert3',
    vehicleId: 'veh1',
    type: 'success',
    message: 'Oil change completed successfully',
    date: new Date('2024-12-15'),
  },
];
