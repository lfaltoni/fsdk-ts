// Experience listing types — shared contract between backend APIs and frontend consumers

/** Actual instructor/teacher assigned to an experience or slot (from Host model). */
export interface ExperienceHostSummary {
  id: number;
  name: string;
  bio: string;
  photo: string;
  languages: string[];
}

export interface ExperienceListingHost {
  displayName: string;
  avatarUrl: string;
  handle: string;
  logo: string;
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
  /** Raw price in AED fils (AED × 100). Use for currency-converted display. */
  priceCents: number | null;
  maxGuests: number;
  saleOff: string | null;
  isAds: string | null;
  map: { lat: number; lng: number };
  providerName?: string;
  /** Default instructor for this experience (from Host model). Null if none assigned. */
  defaultHost?: ExperienceHostSummary | null;
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

export interface TProviderProfile {
  id: number;
  displayName: string;
  avatarUrl: string;
  handle: string;
  description: string;
  country: string;
  state: string;
  logo: string;
  joinedDate: string;
  listingsCount: number;
  reviewsCount: number;
  rating: number;
  responseRate: number;
  responseTime: string;
  isSuperhost: boolean;
  isVerified: boolean;
  listings: TExperienceListing[];
  /** Provider's active hosts/instructors (for "Meet our team" section). */
  hosts: ExperienceHostSummary[];
}
