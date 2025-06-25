# Express Route Handler Type Errors

## Problem Description
Several route handlers in `billing/index.ts` and `writinghelper/postgenerator.ts` have TypeScript errors related to Express route handler return types and request/response typing.

## Current Issues
1. Route handlers returning Response objects instead of void/Promise<void>
2. Type conflicts between Express.Request and AuthenticatedRequest
3. Missing type definitions for BillingService methods
4. Incorrect type exports

## Temporary Solution
Added tsconfig override to disable strict type checking for affected files:
```json
{
  "overrides": [
    {
      "files": ["src/modules/billing/index.ts", "src/modules/writinghelper/postgenerator.ts"],
      "compilerOptions": {
        "noImplicitAny": false,
        "strictNullChecks": false,
        "strictFunctionTypes": false,
        "noImplicitReturns": false
      }
    }
  ]
}
```

## Proper Fix Required
1. Update route handlers to follow Express typing:
   ```typescript
   router.get('/route', auth, (req: Request, res: Response): void => {
     res.json(data);  // no return
   });
   ```

2. Create proper type definitions:
   ```typescript
   interface BillingService {
     getTokenUsage(userId: string): Promise<TokenUsage>;
     // ... other methods
   }

   export interface TokenUsage {
     // ... type definition
   }
   ```

3. Fix AuthenticatedRequest handling:
   ```typescript
   const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response) => Promise<void>): RequestHandler => {
     return async (req, res, next): Promise<void> => {
       try {
         await fn(req as AuthenticatedRequest, res);
       } catch (error) {
         next(error);
       }
     };
   };
   ```

## Next Steps
1. [ ] Add proper type definitions for all exported types
2. [ ] Update BillingService interface
3. [ ] Fix route handler return types
4. [ ] Remove tsconfig override once fixed

## Related Files
- `backend/src/modules/billing/index.ts`
- `backend/src/modules/writinghelper/postgenerator.ts`
- `backend/tsconfig.json`

# Express Type Error Guide

## Common Type Errors

1. Return type errors in route handlers:
   ```typescript
   // ❌ Wrong - returns Response object
   app.get('/api/route', (req, res) => {
     return res.json(data);
   });

   // ✅ Correct - void return type
   app.get('/api/route', (req, res) => {
     res.json(data);
   });
   ```

2. Missing void/Promise<void> return type annotations:
   ```typescript
   // ❌ Wrong - missing return type
   app.get('/api/route', async (req, res) => {
     res.json(await getData());
   });

   // ✅ Correct - explicit return type
   app.get('/api/route', async (req, res): Promise<void> => {
     res.json(await getData());
   });
   ```

## Using Type-Safe Wrappers

We provide two wrapper functions to handle common type issues and error handling:

1. `wrapHandler` - For regular routes:
   ```typescript
   // Synchronous response
   app.get('/api/route', wrapHandler((req, res) => {
     return data; // The wrapper will call res.json(data)
   }));

   // Asynchronous response
   app.get('/api/route', wrapHandler(async (req, res) => {
     const result = await getData();
     return result; // The wrapper will call res.json(result)
   }));
   ```

2. `wrapAuthHandler` - For authenticated routes:
   ```typescript
   // Synchronous response
   app.post('/api/secure', authenticateUser, wrapAuthHandler((req, res) => {
     const userId = req.user?.id;
     if (!userId) {
       res.status(401).json({ error: 'Not authenticated' });
       return;
     }
     return data; // The wrapper will call res.json(data)
   }));

   // Asynchronous response
   app.post('/api/secure', authenticateUser, wrapAuthHandler(async (req, res) => {
     const userId = req.user?.id;
     if (!userId) {
       res.status(401).json({ error: 'Not authenticated' });
       return;
     }
     const result = await getData(userId);
     return result; // The wrapper will call res.json(result)
   }));
   ```

Key points about the wrappers:
- They handle error catching automatically
- They ensure proper void/Promise<void> return types
- The wrapped handler should only take (req, res) parameters
- No need to pass the next parameter to the wrapped handler
- No need for try/catch blocks in the wrapped handler
- They handle both synchronous and asynchronous responses using Promise.resolve()
- You can either use res.json()/res.send() or return the data directly:
  ```typescript
  // Both are valid:
  wrapHandler((req, res) => {
    res.json(data);
  });

  wrapHandler((req, res) => {
    return data; // The wrapper will call res.json(data)
  });
  ```

## Early Returns Pattern

When you need to return early from a route handler:

```typescript
app.get('/api/route', wrapHandler((req, res) => {
  if (!req.query.id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }
  return data; // The wrapper will call res.json(data)
}));
```

## Type Definitions

The type definitions are in `src/modules/shared/types.ts`:

```typescript
export type SafeRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type SafeAuthenticatedHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export const wrapHandler = (handler: (req: Request, res: Response) => any): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve()
      .then(() => handler(req, res))
      .then((result) => {
        if (result !== undefined) {
          res.json(result);
        }
      })
      .catch(next);
  };
};
```

## Migration Steps

1. Import the wrappers:
   ```typescript
   import { wrapHandler, wrapAuthHandler } from '../shared/types';
   ```

2. Replace direct route handlers with wrapped ones:
   ```typescript
   // Before
   app.get('/api/route', (req, res, next) => {
     try {
       res.json(data);
     } catch (error) {
       next(error);
     }
   });

   // After
   app.get('/api/route', wrapHandler((req, res) => {
     return data; // The wrapper will call res.json(data)
   }));
   ```

3. For authenticated routes:
   ```typescript
   // Before
   app.post('/api/secure', authenticateUser, async (req: AuthRequest, res, next) => {
     try {
       const userId = req.user?.id;
       res.json(await getData(userId));
     } catch (error) {
       next(error);
     }
   });

   // After
   app.post('/api/secure', authenticateUser, wrapAuthHandler(async (req, res) => {
     const userId = req.user?.id;
     return await getData(userId); // The wrapper will call res.json(data)
   }));
   ```

## Common Mistakes to Avoid

1. Don't mix return and res.json():
   ```typescript
   // ❌ Wrong - mixing styles
   wrapHandler((req, res) => {
     if (error) {
       res.status(400).json({ error });
       return;
     }
     return data; // Don't mix styles
   });

   // ✅ Correct - consistent style with res.json()
   wrapHandler((req, res) => {
     if (error) {
       res.status(400).json({ error });
       return;
     }
     res.json(data);
   });

   // ✅ Also correct - consistent style with return
   wrapHandler((req, res) => {
     if (error) {
       res.status(400).json({ error });
       return;
     }
     return data; // The wrapper will call res.json(data)
   });
   ```

2. Don't include next parameter in wrapped handlers:
   ```typescript
   // ❌ Wrong
   wrapHandler((req, res, next) => {
     return data;
   });

   // ✅ Correct
   wrapHandler((req, res) => {
     return data;
   });
   ```

3. Don't add try/catch in wrapped handlers:
   ```typescript
   // ❌ Wrong
   wrapHandler((req, res) => {
     try {
       return data;
     } catch (error) {
       // Don't do this
     }
   });

   // ✅ Correct
   wrapHandler((req, res) => {
     return data;
   });
   ``` 