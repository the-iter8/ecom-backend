---
applyTo: '**'
---
# QuickReply Backend Development Guide

## Architecture Overview

**Domain-Driven Design (DDD)** TypeScript/Node.js backend with multi-service architecture:
- **Bootstrap Services**: Separate entry points (api, journeyBuilder, broadcastConsumer, socket, integrationAPI)
- **Business Modules**: Domain logic in modules
- **Shared Library**: Framework utilities in lib
- **Configuration**: Environment and app config in conf

---

## Module Structure (NEVER Deviate)

```
module-name/
├── index.ts                    # Module exports & DI container
├── module.http.router.ts       # Route definitions
├── module.http.controller.ts   # HTTP request handlers
├── module.mapper.ts            # Entity ↔ DB ↔ Response mapping
├── services/
│   └── module.service.ts       # Business logic
├── domain/
│   ├── entity.ts              # DDD Entity classes
│   └── type.ts                # Type definitions & Zod schemas
├── db/
│   ├── schema.ts              # Mongoose schema
│   ├── repository.ts          # Repository implementation
│   └── repository.port.ts     # Repository interface
└── dtos/
    └── module.dto.ts
```

---

## Critical Patterns (Non-Negotiable)

### 1. Result Pattern - MANDATORY
**ALL services return `Result<T, Error>` from `oxide.ts`**:

```typescript
import { Result, Ok, Err } from 'oxide.ts'

async create(args: CreateArgs): Promise<Result<Entity, Error>> {
  const entity = new MyEntity({ ... })
  const validation = entity.validate()
  if (!validation.success) return Err(new BadPayloadError(validation.error.message))
  return this.repository.create({ entity })
}
```
**Never throw exceptions - always return `Err(error)`**

### 2. Controller Pattern
```typescript
async createSomething(req: AuthorizedRequest): Promise<Result<ApiResponse, Error>> {
  this.logger.info('ControllerName.createSomething', { body: req.body })
  
  const result = await this.service.create({ data: req.body, companyId: req.company })
  if (result.isErr()) {
    this.logger.error('Error creating', { error: result.unwrapErr() })
    return result
  }
  
  const dto = this.mapper.toResponseFromDomain(result.unwrap())
  return Ok(new ApiResponse().ok({ entity: dto }))
}
```
**Flow**: Log → Call service → Check error → Map to DTO → Return ApiResponse

### 3. Router Pattern
```typescript
export default function getMyModuleRouter(args: {
  myModuleHttpController: MyModuleHttpController
  authMiddleware: ExpressMiddleware
  requestTransformer: RequestTransformer
}) {
  const { myModuleHttpController: controller, authMiddleware, requestTransformer } = args
  const getHandler = (fn: Controller) => requestTransformer(fn.bind(controller))
  const router = Router()
  
  router.use(authMiddleware)
  router.get('/', getHandler(controller.getAll))
  router.post('/', getHandler(controller.create))
  
  return router
}
```
**Always**: Accept auth/transformer as args, use `getHandler()` wrapper, bind controller methods

### 4. Entity Pattern
```typescript
import Entity from '@lib/ddd/entity.base'

export default class MyEntity extends Entity<MyEntityProps> {
  validate(): SafeParseReturnType<MyEntityProps, MyEntityProps> {
    return MyEntitySchema.safeParse(this.props)
  }
  
  activate(): void {
    this.props.status = 'active'
    this.props.updatedAt = Date.now()
  }
}
```
**Rules**: Immutable props, always implement `validate()` with Zod, domain logic in entity methods

### 5. Repository Pattern
```typescript
// repository.port.ts
export default interface MyRepositoryPort extends RepositoryPort {
  create(args: { entity: MyEntity }): Promise<Result<MyEntity, Error>>
  getById(args: { id: string }): Promise<Result<MyEntity, Error>>
}

// repository.ts - Singleton pattern
export default class MyRepository extends MongooseRepositoryBase<MyEntity, MyDbRecord> {
  private static instance: MyRepository | null = null
  
  static init(mongoDB: MongoDB, mapper: MyMapper): MyRepository {
    if (MyRepository.instance) throw new Error('Already initialized')
    const model = mongoDB.connection.model<MyDbRecord>('Model', mySchema, 'collection')
    MyRepository.instance = new MyRepository(model, mapper)
    return MyRepository.instance
  }
  
  static getInstance(): MyRepository {
    if (!MyRepository.instance) throw new Error('Not initialized')
    return MyRepository.instance
  }
}
```

### 6. Mapper Pattern
```typescript
export default class MyMapper implements Mapper<MyEntity, MyDbRecord, MyResponseDto> {
  toPersistenceFromDomain(entity: MyEntity): MyDbRecord {
    const { id, createdAt, updatedAt, ...rest } = entity.getProps()
    return { ...rest, _id: new ObjectId(id), createdAt: new Date(createdAt).getTime() }
  }
  
  toDomainFromPersistence(record: MyDbRecord): MyEntity {
    const { _id: id, ...rest } = record
    return new MyEntity({ id: id.toString(), props: { ...rest } })
  }
  
  toResponseFromDomain(entity: MyEntity): MyResponseDto {
    return entity.getProps()
  }
}
```

