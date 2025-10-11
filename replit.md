# Asset Management System (Patrimônio)

## Overview

This is a comprehensive asset management system built for healthcare facilities to track, allocate, and maintain physical assets. The system provides a complete CRUD interface for managing asset classifications, asset registration (tombamento), allocations to health units, transfers between locations, and maintenance tracking. It's designed as a modular application that can be integrated into a parent framework system through configurable routes and parameters.

The application manages the complete lifecycle of physical assets from initial registration through allocation, transfer, and maintenance, providing detailed tracking and reporting capabilities for healthcare organizations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Forms**: React Hook Form with Zod validation (via @hookform/resolvers)

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database Layer**: Direct PostgreSQL queries using node-postgres (pg) library
- **File Handling**: Multer for image uploads with file type validation
- **API Design**: RESTful endpoints following conventional patterns
- **Development Tools**: tsx for TypeScript execution, esbuild for production builds

### Database Design
- **Primary Database**: PostgreSQL with schema-based organization (sotech schema)
- **Connection Management**: Connection pooling via pg.Pool with SSL support
- **Tables Structure**:
  - `pat_classificacao`: Asset classifications/categories
  - `pat_tombamento`: Asset registration with photos and serial tracking  
  - `pat_alocacao`: Asset allocations to health units and sectors
  - `pat_transferencia`: Transfer history between locations
  - `pat_manutencao`: Maintenance tracking and service records
- **Data Integrity**: Foreign key relationships between assets, locations, and tracking records
- **File Storage**: JSONB fields for storing photo metadata and file references

### Key Architectural Decisions

**Modular Page Structure**: Each major function (Classifications, Tombamento, Allocations, Transfers, Maintenance) is implemented as a separate page component with its own modal dialogs for CRUD operations. This provides clear separation of concerns and makes the codebase maintainable.

**Direct Database Access**: Uses raw PostgreSQL queries instead of an ORM to maintain direct control over database operations and leverage PostgreSQL-specific features like JSONB for photo storage.

**File Upload Handling**: Images are processed through multer middleware with type validation (JPEG, PNG, WebP) and size limits, storing metadata in JSONB database fields while files are stored in the filesystem.

**State Management Strategy**: TanStack Query handles all server state with automatic caching, background refetching, and optimistic updates. Local component state is used only for UI interactions like modal visibility and form inputs.

**Component Architecture**: Follows a clear hierarchy with Layout → Page → Modal → UI Components, where each modal is responsible for both create and edit operations for its respective entity.

## External Dependencies

### Database Connection
- **PostgreSQL Server**: External database at db.redeis.com.br:5555
- **Credentials**: Configured via environment variables with fallback to hardcoded values
- **Schema**: All tables use the 'sotech' schema prefix
- **SSL**: Required for external database connections

### UI Component Libraries
- **Radix UI**: Complete set of unstyled, accessible UI primitives
- **shadcn/ui**: Pre-built components based on Radix UI with Tailwind styling
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool with React plugin and TypeScript support
- **Replit Integration**: Development plugins for runtime error overlay and cartographer
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### File Processing
- **Multer**: Multipart form handling for image uploads
- **File Type Validation**: Restricts uploads to image formats (JPEG, PNG, WebP)
- **Size Limits**: 10MB maximum file size for uploaded images

### TypeScript Configuration
- **Module Resolution**: Bundler-style resolution with path aliases
- **Import Aliases**: @/ for client source, @shared/ for shared types, @assets/ for static files
- **Strict Mode**: Full TypeScript strict checking enabled

## Production Build Configuration

### ES Modules Setup
- **Package Type**: `"type": "module"` in package.json for native ES module support
- **Import Extensions**: All relative imports in server code must include `.js` extensions for ES module compatibility
- **Build Output**: TypeScript compiles to `server/dist/server/` directory structure

### Build Process
- **Client Build**: `vite build` compiles React frontend to `dist/public/` (497KB JS + 63KB CSS)
- **Server Build**: `tsc -p server/tsconfig.json --noEmit false` compiles Express backend to `server/dist/server/`
- **Start Script**: Production server runs from `node server/dist/server/index.js`

### Critical Configuration Details
- **server/tsconfig.json**: Standalone configuration (no extends) with `noEmit: false` to force compilation
- **Import Syntax**: Server files use `.js` extensions in imports (e.g., `import { routes } from "./routes.js"`)
- **File Structure**: Compiled server preserves directory structure as `server/dist/server/*.js`
- **Static Files Path**: Uses `process.cwd()` to resolve `dist/public` from project root
- **Vite Config Import**: Uses dynamic import with path resolution for ES module compatibility

### Path Resolution Strategy
- **Development**: Vite middleware serves files from `client/` directory
- **Production**: Static files served from `dist/public/` using `process.cwd()` as base
- **Server Location**: Compiled to `server/dist/server/` but resolves paths from project root
- **ES Module Imports**: Node.js requires explicit `.js` extensions for relative imports when using `"type": "module"`