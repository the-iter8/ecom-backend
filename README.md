# E-Commerce Backend

TypeScript DDD backend for e-commerce with cart, checkout, orders, and auto-discount generation.

## Quick Start

```bash
pnpm install
pnpm dev        # Runs on http://localhost:3000
```

## Tech Stack

**Core**: TypeScript, Node.js, Express  
**DB**: MongoDB (Mongoose)  
**Patterns**: DDD, Result pattern (oxide.ts), Repository pattern  
**Validation**: Zod schemas

## Architecture

```
modules/          # Business domains (DDD)
  ├── product/    # Product catalog
  ├── cart/       # Shopping cart
  ├── order/      # Order processing
  ├── discount-code/  # Discount generation
  └── app-config/ # System config (nth order)
lib/              # Framework utilities
  ├── api/        # ApiResponse wrapper
  ├── db/         # MongoDB connection
  ├── ddd/        # Base classes (Entity, Repository)
  └── util/       # Errors, Logger
conf/             # Configuration
bootstrap/        # Service entry points
```

## Module Structure (Standard)

```
module/
├── index.ts                    # DI container
├── module.http.router.ts       # Routes
├── module.http.controller.ts   # HTTP handlers
├── module.mapper.ts            # Entity ↔ DB ↔ DTO
├── services/module.service.ts  # Business logic
├── domain/
│   ├── entity.ts              # DDD entity
│   └── type.ts                # Zod schemas
└── db/
    ├── schema.ts              # Mongoose schema
    ├── repository.ts          # Repository impl
    └── repository.port.ts     # Repository interface
```

## Core Patterns

**Result Pattern** - No exceptions, all services return `Result<T, Error>`

```typescript
import { Result, Ok, Err } from "oxide.ts";
if (result.isErr()) return Err(new BadPayloadError("Invalid"));
return Ok(entity);
```

**DDD Entities** - Validation + domain logic

```typescript
class ProductEntity extends Entity<ProductProps> {
  validate() {
    return ProductSchema.safeParse(this.props);
  }
}
```

**Repositories** - Singleton pattern with `init()` and `getInstance()`

**Mappers** - `toDomain()`, `toPersistence()`, `toResponse()`

## Key Features

- **Cart Management**: Add/remove items, calculate totals
- **Order Checkout**: Cart → Order conversion
- **Auto Discounts**: Every Nth order gets discount code
- **Product Catalog**: CRUD operations
- **Admin Config**: Manage nth-order settings

## Database Collections

- `products` - Product catalog
- `carts` - Active shopping carts
- `orders` - Completed orders
- `discountCodes` - Generated codes
- `appConfig` - System settings (nth order value)

## Error Types

`BadPayloadError` (400) | `InvalidArgumentError` (400) | `ResourceNotFoundError` (404) | `UnauthorizedError` (401) | `AlreadyExistsError` (409) | `InvalidOperationError` (400)

## Path Aliases

`@lib/`, `@modules/`, `@conf/` - Never use relative imports across modules

## Development

**Config**: MongoDB URI in `src/conf/app.config.ts`  
**Customer ID**: Hardcoded as `CUSTOMER_001` (configurable)  
**Logging**: `Logger` class in all services  
**Validation**: Zod schemas in `domain/type.ts`

## Scripts

```bash
pnpm dev       # Development mode (tsx)
pnpm build     # Compile TypeScript
pnpm start     # Run compiled code
```
