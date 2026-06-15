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
}

export interface CookLog {
  recipeId: string;
  cookedAt: string;
  notes?: string;
}
