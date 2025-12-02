#!/bin/bash
# 🚀 BaraCorrespondance - Useful Commands & Helpers
# Quick reference for development and deployment

# ============================================
# 📦 INSTALLATION & SETUP
# ============================================

# Install dependencies
npm install

# Install specific package
npm install package-name

# Install and save to package.json
npm install --save package-name

# Install dev dependency
npm install --save-dev package-name

# Update all dependencies
npm update

# Check for outdated packages
npm outdated

# ============================================
# 🔨 DEVELOPMENT
# ============================================

# Start development server
npm run dev

# Start dev server with specific port
npm run dev -- --port 3000

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code (if ESLint configured)
npm run lint

# Format code (if Prettier configured)
npm run format

# Type check (if TypeScript available)
npm run type-check

# ============================================
# 🧪 TESTING
# ============================================

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.js

# Run tests matching pattern
npm test -- --testNamePattern="ComponentName"

# ============================================
# 📚 DOCUMENTATION
# ============================================

# Key documentation files:

# 1. Component Reference
# → COMPONENTS_GUIDE.md
#   Complete guide for all 30+ components with examples

# 2. Design System Overview
# → DESIGN_SYSTEM_README.md
#   High-level overview, statistics, features

# 3. Quick Start
# → QUICK_START.md
#   Quick reference and common patterns

# 4. Complete Index
# → COMPLETE_INDEX.md
#   Detailed index of all files with line counts

# 5. Integration Examples
# → INTEGRATION_EXAMPLES.jsx
#   Complete integration examples for each page

# 6. Implementation Checklist
# → IMPLEMENTATION_CHECKLIST.md
#   Step-by-step checklist for implementation

# ============================================
# 🎨 COMPONENT IMPORTS
# ============================================

# Import all components at once
# import * from '@/components/common';

# Import specific components
# import { StatCard, Modal, Header } from '@/components/common';

# Import with alias
# import * as CommonComponents from '@/components/common';

# Use: CommonComponents.StatCard, CommonComponents.Modal, etc.

# ============================================
# 📁 FILE STRUCTURE REFERENCE
# ============================================

# Generated files are located at:
# ./frontend/baracorrespondance-frontend-complete/

# CSS Files:
# src/styles/index.css                    # Global styles
# src/styles/modern-design.css            # Design system (420 lines)
# src/styles/lists-and-states.css         # Lists & states (400 lines)

# Components:
# src/components/common/Header.jsx        # Navigation
# src/components/common/Footer.jsx        # Footer
# src/components/common/HeroSection.jsx   # Hero section
# src/components/common/JobCard.jsx       # Job card
# src/components/common/StatisticsCard.jsx# Stats card
# src/components/common/Form.jsx          # Form components
# src/components/common/Loaders.jsx       # Loading states
# src/components/common/OnboardingTour.jsx# Onboarding
# src/components/common/ListsAndStates.jsx# 8 list components
# src/components/common/ModalsAndNotifications.jsx # 9 modal components
# src/components/common/AdvancedStats.jsx # 6 stat components
# src/components/common/index.js          # Export file

# Configuration:
# src/theme.js                            # Theme config
# src/animations.js                       # Animation presets
# src/constants.js                        # App constants
# src/config/themeConfig.js               # Advanced theme config

# Documentation:
# DESIGN_SYSTEM.md                        # Design reference
# QUICK_START.md                          # Quick guide
# DESIGN_IMPROVEMENTS.md                  # Changes summary
# FILE_INDEX.md                           # File catalog
# COMPONENTS_GUIDE.md                     # Components guide
# DESIGN_SYSTEM_README.md                 # Overview
# INTEGRATION_EXAMPLES.jsx                # Integration guide
# COMPLETE_INDEX.md                       # Complete index
# IMPLEMENTATION_CHECKLIST.md             # Checklist

# ============================================
# 🎯 COMMON WORKFLOWS
# ============================================

# 1. Add a new component
# Step 1: Create file in src/components/common/MyComponent.jsx
# Step 2: Add export to src/components/common/index.js
# Step 3: Use: import { MyComponent } from '@/components/common';

# 2. Customize theme
# Step 1: Edit src/theme.js or src/config/themeConfig.js
# Step 2: Import useTheme() in component
# Step 3: Use theme values

# 3. Add animation
# Step 1: Edit src/animations.js
# Step 2: Use in component with Framer Motion
# Step 3: Example: initial={animations.fadeInUp}

# 4. Add constant/message
# Step 1: Edit src/constants.js
# Step 2: Import constant: import { MESSAGES } from '@/constants';
# Step 3: Use: MESSAGES.success

# 5. Style new component
# Step 1: Add styles in src/styles/modern-design.css or lists-and-states.css
# Step 2: Reference class name: className="my-class"
# Step 3: Follow naming convention: .component-name, .component-name-variant

# ============================================
# 🔍 DEBUGGING TIPS
# ============================================

# 1. Component not importing?
# - Check index.js exports
# - Verify file path is correct
# - Check for typos in import statement

# 2. Styles not applying?
# - Check CSS file is imported in main.jsx
# - Verify class names match exactly
# - Check for Tailwind utility conflicts

# 3. Animation not working?
# - Import motion from 'framer-motion'
# - Verify animation syntax is correct
# - Check browser console for errors

# 4. Toast not showing?
# - Verify ToastContainer is rendered
# - Check useToast() hook is called
# - Verify addToast() is being called with correct params

# 5. Modal won't open?
# - Check isOpen state is true
# - Verify onClose callback is set
# - Check z-index isn't being overridden

