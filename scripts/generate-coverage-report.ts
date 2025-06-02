import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface CoverageSummary {
  total: {
    lines: { total: number; covered: number; pct: number };
    statements: { total: number; covered: number; pct: number };
    functions: { total: number; covered: number; pct: number };
    branches: { total: number; covered: number; pct: number };
  };
}

class CoverageReportGenerator {
  private coverageDir = 'coverage';
  private reportsDir = 'reports';

  async generateReport(): Promise<void> {
    try {
      await this.ensureDirectories();
      await this.generateReports();
      await this.generateSummaryReport();
      
      console.log('✅ Coverage reports generated successfully!');
      console.log(`📂 HTML Report: ${path.join(this.coverageDir, 'index.html')}`);
      console.log(`📂 Summary Report: ${path.join(this.reportsDir, 'coverage-summary.json')}`);
    } catch (error) {
      console.error('❌ Error generating coverage reports:', error);
      throw error;
    }
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [this.coverageDir, this.reportsDir];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private async generateReports(): Promise<void> {
    try {
      // Generate HTML report
      execSync('npx nyc report --reporter=html', { stdio: 'inherit' });
      
      // Generate LCOV report for better tooling support
      execSync('npx nyc report --reporter=lcov', { stdio: 'inherit' });
      
      // Generate text summary
      execSync('npx nyc report --reporter=text-summary', { stdio: 'inherit' });
      
    } catch (error) {
      console.error('Error generating NYC reports:', error);
      throw error;
    }
  }

  private async generateSummaryReport(): Promise<void> {
    try {
      // Generate JSON summary using NYC
      execSync('npx nyc report --reporter=json-summary', { stdio: 'inherit' });
      
      // Read the generated summary
      const summaryFile = path.join(this.coverageDir, 'coverage-summary.json');
      if (!fs.existsSync(summaryFile)) {
        throw new Error('Coverage summary file not found');
      }

      const coverageSummary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
      const summary = coverageSummary.total;
      
      const reportData = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        coverage: {
          lines: {
            total: summary.lines.total,
            covered: summary.lines.covered,
            percentage: summary.lines.pct,
          },
          statements: {
            total: summary.statements.total,
            covered: summary.statements.covered,
            percentage: summary.statements.pct,
          },
          functions: {
            total: summary.functions.total,
            covered: summary.functions.covered,
            percentage: summary.functions.pct,
          },
          branches: {
            total: summary.branches.total,
            covered: summary.branches.covered,
            percentage: summary.branches.pct,
          },
        },
        thresholds: {
          lines: 80,
          statements: 80,
          functions: 80,
          branches: 80,
        },
        status: this.getCoverageStatus(summary),
      };

      const customSummaryFile = path.join(this.reportsDir, 'coverage-summary.json');
      fs.writeFileSync(customSummaryFile, JSON.stringify(reportData, null, 2));

      // Generate a human-readable summary
      const textSummary = this.generateTextSummary(reportData);
      const textSummaryFile = path.join(this.reportsDir, 'coverage-summary.txt');
      fs.writeFileSync(textSummaryFile, textSummary);
      
    } catch (error) {
      console.error('Error generating coverage summary:', error);
      throw error;
    }
  }

  private getCoverageStatus(summary: any): 'passing' | 'failing' {
    const thresholds = { lines: 80, statements: 80, functions: 80, branches: 80 };
    
    return (
      summary.lines.pct >= thresholds.lines &&
      summary.statements.pct >= thresholds.statements &&
      summary.functions.pct >= thresholds.functions &&
      summary.branches.pct >= thresholds.branches
    ) ? 'passing' : 'failing';
  }

  private generateTextSummary(data: any): string {
    const { coverage, status, timestamp } = data;
    
    return `
📊 Coverage Report Summary
Generated: ${timestamp}
Environment: ${data.environment}
Status: ${status === 'passing' ? '✅ PASSING' : '❌ FAILING'}

Coverage Metrics:
📝 Lines:      ${coverage.lines.covered}/${coverage.lines.total} (${coverage.lines.percentage.toFixed(2)}%)
📋 Statements: ${coverage.statements.covered}/${coverage.statements.total} (${coverage.statements.percentage.toFixed(2)}%)
🔧 Functions:  ${coverage.functions.covered}/${coverage.functions.total} (${coverage.functions.percentage.toFixed(2)}%)
🌿 Branches:   ${coverage.branches.covered}/${coverage.branches.total} (${coverage.branches.percentage.toFixed(2)}%)

Thresholds: 80% minimum for all metrics
${status === 'failing' ? '\n⚠️  Coverage below required thresholds!' : '\n🎉 All coverage thresholds met!'}
`;
  }
}

// Run the coverage report generator
async function main() {
  const generator = new CoverageReportGenerator();
  await generator.generateReport();
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to generate coverage report:', error);
    process.exit(1);
  });
}

export { CoverageReportGenerator }; 