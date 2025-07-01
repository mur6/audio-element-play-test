# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
iOS SafariでのHTMLAudioの挙動確認のためのプロジェクトです。HTMLAudioを、reactコンポーネントでラップしています。
iOS Safariには、音の自動再生ポリシー上、制限があります。
このプロジェクトでは、音を鳴らしていない間に無音のmp3を再生することで、この制限を回避できるかを試しています。

## Common Commands

### Development
- `npm run dev` - Start development server with HMR at http://localhost:5173
- `npm run typecheck` - Run TypeScript type checking and generate types
- `npm run build` - Create production build
- `npm start` - Start production server from built files

### Package Management
This project uses pnpm as indicated by pnpm-lock.yaml. Use `pnpm install` for dependencies.

## Architecture

### File Structure
- `app/` - Main application code
  - `root.tsx` - Root layout component with HTML structure, error boundary
  - `routes.ts` - Route configuration using React Router v7 format
  - `routes/` - Individual route components
  - `app.css` - Global styles
- `react-router.config.ts` - React Router configuration (SSR enabled by default)
- `vite.config.ts` - Vite configuration with React Router, TailwindCSS, and TypeScript paths

### Key Technologies
- React Router v7 with file-based routing
- Vite for bundling and development
- TypeScript with strict configuration
- TailwindCSS v4 for styling
- Server-side rendering enabled by default

### Route System
Routes are defined in `app/routes.ts` using React Router v7's configuration format. The current setup uses an index route pointing to `routes/home.tsx`.

### Styling
Uses TailwindCSS v4 with Vite plugin. Global styles are in `app/app.css` and Inter font is loaded from Google Fonts.

### Error Handling
The root component includes a comprehensive error boundary that handles 404s and development error display with stack traces.