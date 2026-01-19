# E-Commerce Backend API

Modern TypeScript backend for e-commerce operations with cart management, order processing, and automated discount code generation.

## Overview

This backend provides a complete e-commerce solution built using Domain-Driven Design principles. The system handles product catalog management, shopping cart operations, order processing, and automatic discount code generation for every Nth order.

## Technology Stack

- **Runtime**: Node.js 22.x
- **Language**: TypeScript with strict mode
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Architecture**: Domain-Driven Design (DDD)
- **Error Handling**: Result pattern using oxide.ts
- **Validation**: Zod schemas

## Core Features

### Product Management

Complete product catalog with inventory tracking, pricing, and featured product support. Products can be sorted by various criteria including featured status, price, and creation date.

### Shopping Cart

Persistent cart management allowing customers to add/remove items, update quantities, and view calculated totals including subtotals, taxes, and final amounts. Each cart is associated with a customer ID and tracks item details including variant information.

### Order Processing

Converts shopping carts into completed orders, tracking order status from creation through fulfillment. Orders maintain complete history including items purchased, pricing at time of order, customer information, and timestamps.

### Automatic Discount Generation

Generates unique discount codes for every Nth order (configurable). When a customer's order count reaches the threshold, a discount code is automatically created and can be applied to future purchases.

### Admin Configuration

Manage system-wide settings including the Nth order value for discount generation. Allows real-time configuration updates without code deployment.

## API Endpoints

### Products

- `GET /api/products` - List all products with sorting and pagination
- `GET /api/products/:id` - Get single product details
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update existing product
- `DELETE /api/products/:id` - Remove product from catalog

### Cart

- `GET /api/cart/:customerId` - Get customer's current cart
- `POST /api/cart/:customerId/items` - Add item to cart
- `PUT /api/cart/:customerId/items/:itemId` - Update item quantity
- `DELETE /api/cart/:customerId/items/:itemId` - Remove item from cart
- `DELETE /api/cart/:customerId` - Clear entire cart

### Orders

- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/customer/:customerId` - Get customer's order history
- `POST /api/orders/checkout` - Create order from cart

### Discount Codes

- `GET /api/discount-codes` - List all discount codes
- `GET /api/discount-codes/customer/:customerId` - Get customer's discount codes
- `POST /api/discount-codes/validate` - Validate discount code

### Admin

- `GET /api/admin/config` - Get current configuration
- `PUT /api/admin/config` - Update system configuration

## Architecture

The application follows a layered architecture with clear separation of concerns:

**Domain Layer** - Contains business entities and domain logic with validation rules. Each entity encapsulates its own business rules and invariants.

**Service Layer** - Implements business use cases and orchestrates domain operations. Services return Result types for explicit error handling without exceptions.

**Repository Layer** - Abstracts data persistence and retrieval. Uses port-adapter pattern with interfaces defining contracts and implementations handling MongoDB operations.

**HTTP Layer** - Controllers handle HTTP requests, transform data, and return standardized API responses. All responses use ApiResponse wrapper for consistency.

## Database Schema

### Products Collection

Stores product catalog with name, description, price, inventory count, variants, images, and metadata including featured status and timestamps.

### Carts Collection

Maintains active shopping carts with customer association, line items with product references, quantities, calculated totals, and modification timestamps.

### Orders Collection

Records completed orders with customer information, order items snapshot, pricing details, order status, discount applications, and complete audit trail.

### Discount Codes Collection

Tracks generated discount codes with unique codes, customer assignment, usage status, expiration dates, and discount values.

### App Config Collection

Stores system configuration including nth-order threshold for discount generation and other operational parameters.

## Error Handling

All operations return Result types with explicit success or error states. Standard HTTP error codes with descriptive messages:

- **400 Bad Request** - Invalid input data or business rule violations
- **404 Not Found** - Requested resource doesn't exist
- **409 Conflict** - Resource already exists or constraint violation
- **500 Internal Server Error** - Unexpected system errors

## Environment Configuration

Required environment variables:

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name
- `PORT` - Server port (default: 4000)
- `CONSTANT_CUSTOMER_ID` - Default customer ID for testing

## Development & Deployment

**Development**: Run with live reload using tsx
**Production**: Compile TypeScript to JavaScript and run with Node.js
**Build Process**: TypeScript compilation with path alias resolution
**Database**: MongoDB Atlas or local MongoDB instance
