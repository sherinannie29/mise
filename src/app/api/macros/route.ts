import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { title, ingredients, servings } = await req.json();

    const ingredientList = ingredients
      .map((i: any) => `${i.amount} ${i.unit} ${i.name}`.trim())
      .join("\n");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Calculate the nutritional info per serving for this recipe.

Recipe: ${title}
Servings: ${servings}
Ingredients:
${ingredientList}

Return ONLY a JSON object with these fields (numbers only, per serving):
{"calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0}`,
        },
      ],
    });

    const text = (message.content[0] as any).text;
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const macros = JSON.parse(cleaned);
    return NextResponse.json(macros);
  } catch (e) {
    console.error("Macros error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
