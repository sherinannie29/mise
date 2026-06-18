export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  imageUrl?: string;
  createdAt: string;
  cooked: number; // times cooked
  isPrivate?: boolean;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
}

export interface CookLog {
  recipeId: string;
  cookedAt: string;
  notes?: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "pending" | "accepted";
  createdAt: string;
  profile?: Profile;
}
