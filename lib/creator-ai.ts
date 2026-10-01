export type CreatorAIResult = {
  title: string;
  hook: string;
  caption: string;
  suggestions: string[];
};

const clean = (value: string) => value.trim().replace(/\s+/g, " ");

export function creatorAI(prompt: string): CreatorAIResult {
  const input = clean(prompt);
  const lower = input.toLowerCase();

  if (lower.includes("car") || lower.includes("drive")) {
    return {
      title: "This drive was NOT what I expected",
      hook: "Wait until you see what happens on this drive...",
      caption: "Late-night drive, clean shots, and a moment worth replaying. 🚗",
      suggestions: ["Open with the best car shot", "Cut dead air between clips", "Add quick zooms on transitions", "End on the strongest reveal"],
    };
  }

  if (lower.includes("gaming") || lower.includes("roblox") || lower.includes("lifesim")) {
    return {
      title: "I Built This Game From Scratch",
      hook: "I gave myself one goal: build a whole world from scratch.",
      caption: "Building a game is way harder than it looks. Here is the progress so far.",
      suggestions: ["Start with the finished result", "Show a fast before/after", "Keep build footage moving", "Finish with the next feature"],
    };
  }

  return {
    title: "You Need to See This",
    hook: "Here is the part nobody talks about...",
    caption: "A quick look behind the scenes. More coming soon.",
    suggestions: ["Start with the strongest moment", "Remove pauses", "Use short visual changes every few seconds", "End with a clear reason to keep watching"],
  };
}
