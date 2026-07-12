# Google AI Studio / Vibecoding Source-of-Truth Prompt

You are building Roy Xiang's portfolio website. Use the attached structured data as the source of truth:

- `projects.json` defines project structure, storytelling, role, categories, page ranges, and recommended website placement.
- `asset_mapping.json` defines which Figma/PDF visual asset belongs to which project. Do not guess image-project relationships.
- Use `recommended_usage = cover` as project card/hero image.
- Use `recommended_usage = gallery` inside the project detail page.
- Use `confidence = medium` assets only as secondary gallery material, not project cover.

Website requirements:

1. Build a clean responsive portfolio website with homepage, project grid, category filters, and project detail sections.
2. Group projects into `GTM Campaign` and `Product & UI/UX`.
3. Each project card must show title, category, one-line summary, role, tags, and the mapped cover image.
4. Each detail section should follow: Challenge, Insight, Solution, Deliverables, Impact/Result, Gallery.
5. Prefer concise strategic storytelling over long paragraphs.
6. Do not mix assets between projects unless `asset_mapping.json` assigns the same asset to multiple projects.
7. If an asset is missing, render a neutral placeholder and flag it in the UI data, rather than guessing.

Core positioning:

Roy is a Brand & Growth Marketing professional with cross-market experience in China and the Middle East, combining GTM campaigns, digital product/UIUX, content production, and AI-assisted workflows.
