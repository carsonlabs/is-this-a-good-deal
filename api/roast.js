// Zero-cost roast engine. No API keys. Pure chaos.

const ROAST_TEMPLATES = {
  steal: [
    "Run. Don't walk. This is the kind of deal people lie about finding.",
    "You'd be losing money by NOT buying this. That's not how math works but here we are.",
    "This is cheaper than it has any right to be. The manufacturer is having a bad day and that's your gain.",
    "Someone priced this wrong and you should exploit that before they fix it.",
    "This deal is so good it's suspicious. Check the return policy just in case.",
  ],
  great: [
    "Solid deal. Not life-changing, but your wallet won't ghost you over this.",
    "This is the sweet spot — you're paying for quality without the stupidity tax.",
    "Fair price for what you're getting. You'll forget you even paid for it, which is the best compliment.",
    "Good enough that you won't check the price again in two weeks and feel pain.",
    "This is what a reasonable purchase looks like. Screenshot this for future you.",
  ],
  mid: [
    "It's fine. You won't cry about it but you won't brag about it either.",
    "This is the beige of deals. Functional. Forgettable. You could do worse.",
    "Meh. It's not a scam but it's not a story you tell at dinner either.",
    "The price is whatever. You're paying for convenience and mild satisfaction.",
    "This deal has the energy of a 3-star Uber ride. It got the job done.",
  ],
  bad: [
    "You're paying a convenience tax. Search for 5 more minutes and save 30%.",
    "This is 'I don't feel like comparing prices' money. Respect the honesty, question the decision.",
    "Your future self is going to see this on sale next month and sigh loudly.",
    "This is the price people pay when they shop tired. Take a nap first.",
    "Someone is making great margins on you right now and they're grateful.",
  ],
  robbery: [
    "This is priced like it comes with a personal apology from the CEO. It doesn't.",
    "You're not buying a product, you're funding someone's boat payment.",
    "This price has 'we know you'll pay it anyway' energy.",
    "For this money you could buy the cheaper version AND take yourself to dinner.",
    "This is highway robbery but the highway has nice lighting and a Spotify playlist.",
  ],
};

const CATEGORY_HINTS = {
  apple: { bias: -1, tag: "You're paying the Apple tax and you know it." },
  macbook: { bias: -1, tag: "The logo adds $300. You already knew that." },
  iphone: { bias: -1, tag: "They could charge $2,000 and people would still line up." },
  airpods: { bias: 0, tag: "The knockoffs are 80% as good for 20% of the price. But you want the real ones." },
  dyson: { bias: -1, tag: "It's a vacuum/fan/hairdryer with a marketing budget bigger than some countries." },
  tesla: { bias: 0, tag: "The car is fine. The Twitter drama is free." },
  samsung: { bias: 1, tag: "At least it's not the Apple price." },
  costco: { bias: 2, tag: "Costco doesn't miss. The $1.50 hot dog energy extends to everything they sell." },
  ikea: { bias: 1, tag: "Cheap, functional, and you'll feel accomplished after assembling it." },
  lululemon: { bias: -2, tag: "You're paying yoga studio prices for pants. They are nice pants though." },
  nike: { bias: 0, tag: "You're buying the swoosh as much as the shoe." },
  amazon: { bias: 1, tag: "Check the reviews. If there are 50,000 five-star reviews it's probably fine. Or fake." },
  walmart: { bias: 1, tag: "Budget king. No shame in that game." },
  gucci: { bias: -3, tag: "You're not buying quality, you're buying permission to feel fancy." },
  louis: { bias: -3, tag: "You could buy a used car. But this bag won't depreciate as fast, so... touché." },
  supreme: { bias: -3, tag: "A brick. They sold a brick. And people bought it." },
  rolex: { bias: -1, tag: "It tells time. So does your phone. But your phone won't impress anyone at dinner." },
  gaming: { bias: 0, tag: "The setup is never done. You'll 'need' something else in 3 months." },
  subscription: { bias: -1, tag: "Another monthly payment to forget about until you check your statement." },
  saas: { bias: -1, tag: "You'll use it for 2 months then it becomes a recurring donation." },
  crypto: { bias: -2, tag: "It's either the best or worst decision you'll ever make. No in between." },
  course: { bias: -2, tag: "The information is probably free on YouTube. You're paying for structure and guilt." },
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractPrice(text) {
  const match = text.match(/\$[\d,]+\.?\d*/);
  if (!match) return null;
  return parseFloat(match[0].replace(/[$,]/g, ""));
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_HINTS)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

function getScore(price, category) {
  // Base score from price psychology
  let score;
  if (price === null) {
    score = Math.floor(Math.random() * 4) + 4; // 4-7 if we can't parse
  } else if (price < 5) {
    score = 9;
  } else if (price < 15) {
    score = 8;
  } else if (price < 30) {
    score = 7;
  } else if (price < 75) {
    score = 6;
  } else if (price < 150) {
    score = 5;
  } else if (price < 300) {
    score = 5;
  } else if (price < 500) {
    score = 4;
  } else if (price < 1000) {
    score = 4;
  } else if (price < 2000) {
    score = 3;
  } else {
    score = 2;
  }

  // Category bias
  if (category) {
    score = Math.max(1, Math.min(10, score + category.bias));
  }

  // Add some randomness (+/- 1)
  score = Math.max(1, Math.min(10, score + (Math.random() > 0.5 ? 1 : -1)));

  return score;
}

function getRoast(score, category) {
  let tier;
  if (score >= 9) tier = "steal";
  else if (score >= 7) tier = "great";
  else if (score >= 5) tier = "mid";
  else if (score >= 3) tier = "bad";
  else tier = "robbery";

  let roast = pick(ROAST_TEMPLATES[tier]);
  if (category) {
    roast += " " + category.tag;
  }
  return `${score}/10 — ${roast}`;
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { product } = req.body;
  if (!product || product.length > 300) {
    return res.status(400).json({ error: "Give me a product and price (max 300 chars)" });
  }

  const price = extractPrice(product);
  const category = detectCategory(product);
  const score = getScore(price, category);
  const roast = getRoast(score, category);

  return res.status(200).json({ roast });
}
