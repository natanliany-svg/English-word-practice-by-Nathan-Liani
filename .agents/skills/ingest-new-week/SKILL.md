---
name: ingest-new-week
description: >-
  Automates the ingestion of a new week's material, ensuring data integrity,
  generating missing audio, updating UI components, bumping caches, and 
  running E2E verification via the browser subagent.
---

# Ingest New Week (קליטת חומר שבועי חדש)

## Overview
This skill executes the entire pipeline for integrating a new study week into the platform.
It automates the fragile parts of the process (bumping caches, fixing quiz difficulty logic, missing audio) that typically break when new material is introduced.

## Workflow

### 1. Data Integrity & Quiz Fix
Run the pipeline script to automatically inject `diff` attributes into any new quiz questions to prevent the quiz UI from crashing.
```bash
python .agents/skills/ingest-new-week/scripts/ingest_pipeline.py fix-quiz
```

### 2. Update UI References
Identify and update hardcoded week references in the UI (e.g., from `week12` to `week13`).
1. Search `js/app.js` and `index.html` for occurrences of the old week.
2. Use your `replace_file_content` tool to carefully update descriptions, titles, and `onclick` parameters for the home dashboard focus buttons.

### 3. Generate Audio
Run the audio generation script to catch any new English text and create `.mp3` files via Edge-TTS, updating `audioMap.js`.
```bash
python generate_missing_audio_all.py
```
*(Ensure `edge-tts` is installed and the system has internet access).*

### 4. Bump Cache Versions
Run the cache bumping step to ensure the browser fetches the new changes.
```bash
python .agents/skills/ingest-new-week/scripts/ingest_pipeline.py bump-cache
```

### 5. Verify & Test (E2E)
Spawn the `browser` subagent to load `index.html` and verify that the page renders without console errors and that the target buttons actually point to the correct week.
```json
{
  "Subagents": [
    {
      "TypeName": "browser",
      "Role": "UI Tester",
      "Prompt": "Load index.html via a local static server, check the browser console for errors, and verify the Weekly Focus buttons display the correct new week and trigger the appropriate views. Also ensure animations are working properly."
    }
  ]
}
```

## Common Mistakes
- **Fuzzy Matching Errors**: Do not use `multi_replace_file_content` for updating the `app.js` UI focus buttons without exact line boundaries. Doing so previously broke the `toggleMenu(false)` logic. Rely on precise `replace_file_content` or Python regex.
- **Cache Mismatch**: If audio plays the old browser voice instead of the generated `.mp3`, the cache version in `index.html` was not bumped properly.
- **Empty Quiz on Easy/Hard**: If the quiz crashes or shows 0 questions, the new questions in `quizData.js` are missing the `diff: "medium"` property. Ensure Step 1 is executed successfully.
