import type { InventoryItem } from '../types';

export const inventoryItems: InventoryItem[] = [
  { id: 1, name: 'Cement (50kg bags)',   stock: 450,   unit: 'bags',  minStock: 200,   unitCost: 380,   status: 'good' },
  { id: 2, name: 'Steel TMT Bars (12mm)', stock: 85,    unit: 'tons',  minStock: 100,   unitCost: 52000, status: 'low' },
  { id: 3, name: 'Bricks (Red Clay)',     stock: 15000, unit: 'pcs',   minStock: 10000, unitCost: 8,     status: 'good' },
  { id: 4, name: 'Sand (M-Sand)',         stock: 42,    unit: 'tons',  minStock: 50,    unitCost: 1200,  status: 'low' },
  { id: 5, name: 'Aggregates (20mm)',     stock: 78,    unit: 'tons',  minStock: 30,    unitCost: 1500,  status: 'good' },
  { id: 6, name: 'Paint (Exterior)',      stock: 25,    unit: 'ltrs',  minStock: 50,    unitCost: 450,   status: 'critical' },
  { id: 7, name: 'Tiles (Ceramic 2x2)',   stock: 850,   unit: 'sqft',  minStock: 500,   unitCost: 45,    status: 'good' },
  { id: 8, name: 'Electrical Wiring)',    stock: 320,   unit: 'mtrs',  minStock: 200,   unitCost: 25,    status: 'good' },
];
