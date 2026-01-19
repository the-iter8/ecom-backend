# Ecommerce Backend

Simple ecommerce backend with cart management, checkout, and discount codes.

## Setup

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3000`

## Architecture

- **TypeScript** with Express.js
- **MongoDB** for persistence
- **DDD patterns** - entities, services, repositories
- **Result pattern** - all services return `Result<T, Error>`

## Database

MongoDB URI configured in [src/conf/app.config.ts](src/conf/app.config.ts)

Collections:

- `products` - Product catalog
- `carts` - Shopping carts
- `orders` - Completed orders
- `discountCodes` - Generated discount codes
- `appConfig` - System configuration (nth order value)

## Constant Customer ID

Currently using: `CUSTOMER_001` (configured in app.config.ts)
# ecom-backend
