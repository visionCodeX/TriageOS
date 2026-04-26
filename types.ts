/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Transitioning' | 'Offline';

export interface Bed {
  id: string;
  room: string;
  status: BedStatus;
  patientName?: string;
  acuity?: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
}

export interface ICUUnit {
  id: string;
  name: string;
  totalBeds: number;
  beds: Bed[];
}

export interface Hospital {
  id: string;
  name: string;
  distance: string;
  icuAvailability: number;
  totalIcuBeds: number;
  ventilatorsFree: number;
  staffLoad: number; // Percentage 0-100
  eta: string;
  contact: string;
  type: 'Trauma I' | 'Trauma II' | 'General';
  address: string;
}
