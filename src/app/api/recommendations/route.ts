import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { newRecipe, savedRecipes, existing } = await req.json();

    const existingTitles = [...savedRecipes.map((r: any) => r.title), ...existing.map((r: any) => r.title)].join(", ");

    const savedSummary = savedRecipes.map((r: any) => `${r.title} (${r.cuisine}, tags: ${r.tags?.join(", ")})`).join("\n");

    const prompt = newRecipe
      ? `A user just added "${newRecipe.title}" (${newRecipe.cuisine}, tags: ${newRecipe.tags?.join(", ")}) to their recipe collection.

Their full collection:
${savedSummary}

Suggest 2 recipes they would genuinely enjoy, similar in cuisine or flavour profile to what they already cook. Be specific and relevant — not generic beginner recipes.`
      : `A user has the following recipes in their collection:
${savedSummary}

Suggest 3 recipes they would genuinely enjoy based on their taste profile. Match their cuisines and flavour preferences — not generic beginner recipes.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `${prompt}

Do NOT suggest any of these already saved/suggested recipes: ${existingTitles}

Return ONLY a JSON array with no other text. Each recipe must have:
- title (string)
- description (string, 1-2 sentences)
- cuisine (string)
- tags (array of strings, 2-4 tags)
- prepTime (number, minutes)
- cookTime (number, minutes)
- servings (number)
- ingredients (array of {amount, unit, name})
- steps (array of strings)`,
        },
      ],
    });

    const text = (message.content[0] as any).text;
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const recipes = JSON.parse(cleaned);
    return NextResponse.json({ recipes });
  } catch (e) {
    console.error("Recommendations error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
