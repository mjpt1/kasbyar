# KasbYar System Architecture

## Current Shape
- `apps/web`: Next.js application for the main product and landing pages
- `apps/ai-service`: FastAPI service for assistant capabilities
- `packages/shared`: shared utilities and domain helpers
- `packages/ui`: reusable UI primitives and components
- `prisma`: schema, migrations, seeds
- `docs`: operational and product documentation

## Target Architecture
KasbYar should evolve into a modular business operating system with these core layers:

### 1. Presentation Layer
- Web app
- Mobile-responsive interfaces
- Admin and super-admin views
- Role-aware dashboards

### 2. Application Layer
- Use-case orchestration
- Commands and queries
- Workflow execution
- Policy enforcement

### 3. Domain Layer
- Customers
- Leads
- Invoices
- Payments
- Tasks
- Projects
- Inventory
- Memory
- Agents
- Workflows
- Analytics

### 4. Infrastructure Layer
- PostgreSQL
- Object storage
- Queue/worker system
- Cache
- Observability
- AI model providers

## Architectural Patterns
- Modular Monolith first
- Clean Architecture
- DDD boundaries
- CQRS where useful
- Event-driven integration internally
- Repository abstraction for persistence
- Dependency injection at module boundaries

## Recommended Module Map
- identity
- tenants
- customers
- sales
- billing
- finance
- inventory
- projects
- tasks
- meetings
- memory
- ai-agents
- automation
- analytics
- notifications
- integrations
- admin-platform

## Data Strategy
- PostgreSQL as system of record
- Audit tables for sensitive domain changes
- Event log for important business events
- Optional vector store for semantic search

## AI Strategy
- AI is an orchestration layer over business context
- AI must read structured data before answering
- AI must have tools, permissions, and memory boundaries
- AI must support retrieval and action execution

## Evolution Path
1. Harden current monolith
2. Normalize module boundaries
3. Add workflow engine and memory graph
4. Add agent platform
5. Add predictive intelligence
6. Add plugin marketplace
7. Extract services only when justified by scale
