import chalk from "chalk";

export const ui = {
  title: (s: string) => console.log("\n" + chalk.bold.cyan(s)),
  step: (s: string) => console.log(chalk.dim("→ ") + s),
  ok: (s: string) => console.log(chalk.green("✓ ") + s),
  warn: (s: string) => console.log(chalk.yellow("! ") + s),
  err: (s: string) => console.error(chalk.red("✗ ") + s),
  info: (s: string) => console.log(chalk.cyan("ℹ ") + s),
  blank: () => console.log(""),
};

export function banner() {
  console.log(
    chalk.cyan(`
  ╔═╗╦  ╔═╗╦ ╦╔╦╗╔═╗  ╔╗ ╔═╗╔═╗╔╦╗╔═╗╔╦╗╦═╗╔═╗╔═╗
  ║  ║  ╠═╣║ ║ ║║║╣   ╠╩╗║ ║║ ║ ║ ╚═╗ ║ ╠╦╝╠═╣╠═╝
  ╚═╝╩═╝╩ ╩╚═╝═╩╝╚═╝  ╚═╝╚═╝╚═╝ ╩ ╚═╝ ╩ ╩╚═╩ ╩╩
`),
    chalk.dim("  AI Workspace Generator for Claude Code · v1.0\n"),
  );
}
