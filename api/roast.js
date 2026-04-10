import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { product } = req.body;
  if (!product || product.length > 300) {
    return res.status(400).json({ error: "Give me a product and price (max 300 chars)" });
  }

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: product,
        },
      ],
      system: `You are a brutally honest shopping advisor. The user will paste a product and price. Your job:

1. Rate the deal 1-10 (1 = robbery, 10 = stealing)
2. Give a savage one-liner verdict
3. One short paragraph explaining why, with a specific cheaper alternative if it's a bad deal, or why it's actually worth it if it's good

Rules:
- Be funny and blunt. Think "your brutally honest friend who actually knows prices"
- Use real price references when possible
- If it's overpriced, name a specific cheaper alternative
- If it's a great deal, hype them up
- Keep it SHORT. Under 100 words total.
- Format: start with "SCORE/10" on its own line, then the roast

Examples of tone:
- "3/10 — You're paying a convenience tax. The Anker version does the same thing for $12."
- "9/10 — Run. Don't walk. This is literally cheaper than the refurbished price."
- "5/10 — It's fine. You won't cry about it but you won't brag about it either."`,
        },
      ],
    });

    const text = msg.content[0]?.text || "I'm speechless. And not in a good way.";
    return res.status(200).json({ roast: text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Brain exploded. Try again." });
  }
}