### 7. Module Index (Dependency Injection)
```typescript
export default class MyModule {
  private readonly repository: MyRepository
  private readonly service: MyService
  public readonly httpController: MyHttpController
  
  constructor(private readonly mongoDB: MongoDB) {
    const mapper = new MyMapper()
    this.repository = MyRepository.init(this.mongoDB, mapper)
    this.service = new MyService(this.repository)
    this.httpController = new MyHttpController(this.service, mapper)
  }
  
  getRouter(args: { authMiddleware: ExpressMiddleware, reqTransformer: RequestTransformer }) {
    return getMyModuleRouter({ myModuleHttpController: this.httpController, ...args })
  }
}
```

---

## API Responses & Errors

**Success responses**:
```typescript
return Ok(new ApiResponse().ok({ entity: data }))        // 200
return Ok(new ApiResponse().created({ entity: data }))   // 201
return Ok(new ApiResponse().noContent())                 // 204
```

**Error types** (`@lib/util/errors`):
- `BadPayloadError` - 400 (Invalid request data)
- `InvalidArgumentError` - 400 (Missing/invalid params)
- `ResourceNotFoundError` - 404
- `UnauthorizedError` - 401
- `AlreadyExistsError` - 409
- `InvalidOperationError` - 400 (Business rule violation)

**Usage**: `return Err(new InvalidArgumentError('ID required'))`

---

## Path Aliases (ALWAYS USE)

```typescript
import { ApiResponse } from '@lib/api'
import { MongoDB } from '@lib/db/mongo'
import Entity from '@lib/ddd/entity.base'
import { Logger } from '@lib/util/logging'
import MyModule from '@modules/my-module'
import QRApp from '@conf/qr-app.conf'
```
**Never use relative imports** across modules.

---

## Database Patterns

**Mongoose Schema**:
```typescript
const mySchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'] },
  createdAt: { type: Number },
  updatedAt: { type: Number },
}, { collection: 'myCollection', timestamps: false })
```

**Query Handlers** (for complex reads):
```typescript
export default class FindMyEntityQueryHandler {
  constructor(private mongoDB: MongoDB) {}
  
  async execute(args: QueryArgs): Promise<MyDto[]> {
    const collection = this.mongoDB.db.collection('myCollection')
    return await collection.find(args.filter).toArray()
  }
}
```

---

## Logging

```typescript
import { Logger } from '@lib/util/logging'

export default class MyService {
  private readonly logger = new Logger('MyService')
  
  async method(args: Args): Promise<Result<T, Error>> {
    this.logger.info('MyService.method', args)
    try {
      // logic
      return Ok(result)
    } catch (error) {
      this.logger.error('Error occurred', { error })
      return Err(error as Error)
    }
  }
}
```

---

## Adding New Endpoint (4 Steps)

1. **Router**: `router.post('/action', getHandler(controller.myAction))`
2. **Controller**: Call service, check error, map to DTO, return ApiResponse
3. **Service**: Business logic, return `Result<Entity, Error>`
4. **Repository** (if needed): Add method to port interface and implementation

---

## Quick Reference Files

**Type** (domain/type.ts):
```typescript
import { z } from 'zod'
export const MyEntitySchema = z.object({
  name: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.number(),
})
export type MyEntityProps = z.infer<typeof MyEntitySchema>
```

**Entity** (domain/entity.ts):
```typescript
export default class MyEntity extends Entity<MyEntityProps> {
  validate() { return MyEntitySchema.safeParse(this.props) }
}
```

**Service** (services/service.ts):
```typescript
export default class MyService {
  private readonly logger = new Logger('MyService')
  constructor(private readonly repository: MyRepositoryPort) {}
  
  async create(args: CreateArgs): Promise<Result<MyEntity, Error>> {
    const entity = new MyEntity({ id: this.repository.generateId(), props: args })
    if (!entity.validate().success) return Err(new BadPayloadError('Invalid'))
    return this.repository.create({ entity })
  }
}
```

---

## What to AVOID

❌ Throw exceptions from services → Use `Result` pattern  
❌ Relative imports across modules → Use path aliases  
❌ Business logic in controllers → Keep in services  
❌ Direct DB access from controllers → Use repositories  
❌ Skip validation in entities  
❌ Return raw Mongoose docs → Map to entities/DTOs  
❌ Bypass mapper → Use `toResponseFromDomain()`  

---

## Key Takeaways

1. **Everything returns `Result<T, Error>`** - no exceptions from services
2. **Controllers orchestrate, services contain logic**
3. **Always use mappers** for all transformations
4. **Follow module structure exactly** - no shortcuts
5. **Repositories are singletons** with `init()` and `getInstance()`
6. **Use path aliases** - never relative imports
7. **Validate in entities** using Zod
8. **Log at service boundaries**