// Shape of src/data/cv.json. A missing field or a typo in a key fails the build.
import { z } from 'zod';

const text = z.string().trim().min(1);
// Dates are "2026" or "Oct 2026". Ranges use "to", never a dash.
const date = z.string().regex(/^((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) )?\d{4}( \(expected\))?$|^present$/, 'Use "2026", "Oct 2026" or "present"');
const noDashes = (value) => !/[\u2013\u2014]/.test(JSON.stringify(value));

export const cvSchema = z
  .strictObject({
    updated: z.iso.date(),
    name: text,
    role: text,
    location: text,
    email: z.email(),
    website: text,
    linkedin: text,
    github: text,
    profile: text,
    work: z.array(
      z.strictObject({
        show: z.boolean(),
        title: text,
        type: text,
        year: z.string().regex(/^\d{4}( to \d{4})?$/, 'Use "2026" or "2025 to 2026"'),
        tools: z.array(text).min(1),
        oneLine: text,
        link: text,
      }),
    ),
    experience: z.array(
      z.strictObject({ role: text, organisation: text, from: date, to: date, oneLine: text }),
    ),
    education: z.array(z.strictObject({ school: text, programme: text, from: date, to: date })),
    awards: z.array(
      z.strictObject({ title: text, year: z.string().regex(/^\d{4}( to \d{4})?$/, 'Use "2024" or "2023 to 2024"') }),
    ),
    skills: z.strictObject({ motion: z.array(text).min(1), code: z.array(text).min(1) }),
    languages: z.array(z.strictObject({ language: text, level: text })).min(1),
    gdprClause: z.strictObject({ show: z.boolean(), text }),
  })
  .refine(noDashes, 'cv.json contains an em dash or en dash. Write ranges as "2025 to 2026".');

export function parseCv(data) {
  const result = cvSchema.safeParse(data);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`src/data/cv.json is not valid:\n${lines.join('\n')}`);
  }
  return result.data;
}
