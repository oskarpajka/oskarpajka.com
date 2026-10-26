// Shape of src/data/cv.json. A missing field or a typo in a key fails the build.
import { z } from 'zod';

const text = z.string().trim().min(1);
// Dates are "2026" or "Oct 2026"; an end date can also be "present" or "2029 (expected)".
// The layout joins a range with an en dash, so the data never contains one.
const date = z.string().regex(/^((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) )?\d{4}( \(expected\))?$|^present$/, 'Use "2026", "Oct 2026" or "present"');
const noDashes = (value) => !/[–—]/.test(JSON.stringify(value));

export const cvSchema = z
  .strictObject({
    updated: z.iso.date(),
    name: text,
    headline: text,
    location: text,
    email: z.email(),
    phone: z.string().trim(), // empty: not printed
    website: text,
    linkedin: text,
    github: text,
    summary: text,
    projects: z.array(
      z.strictObject({
        show: z.boolean(),
        name: text,
        kind: text,
        stack: z.array(text).min(1),
        from: date,
        to: date,
        link: text,
        points: z.array(text).min(1).max(3),
      }),
    ),
    experience: z.array(
      z.strictObject({ role: text, organisation: text, from: date, to: date, points: z.array(text).min(1).max(3) }),
    ),
    education: z.array(z.strictObject({ school: text, programme: text, from: date, to: date })),
    awards: z.array(z.strictObject({ title: text, year: z.string().regex(/^\d{4}$/, 'Use "2024"') })),
    skills: z.array(z.strictObject({ label: text, items: z.array(text).min(1) })).min(1),
    languages: z.array(z.strictObject({ language: text, level: text })).min(1),
    gdprClause: z.strictObject({ show: z.boolean(), text }),
  })
  .refine(noDashes, 'cv.json contains an em dash or en dash. Give ranges as "from" and "to" fields.');

export function parseCv(data) {
  const result = cvSchema.safeParse(data);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new Error(`src/data/cv.json is not valid:\n${lines.join('\n')}`);
  }
  return result.data;
}
