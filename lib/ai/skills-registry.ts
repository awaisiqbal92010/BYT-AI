import fs from "fs";
import path from "path";

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  instructions: string;
}

const SKILLS_DIR = path.join(process.cwd(), ".agents", "skills");

/**
 * Retrieves all available enterprise design & architecture skills.
 */
export function getAllAgentSkills(): AgentSkill[] {
  try {
    if (!fs.existsSync(SKILLS_DIR)) return [];

    const dirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
    const skills: AgentSkill[] = [];

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      const skillPath = path.join(SKILLS_DIR, dir.name, "SKILL.md");
      if (fs.existsSync(skillPath)) {
        const raw = fs.readFileSync(skillPath, "utf-8");
        const lines = raw.split("\n");
        let name = dir.name;
        let description = "";

        const descLine = lines.find((l) => l.startsWith("description:"));
        if (descLine) {
          description = descLine.replace("description:", "").trim();
        }

        const nameLine = lines.find((l) => l.startsWith("name:"));
        if (nameLine) {
          name = nameLine.replace("name:", "").trim();
        }

        skills.push({
          id: dir.name,
          name,
          description,
          instructions: raw,
        });
      }
    }

    return skills;
  } catch (err) {
    console.warn("[Skills Registry] Failed to scan skills directory:", err);
    return [];
  }
}

/**
 * Selects the top 3-5 relevant architecture/design skills based on the user's prompt.
 */
export function matchSkillsForPrompt(prompt: string): AgentSkill[] {
  const allSkills = getAllAgentSkills();
  const lower = prompt.toLowerCase();

  const matched = allSkills.filter((skill) => {
    const idKeywords = skill.id.split("-");
    const descKeywords = skill.description.toLowerCase().split(/\s+/);

    return (
      idKeywords.some((k) => k.length > 3 && lower.includes(k)) ||
      descKeywords.some((k) => k.length > 4 && lower.includes(k))
    );
  });

  // Always include modern web architecture and security as standard
  const defaults = allSkills.filter(
    (s) => s.id === "modern-web-architecture" || s.id === "security-xss-csrf-sanitization"
  );

  const combined = Array.from(new Set([...matched, ...defaults])).slice(0, 5);
  return combined;
}
