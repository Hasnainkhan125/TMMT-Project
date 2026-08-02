#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color mapping from hardcoded to theme-aware classes
const COLOR_REPLACEMENTS = {
  // Hardcoded hex colors to theme classes
  'text-\\[#e7b555\\]': 'text-primary',
  'bg-\\[#e7b555\\]': 'bg-primary',
  'border-\\[#e7b555\\]': 'border-primary',
  'text-\\[#baf350\\]': 'text-accent',
  'bg-\\[#baf350\\]': 'bg-accent',
  'border-\\[#baf350\\]': 'border-accent',
  'text-\\[#ee971e\\]': 'text-secondary',
  'bg-\\[#ee971e\\]': 'bg-secondary',
  'border-\\[#ee971e\\]': 'border-secondary',
  'text-\\[#fab834\\]': 'text-warning',
  'bg-\\[#fab834\\]': 'bg-warning',
  'border-\\[#fab834\\]': 'border-warning',
  'text-\\[#e0aa18\\]': 'text-warning',
  'bg-\\[#e0aa18\\]': 'bg-warning',
  'border-\\[#e0aa18\\]': 'border-warning',
  
  // With opacity
  'bg-\\[#e7b555\\]/10': 'bg-primary/10',
  'bg-\\[#e7b555\\]/20': 'bg-primary/20',
  'bg-\\[#e7b555\\]/30': 'bg-primary/30',
  'bg-\\[#e7b555\\]/90': 'bg-primary/90',
  'border-\\[#e7b555\\]/10': 'border-primary/10',
  'border-\\[#e7b555\\]/20': 'border-primary/20',
  'border-\\[#e7b555\\]/30': 'border-primary/30',
  'hover:bg-\\[#e7b555\\]': 'hover:bg-primary',
  'hover:bg-\\[#e7b555\\]/10': 'hover:bg-primary/10',
  'hover:bg-\\[#e7b555\\]/90': 'hover:bg-primary/90',
  'hover:text-\\[#e7b555\\]': 'hover:text-primary',
  
  // Common gray colors
  'bg-white': 'bg-background',
  'bg-gray-50': 'bg-surface-light',
  'bg-gray-100': 'bg-surface',
  'bg-gray-900': 'bg-surface',
  'text-gray-600': 'text-text-secondary',
  'text-gray-700': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',
  'text-slate-600': 'text-text-secondary',
  'text-slate-700': 'text-foreground',
  'text-slate-800': 'text-foreground',
  'text-slate-900': 'text-foreground',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-slate-200': 'border-border',
  'border-slate-300': 'border-border',
};

// Files to process (React/TypeScript files in components and pages)
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

function findFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      if (extensions.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

function replaceInFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(replacements).forEach(([pattern, replacement]) => {
      const regex = new RegExp(pattern, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Finding React/TypeScript files...');
  
  const srcDir = path.join(__dirname, 'src');
  const files = findFiles(srcDir, EXTENSIONS);
  
  console.log(`📄 Found ${files.length} files to process`);
  console.log('🎨 Replacing hardcoded colors with theme-aware classes...');
  
  let updatedCount = 0;
  
  files.forEach(file => {
    if (replaceInFile(file, COLOR_REPLACEMENTS)) {
      updatedCount++;
    }
  });
  
  console.log(`\n✨ Complete! Updated ${updatedCount} files`);
  
  if (updatedCount > 0) {
    console.log('\n📝 Summary of changes:');
    Object.entries(COLOR_REPLACEMENTS).forEach(([pattern, replacement]) => {
      console.log(`   ${pattern.replace(/\\\\/g, '')} → ${replacement}`);
    });
  }
}

if (require.main === module) {
  main();
}

module.exports = { COLOR_REPLACEMENTS, replaceInFile };
