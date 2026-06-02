import path from "node:path";
import fg from "fast-glob";

const LANG_BY_EXT: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".py": "Python",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".rb": "Ruby",
  ".php": "PHP",
  ".sql": "SQL",
};

export async function detectFolders(root: string) {
  const entries = await fg(["*"], {
    cwd: root,
    onlyDirectories: true,
    ignore: ["node_modules", "dist", "build", ".git", ".next", "coverage"],
  });
  const out: Array<{ path: string; fileCount: number }> = [];
  for (const dir of entries) {
    const files = await fg(["**/*"], {
      cwd: path.join(root, dir),
      onlyFiles: true,
      ignore: ["node_modules/**", "dist/**", "build/**"],
    });
    out.push({ path: dir, fileCount: files.length });
  }
  return out.sort((a, b) => b.fileCount - a.fileCount);
}

export async function detectLanguages(root: string): Promise<Record<string, number>> {
  const files = await fg(["**/*"], {
    cwd: root,
    onlyFiles: true,
    ignore: ["node_modules/**", "dist/**", "build/**", ".git/**", "coverage/**"],
  });
  const counts: Record<string, number> = {};
  for (const f of files) {
    const ext = path.extname(f);
    const lang = LANG_BY_EXT[ext];
    if (lang) counts[lang] = (counts[lang] ?? 0) + 1;
  }
  return counts;
}
