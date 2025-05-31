import * as reporter from 'multiple-cucumber-html-reporter';
import * as fs from 'fs';
import * as path from 'path';

// Paths to test results
const CYPRESS_RESULTS = 'cypress/reports/cucumber-json';
const JEST_RESULTS = 'reports/junit';
const OUTPUT_DIR = 'reports/combined';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate the combined report
reporter.generate({
  jsonDir: CYPRESS_RESULTS,
  reportPath: path.join(OUTPUT_DIR, 'cucumber-report'),
  metadata: {
    browser: {
      name: 'chrome',
      version: '100',
    },
    device: 'Local Machine',
    platform: {
      name: 'MacOS',
      version: process.platform,
    },
  },
  customData: {
    title: 'Test Execution Report',
    data: [
      { label: 'Project', value: 'Express TypeScript API' },
      { label: 'Environment', value: process.env.NODE_ENV || 'development' },
      { label: 'Execution Time', value: new Date().toISOString() },
    ],
  },
  displayDuration: true,
  durationInMS: true,
  displayReportTime: true,
  pageTitle: 'Express TypeScript API Test Report',
  reportName: 'Combined Test Results',
  pageFooter: '<div class="created-by">Created by Cypress with Cucumber</div>',
});
