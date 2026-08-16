/**
 * Outline Loader — Extract outline data from canonical artifacts
 */

import fs from 'node:fs';
import path from 'node:path';
import { readJson, bfPath, exists, readText } from '../core/io.js';

/**
 * Load the main outline from bookforge/state/outline/
 * @param {string} project - Project root
 * @returns {object|null} Outline data or null if not found
 */
export function loadOutline(project) {
  // Try YAML first (new format)
  const yamlPath = bfPath(project, 'state', 'outline', 'outline.yaml');
  if (exists(yamlPath)) {
    return parseYAML(readText(yamlPath));
  }

  // Try JSON (legacy format)
  const jsonPath = bfPath(project, 'state', 'outline', 'outline.json');
  if (exists(jsonPath)) {
    return readJson(jsonPath);
  }

  // Try chapter-by-chapter files
  const chaptersDir = bfPath(project, 'state', 'outline');
  if (exists(chaptersDir)) {
    const files = fs.readdirSync(chaptersDir)
      .filter(f => f.endsWith('.yaml') || f.endsWith('.yml') || f.endsWith('.json'))
      .sort();

    const chapters = {};
    for (const file of files) {
      const content = file.endsWith('.json')
        ? readJson(path.join(chaptersDir, file))
        : parseYAML(readText(path.join(chaptersDir, file)));
      const chapterId = file.replace(/\.(yaml|yml|json)$/, '');
      chapters[chapterId] = content;
    }

    return { chapters, metadata: { total: chapters.length } };
  }

  return null;
}

/**
 * Load a specific chapter from outline
 */
export function loadChapterOutline(project, chapterNum) {
  const outline = loadOutline(project);
  if (!outline || !outline.chapters) return null;

  const chapterId = `ch-${chapterNum.toString().padStart(3, '0')}`;
  return outline.chapters[chapterId] || null;
}

/**
 * Simple YAML parser (for basic YAML without special types)
 */
function parseYAML(text) {
  const lines = text.split('\n');
  const result = {};
  let currentKey = null;
  let currentList = null;
  let inList = false;

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // Check for list item
    if (line.trim().startsWith('- ')) {
      if (!inList || !currentList) {
        currentList = [];
        inList = true;
      }
      currentList.push(line.trim().substring(2).trim());
      result[currentKey] = currentList;
      continue;
    }

    // Check for key-value pair
    const match = line.match(/^(\w[\w\s\-]*):(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();

      if (value === '' || value === '|') {
        // Start of nested structure or list
        currentKey = key;
        inList = false;
        currentList = null;
        result[key] = {};
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        result[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
      } else {
        result[key] = value.replace(/^['"]|['"]$/g, '');
      }
      continue;
    }

    // Nested key (indented)
    const nestedMatch = line.match(/^\s+(\w[\w\s\-]*):\s*(.*)$/);
    if (nestedMatch && currentKey) {
      const key = nestedMatch[1].trim();
      const value = nestedMatch[2].trim();
      if (typeof result[currentKey] === 'object' && result[currentKey] !== null) {
        result[currentKey][key] = value;
      }
    }
  }

  return result;
}

/**
 * Save outline to project
 */
export function saveOutline(project, outline) {
  const outlineDir = bfPath(project, 'state', 'outline');
  mkdir(outlineDir);

  const yamlPath = path.join(outlineDir, 'outline.yaml');
  const yamlContent = buildYAML(outline);
  fs.writeFileSync(yamlPath, yamlContent, 'utf8');

  return { path: yamlPath, content: yamlContent };
}

/**
 * Build YAML string from outline object
 */
function buildYAML(obj, indent = 0) {
  const prefix = '  '.repeat(indent);
  let yaml = '';

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      yaml += `${prefix}${key}:\n`;
      for (const item of value) {
        yaml += `${prefix}  - ${item}\n`;
      }
    } else if (typeof value === 'object' && value !== null) {
      yaml += `${prefix}${key}:\n`;
      yaml += buildYAML(value, indent + 1);
    } else {
      yaml += `${prefix}${key}: ${value}\n`;
    }
  }

  return yaml;
}

/**
 * Create a new outline node
 */
export function createOutlineNode(project, chapterNum, data) {
  const outline = loadOutline(project) || { chapters: {} };
  const chapterId = `ch-${chapterNum.toString().padStart(3, '0')}`;

  outline.chapters[chapterId] = {
    number: chapterNum,
    title: data.title || `Chapter ${chapterNum}`,
    goal: data.goal || '',
    beats: data.beats || [],
    target_words: data.target_words || 3000,
    voice: data.voice || 'primary',
    dependencies: data.dependencies || [],
    ...data
  };

  return saveOutline(project, outline);
}

export default {
  loadOutline,
  loadChapterOutline,
  saveOutline,
  createOutlineNode
};
