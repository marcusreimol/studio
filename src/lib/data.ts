
export type Demand = {
  id: string;
  title: string;
  category: string;
  location: string;
  author: string;
  postedAt: string;
  proposals: number;
  description: string;
  safetyConcerns: string[];
};

// This is mock data. The application should use Firestore as the source of truth.
export const demands: Demand[] = [];


export type Provider = {
    id: string;
    name: string;
    category: string;
    rating: number;
    location: string;
    logo: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    facebook?: string;
};

// This is mock data. The application should use Firestore as the source of truth.
export const providers: Provider[] = [];
