// Motion segments per recorded video: when the picture starts and stops changing.
// Usage: node scripts/feel/analyze.mjs <videoDir> [threshold]
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const [dir = "docs/feel/videos/mine", thresholdArg = "0.0015"] = process.argv.slice(2);
const threshold = Number(thresholdArg);
const report = existsSync(`${dir}/report.json`) ? JSON.parse(readFileSync(`${dir}/report.json`, "utf8")) : {};
const result = {};

for (const file of readdirSync(dir).filter((f) => f.endsWith(".webm"))) {
  const log = execFileSync(
    "ffmpeg",
    ["-hide_banner", "-i", `${dir}/${file}`, "-vf", "select='gte(scene,0)',metadata=print:file=-", "-an", "-f", "null", "-"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 },
  );
  const frames = [];
  let t = 0;
  for (const line of log.split("\n")) {
    const time = line.match(/pts_time:([\d.]+)/);
    if (time) t = Number(time[1]);
    const score = line.match(/scene_score=([\d.]+)/);
    if (score) frames.push([t, Number(score[1])]);
  }
  // Merge moving frames into segments (gaps under 120ms join)
  const segments = [];
  for (const [time, score] of frames) {
    if (score < threshold) continue;
    const last = segments.at(-1);
    if (last && time - last[1] < 0.12) last[1] = time;
    else segments.push([time, time]);
  }
  // Frame-time jitter: gaps between delivered frames over 50ms while moving
  const name = file.replace(".webm", "");
  result[name] = {
    segments: segments.map(([a, b]) => `${a.toFixed(2)}–${b.toFixed(2)}s (${Math.round((b - a) * 1000)}ms)`),
    marks: report[name]?.marks,
    longTasks: report[name]?.longTasks,
  };
  console.log(name, JSON.stringify(result[name]));
}
writeFileSync(`${dir}/analysis.json`, JSON.stringify(result, null, 1));
