#!/usr/bin/env node

const { execSync } = require('child_process');
const { CORE_TESTS, TRANSACTION_TESTS, SUPPORTING_TESTS, ALL_TESTS } = require('../__tests__/test-groups');

const args = process.argv.slice(2);
const command = args[0];

const runTests = (testFiles) => {
  const pattern = testFiles.join('|');
  const command = `cross-env NODE_ENV=test jest --testPathPattern='(${pattern})'`;
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit' });
};

switch (command) {
  case 'core':
    console.log('Running core tests...');
    runTests(CORE_TESTS);
    break;
    
  case 'transactions':
    console.log('Running transaction tests...');
    runTests(TRANSACTION_TESTS);
    break;
    
  case 'supporting':
    console.log('Running supporting feature tests...');
    runTests(SUPPORTING_TESTS);
    break;
    
  case 'all':
    console.log('Running all tests...');
    runTests(ALL_TESTS);
    break;
    
  case 'watch':
    console.log('Running tests in watch mode...');
    execSync('cross-env NODE_ENV=test jest --watch', { stdio: 'inherit' });
    break;
    
  default:
    console.log(`
Test Runner Usage:
  node scripts/run-tests.js <command>

Available commands:
  core        - Run core API tests (accounts, users, auth)
  transactions - Run transaction-related tests
  supporting  - Run supporting feature tests
  all         - Run all tests
  watch       - Run tests in watch mode

Examples:
  node scripts/run-tests.js core
  node scripts/run-tests.js transactions
  node scripts/run-tests.js watch
    `);
} 