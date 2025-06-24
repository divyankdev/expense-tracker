# Jest Test Configuration Guide

## Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test Groups

To run specific test groups, edit `jest.config.js` and uncomment one of these lines:

#### Core Tests (Accounts, Users, Auth)
```javascript
testPathPattern: 'accountRoutes|userRoutes|authRoutes',
```

#### Transaction Tests
```javascript
testPathPattern: 'transactionRoutes|recurringTransactionRoutes',
```

#### Supporting Features Tests
```javascript
testPathPattern: 'categoryRoutes|budgetRoutes|attachmentRoutes|userTokenRoutes',
```

#### Single Test File
```javascript
testPathPattern: 'accountRoutes',
```

## Command Line Options

You can also override the config from command line:

```bash
# Run specific test file
npm test -- --testPathPattern='accountRoutes'

# Run multiple test files
npm test -- --testPathPattern='(accountRoutes|userRoutes)'

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run with verbose output
npm test -- --verbose
```

## Test Groups

### Core Tests
- `accountRoutes.test.js` - Account management
- `userRoutes.test.js` - User management  
- `authRoutes.test.js` - Authentication

### Transaction Tests
- `transactionRoutes.test.js` - Regular transactions
- `recurringTransactionRoutes.test.js` - Recurring transactions

### Supporting Tests
- `categoryRoutes.test.js` - Categories
- `budgetRoutes.test.js` - Budgets
- `attachmentRoutes.test.js` - File attachments
- `userTokenRoutes.test.js` - User tokens

## Configuration Features

- **Coverage**: Set `collectCoverage: true` to generate coverage reports
- **Timeouts**: Tests timeout after 10 seconds
- **Environment**: Tests run in Node.js environment
- **Mocks**: Automatically clears and restores mocks between tests 