# ============================================
# 🚀 QUICK START COMMAND
# ============================================

# Fast setup and run:
npm install && npm run dev

# Then open in browser:
# http://localhost:5173

# ============================================
# 📊 CODE STATISTICS COMMAND
# ============================================

# Count lines of code (Unix/Mac/Linux):
find . -name "*.jsx" -o -name "*.js" -o -name "*.css" | xargs wc -l

# Count specific filetype:
find . -name "*.jsx" | xargs wc -l          # JSX files
find . -name "*.css" | xargs wc -l          # CSS files
find . -name "*.md" | xargs wc -l           # Markdown files

# ============================================
# 🎬 USEFUL VSCode EXTENSIONS
# ============================================

# Recommended for this project:
# - ES7+ React/Redux/React-Native snippets
# - Tailwind CSS IntelliSense
# - Prettier - Code formatter
# - ESLint
# - Thunder Client (API testing)
# - Framer Motion syntax highlighting (if available)

# Install shortcuts in VSCode:
# Cmd+Shift+X (Mac) or Ctrl+Shift+X (Windows/Linux) to open Extensions

# ============================================
# 🔒 SECURITY & BEST PRACTICES
# ============================================

# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check specific package version
npm list package-name

# Verify installation
npm ci              # Clean install (for CI/CD)

# Lock versions
# Always commit package-lock.json to git

# ============================================
# 🌐 DEPLOYMENT COMMANDS
# ============================================

# Production build
npm run build

# Check build size
# (usually shown in npm run build output)

# Preview production build
npm run preview

# Deploy to hosting:
# 1. Build: npm run build
# 2. Upload dist/ folder to hosting
# 3. Configure server for SPA (index.html fallback)

# ============================================
# 📱 RESPONSIVE TESTING
# ============================================

# Breakpoints to test:
# Mobile:  320px - 640px
# Tablet:  641px - 1024px
# Desktop: 1025px+

# Use DevTools (F12) and toggle device toolbar (Ctrl+Shift+M)
# Or use external tools like:
# - BrowserStack
# - Cross Browser Testing
# - Responsively App

# ============================================
# 🎯 PERFORMANCE TESTING
# ============================================

# Lighthouse (built into Chrome DevTools):
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Click "Generate report"
# 4. Analyze score and recommendations

# Manual checks:
# - Check network tab for large assets
# - Look for console errors/warnings
# - Check for unneeded rerenders
# - Verify animations are 60fps

# ============================================
# 💡 HELPFUL LINKS
# ============================================

# React Documentation:          https://react.dev
# Framer Motion:                https://www.framer.com/motion/
# Tailwind CSS:                 https://tailwindcss.com
# Lucide Icons:                 https://lucide.dev
# Vite:                         https://vitejs.dev

# ============================================
# 📝 COMMON GIT COMMANDS
# ============================================

# Check git status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Add new design system components"

# Push to remote
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout branch-name

# ============================================
# 🎉 SUCCESS CHECKLIST
# ============================================

# Before calling it complete:
# ✓ npm run dev works without errors
# ✓ npm run build completes successfully
# ✓ All components import correctly
# ✓ Styles apply correctly
# ✓ Animations are smooth (60fps)
# ✓ Responsive design works on all breakpoints
# ✓ No console errors or warnings
# ✓ Accessibility features implemented
# ✓ Documentation is complete
# ✓ Performance metrics are good

# ============================================
# 🎓 LEARNING RESOURCES
# ============================================

# To understand the design system better:

# 1. Start here:
#    → QUICK_START.md (5 min read)

# 2. Then read:
#    → DESIGN_SYSTEM_README.md (10 min read)

# 3. Deep dive:
#    → COMPONENTS_GUIDE.md (30 min read)

# 4. For integration:
#    → INTEGRATION_EXAMPLES.jsx (30 min read)

# 5. Reference:
#    → DESIGN_SYSTEM.md (anytime needed)

# 6. Complete details:
#    → COMPLETE_INDEX.md (when needed)

# ============================================
# 🆘 TROUBLESHOOTING
# ============================================

# Problem: "npm command not found"
# Solution: Install Node.js from https://nodejs.org

# Problem: "Module not found"
# Solution: Check import path, verify file exists, clear node_modules

# Problem: "Port 5173 already in use"
# Solution: npm run dev -- --port 3000 (use different port)

# Problem: "Build fails"
# Solution: Check for missing semicolons, syntax errors, run npm install

# Problem: "Styles not applying"
# Solution: Check CSS file import in main.jsx, verify class names

# Problem: "Component render error"
# Solution: Check console, verify props match requirements, check dependencies

# ============================================
# 📞 GETTING HELP
# ============================================

# Documentation files (in project root or frontend folder):
# - COMPONENTS_GUIDE.md - Component documentation
# - DESIGN_SYSTEM.md - Design documentation
# - QUICK_START.md - Quick reference
# - INTEGRATION_EXAMPLES.jsx - Real-world examples

# Online resources:
# - React docs: https://react.dev/learn
# - Framer Motion docs: https://www.framer.com/motion/
# - Tailwind CSS docs: https://tailwindcss.com/docs
# - Stack Overflow: https://stackoverflow.com/

# ============================================
# ✨ FINAL NOTES
# ============================================

# This design system includes:
# ✓ 30+ reusable components
# ✓ 6,500+ lines of production code
# ✓ Complete documentation
# ✓ Animation presets
# ✓ Theme configuration
# ✓ Responsive design
# ✓ Accessibility features
# ✓ Best practices

# Happy coding! 🚀

# For updates: Check IMPLEMENTATION_CHECKLIST.md for next steps
