# Comprehensive Error Handling System

This document outlines the error handling architecture implemented in the AIBeautyLens application.

## Table of Contents

1. [Backend Error Handling](#backend-error-handling)
2. [Frontend Error Handling](#frontend-error-handling)
3. [How to Use](#how-to-use)
4. [Best Practices](#best-practices)

## Backend Error Handling

### Global Exception Filter

The `GlobalExceptionFilter` provides consistent error responses across the application. It transforms all exceptions (NestJS HTTP exceptions and unexpected errors) into a standardized format:

```json
{
  "statusCode": 400,
  "timestamp": "2023-05-30T12:34:56.789Z",
  "path": "/api/users",
  "method": "POST",
  "message": "Email is already in use",
  "error": "BadRequestException"
}
```

In development mode, a `stackTrace` field is also included to aid debugging.

### Response Transformation

The `TransformInterceptor` ensures consistent response format for successful responses:

```json
{
  "statusCode": 200,
  "timestamp": "2023-05-30T12:34:56.789Z",
  "path": "/api/users",
  "method": "GET",
  "data": { ... },
  "message": "User created successfully"
}
```

### Centralized Logging

The `AppLoggerService` provides:

- Log level filtering based on environment
- File-based logging (separate files for errors and combined logs)
- Structured log format with timestamp, level, context, and message
- Console output for immediate feedback

## Frontend Error Handling

### Error Boundary

React Error Boundaries catch JavaScript errors in the component tree and display fallback UIs. The `ErrorBoundary` component:

- Catches and logs render errors
- Provides a user-friendly fallback UI
- Supports custom fallback components
- Allows error reset
- Reports errors to the global error context

### Global Error Context

The `ErrorProvider` context manages application-wide error handling:

- Shows error toasts
- Captures and formats errors
- Maintains an error queue
- Provides hooks for components to report errors

### Error Toast

The `ErrorToast` component:

- Displays error messages with appropriate styling based on error type
- Animates in/out for a smooth user experience
- Auto-dismisses after a configurable duration
- Allows manual dismissal

### API Error Handling

The `ApiClient` and `useApi` hook provide:

- Consistent error handling for all API requests
- Automatic token refresh on 401 errors
- Request/response logging in development
- Retry capability with exponential backoff
- Error normalization to `ApiError` type

## How to Use

### Backend

1. **For Controllers and Services**

```typescript
// Controllers
@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      // No need to handle - GlobalExceptionFilter will catch it
      throw error;
    }
  }
}

// Services
@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    try {
      // Business logic
    } catch (error) {
      // Optionally transform to a more specific exception
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }
}
```

2. **Logging**

```typescript
@Injectable()
export class SomeService {
  constructor(private logger: AppLoggerService) {
    this.logger.setContext('SomeService');
  }

  async doSomething() {
    this.logger.log('Doing something');
    try {
      // Code
    } catch (error) {
      this.logger.error('Failed to do something', error.stack);
      throw error;
    }
  }
}
```

### Frontend

1. **Wrap Components with Error Boundary**

```tsx
// Individual component
function MyComponent() {
  return (
    <ErrorBoundary>
      <SomeComponent />
    </ErrorBoundary>
  );
}

// Already done for the entire app in App.tsx
```

2. **Use the Error Context**

```tsx
function MyComponent() {
  const { showError, captureError } = useError();

  const handleAction = () => {
    try {
      // Do something that might fail
    } catch (error) {
      captureError(error);
      // or for simple messages:
      // showError('Failed to perform action', 'warning');
    }
  };

  return <Button onPress={handleAction}>Do Action</Button>;
}
```

3. **Use the API Hook**

```tsx
function UsersList() {
  const { data, loading, error, execute } = useApi<User[]>('get', '/api/users');

  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>Error: {error.message}</Text>}
      {data && (
        <FlatList
          data={data}
          renderItem={({ item }) => <UserItem user={item} />}
        />
      )}
      <Button onPress={execute}>Refresh</Button>
    </View>
  );
}
```

4. **With Automatic Retry**

```tsx
// With automatic retry (3 attempts with exponential backoff)
const { data, loading } = useApi<User[]>('get', '/api/users', null, {
  autoRetry: true,
  retryCount: 3,
});
```

5. **Use the ApiDataDisplay Component**

```tsx
function UserScreen() {
  return (
    <ApiDataDisplay<User[]>
      endpoint="/api/users"
      title="Users"
      renderItem={(users) => (
        <FlatList
          data={users}
          renderItem={({ item }) => <UserItem user={item} />}
        />
      )}
    />
  );
}
```

## Best Practices

1. **Use Specific Error Types**
   - Throw appropriate HTTP exceptions in the backend
   - Use the `ApiError` class with specific error types in the frontend

2. **Handle Errors at the Appropriate Level**
   - Catch and handle errors where they make the most sense
   - Don't catch errors just to rethrow them without transformation

3. **Provide Helpful Error Messages**
   - Messages should help users understand and resolve issues
   - Include actionable information when possible

4. **Use Consistent Error Formats**
   - Follow the established error response format
   - Include all necessary context (status code, timestamp, path, etc.)

5. **Log Appropriately**
   - Error logs should include stack traces
   - Avoid logging sensitive information
   - Use appropriate log levels (error, warn, info, debug)

6. **Implement Retries for Transient Failures**
   - Network errors
   - Rate limiting
   - Temporary service unavailability 