// Experience slot types — shared contract between backend API and frontend consumers

export interface ExperienceSlot {
  id: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  duration: number; // minutes
  formattedTime: string; // "10:00 AM"
  formattedDuration: string; // "2h"
  price: number; // dollars
  formattedPrice: string; // "$50.00"
  maxCapacity: number;
  remainingSpots: number;
}
