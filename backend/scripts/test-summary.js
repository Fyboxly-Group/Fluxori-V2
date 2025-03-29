#!/usr/bin/env node

/**
 * Script to generate a test summary report from Jest coverage data
 * Run after jest with --json flag: jest --json --outputFile=coverage/jest-results.json
 */

const fs = require('fs');
const path = require('path');

// Get the coverage summary from the JSON file
const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
const resultsPath = path.join(__dirname, '../coverage/jest-results.json');

if (!fs.existsSync(coveragePath)) {
  console.error('Coverage summary file not found. Run tests with coverage first.');
  process.exit(1);
}

if (!fs.existsSync(resultsPath)) {
  console.error('Test results file not found. Run tests with --json flag.');
  process.exit(1);
}

try {
  const coverage = JSON.parse(fs.readFileSync(coveragePath));
  const results = JSON.parse(fs.readFileSync(resultsPath));
  
  // Generate the summary
  const summary = {
    testResults: {
      numTotalTests: results.numTotalTests,
      numPassedTests: results.numPassedTests,
      numFailedTests: results.numFailedTests,
      numPendingTests: results.numPendingTests,
      success: results.success,
      testFilesWithFailures: results.testResults
        .filter(result => result.numFailingTests > 0)
        .map(result => result.name),
    },
    coverageSummary: {
      statements: coverage.total.statements,
      branches: coverage.total.branches,
      functions: coverage.total.functions,
      lines: coverage.total.lines,
    },
    lowCoverageFiles: Object.entries(coverage)
      .filter(([key, value]) => key !== 'total' && value.statements.pct < 70)
      .map(([key, value]) => ({
        file: key,
        statements: value.statements.pct,
        branches: value.branches.pct,
        functions: value.functions.pct,
        lines: value.lines.pct,
      })),
    timestamp: new Date().toISOString(),
  };
  
  // Write the summary to a file
  const outputPath = path.join(__dirname, '../coverage/test-summary.json');
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  
  console.log('Test summary generated successfully.');
  console.log(`Total Tests: ${summary.testResults.numTotalTests}`);
  console.log(`Passed: ${summary.testResults.numPassedTests}`);
  console.log(`Failed: ${summary.testResults.numFailedTests}`);
  console.log(`Coverage: ${summary.coverageSummary.statements.pct}% (statements)`);
  
  if (summary.lowCoverageFiles.length > 0) {
    console.log('\nFiles with low coverage:');
    summary.lowCoverageFiles.forEach(file => {
      console.log(`- ${file.file}: ${file.statements}% (statements)`);
    });
  }
  
  // Exit with error if there are test failures
  if (summary.testResults.numFailedTests > 0) {
    console.error('\nTest failures detected. See summary for details.');
    process.exit(1);
  }
  
  process.exit(0);
} catch (error) {
  console.error('Error generating test summary:', error);
  process.exit(1);
}