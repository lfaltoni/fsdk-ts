// Experience listing types — shared contract between backend APIs and frontend consumers

export interface ExperienceListingHost {
  displayName: string;
  avatarUrl: string;
  handle: string;
}

export interface ExperienceListingHostDetail extends ExperienceListingHost {
  description: string;
  listingsCount: number;
  reviewsCount: number;
  rating: number;
  responseRate: number;
  responseTime: string;
  isSuperhost: boolean;
  isVerified: boolean;
  joinedDate: string;
  bio: string;
  languages: string[];
}

export interface TExperienceListing {
  id: string;
  title: string;
  handle: string;
  host: ExperienceListingHost;
  listingCategory: string;
  date: string;
  description: string;
  durationTime: string;
  languages: string[];
  featuredImage: string | null;
  galleryImgs: string[];
  like: boolean;
  address: string;
  reviewStart: number;
  reviewCount: number;
  price: string;
  maxGuests: number;
  saleOff: string | null;
  isAds: string | null;
  map: { lat: number; lng: number };
}

export interface TExperienceListingDetail extends TExperienceListing {
  host: ExperienceListingHostDetail;
  // About
  tagline: string;
  highlights: string[];
  suitableFor: string[];
  // Location
  locationType: string;
  venueDetails: string;
  arrivalInstructions: string;
  // Logistics
  groupSizeMin: number;
  durationMinutes: number;
  // Inclusions & Requirements
  whatsIncluded: string[];
  whatsNotIncluded: string[];
  requirements: string[];
  // Itinerary
  itinerary: { title: string; description: string; duration_minutes: number }[];
  // Pricing
  pricingType: string;
  priceCents: number | null;
  childPriceCents: number | null;
  childAgeMax: number | null;
  privateGroupPriceCents: number | null;
  // Accessibility & Age
  wheelchairAccessible: boolean;
  accessibilityNote: string | null;
  minAge: number | null;
  ageNote: string | null;
  // Policies
  cancellationPolicy: string;
  cancellationPolicyLabel: string;
  advanceBookingMinHours: number;
  instantBooking: boolean;
  privateBookingAvailable: boolean;
  // Display
  categoryLabel: string;
  tags: string[];
}
