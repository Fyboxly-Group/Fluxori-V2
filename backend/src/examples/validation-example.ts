/**
 * Example of using the enhanced validation middleware with TypeScript
 */
import { Router, Request, Response } from 'express';
import { validate, Schema } from '../middleware/validation.middleware';
import { ValidatedRequest, InferSchemaType } from '../types/validation';

// Create a router
const router = Router();

// Define user validation schema with strong typing
const userCreateSchema = {
  body: {
    name: Schema.string({ required: true, min: 2, max: 100 }),
    email: Schema.string({ 
      required: true, 
      pattern: /^[^@]+@[^@]+\.[^@]+$/,
      description: 'Valid email address'
    }),
    age: Schema.number({ required: false, min: 18 }),
    roles: Schema.array(
      Schema.string({ enum: ['admin', 'user', 'guest'] as const }),
      { required: false }
    ),
    address: Schema.object({
      street: Schema.string({ required: true }),
      city: Schema.string({ required: true }),
      state: Schema.string({ required: false }),
      zipCode: Schema.string({ required: true })
    }, { required: false })
  },
  query: {
    includeDetails: Schema.boolean({ required: false, default: false })
  }
};

// Create type based on our schema
type UserCreateRequest = ValidatedRequest<
  InferSchemaType<typeof userCreateSchema.body>,
  InferSchemaType<typeof userCreateSchema.query>
>;

// Handler with type-safe access to validated data
const createUserHandler = (req: UserCreateRequest, res: Response) => {
  // Access validated body with type safety
  const { name, email, age, roles, address } = req.validatedBody!;
  
  // Access validated query with type safety
  const { includeDetails } = req.validatedQuery!;

  console.log(`Creating user ${name} with email ${email}`);
  if (age) {
    console.log(`User is ${age} years old`);
  }

  if (roles && roles.length > 0) {
    console.log(`User has roles: ${roles.join(', ')}`);
  }

  if (address) {
    console.log(`User address: ${address.street}, ${address.city}, ${address.state || 'N/A'}, ${address.zipCode}`);
  }

  // Return response
  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: includeDetails ? {
      name,
      email,
      age,
      roles,
      address
    } : {
      name,
      email
    }
  });
};

// Define search validation schema
const userSearchSchema = {
  query: {
    q: Schema.string({ required: false }),
    limit: Schema.number({ required: false, min: 1, max: 100, default: 10 }),
    page: Schema.number({ required: false, min: 1, default: 1 }),
    sortBy: Schema.string({ 
      required: false, 
      enum: ['name', 'email', 'createdAt'] as const,
      default: 'createdAt'
    }),
    sortOrder: Schema.string({ 
      required: false, 
      enum: ['asc', 'desc'] as const,
      default: 'desc'
    })
  }
};

// Create type based on our schema
type UserSearchRequest = ValidatedRequest<
  any,
  InferSchemaType<typeof userSearchSchema.query>
>;

// Handler with type-safe access to validated query parameters
const searchUsersHandler = (req: UserSearchRequest, res: Response) => {
  // Access validated query with type safety
  const { q, limit, page, sortBy, sortOrder } = req.validatedQuery!;

  console.log(`Searching users with query: ${q || 'all'}`);
  console.log(`Pagination: page ${page}, limit ${limit}`);
  console.log(`Sorting by ${sortBy} in ${sortOrder} order`);

  // In a real application, you would query the database here
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ];

  // Return response
  return res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users: mockUsers,
      pagination: {
        page,
        limit,
        total: 2,
        totalPages: 1
      },
      sorting: {
        sortBy,
        sortOrder
      }
    }
  });
};

// Register routes with validation
router.post('/users', validate(userCreateSchema), createUserHandler as any);
router.get('/users', validate(userSearchSchema), searchUsersHandler as any);

// Export router
export default router;