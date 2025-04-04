/**
 * Script to fix TypeScript errors in the international-trade module
 * This addresses specific syntax issues in the compliance.service.ts file
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const INTERNATIONAL_TRADE_DIR = path.join(ROOT_DIR, 'backend', 'src', 'modules', 'international-trade');

// Stats tracking
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  errorsFix: {
    shipmentIdSyntax: 0,
    promiseAllSyntax: 0,
    missingClosingBraces: 0,
    commaErrors: 0,
    semicolonErrors: 0
  }
};

/**
 * Fix specific syntax errors in the compliance.service.ts file
 */
function fixComplianceService() {
  const filePath = path.join(INTERNATIONAL_TRADE_DIR, 'services', 'compliance.service.ts');
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  
  try {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix "shipment)Id: new mongoose.Types.ObjectId( shipment._id,"
    const shipmentIdRegex = /shipment\)\s*Id:\s*new\s+mongoose\.Types\.ObjectId\(\s*shipment\._id,/;
    if (shipmentIdRegex.test(content)) {
      content = content.replace(shipmentIdRegex, 'shipmentId: new mongoose.Types.ObjectId(shipment._id),');
      stats.errorsFix.shipmentIdSyntax++;
      modified = true;
    }
    
    // Fix Promise.all syntax
    const promiseAllRegex = /Promise<any>\.all<any>/g;
    if (promiseAllRegex.test(content)) {
      content = content.replace(promiseAllRegex, 'Promise.all<any>');
      stats.errorsFix.promiseAllSyntax++;
      modified = true;
    }
    
    // Fix object literals with missing commas and semicolons
    const sensitiveItemsRegex = /(hasSensitiveItems\s*=\s*shipment\.items\.some\(\(item:\s*any\)\s*=>\s*sensitiveCategories\.includes\(item\.category\s*\|\|\s*''\)\s*\);?)/;
    if (sensitiveItemsRegex.test(content)) {
      content = content.replace(sensitiveItemsRegex, 'hasSensitiveItems = shipment.items.some((item: any) => sensitiveCategories.includes(item.category || \'\'));');
      stats.errorsFix.semicolonErrors++;
      modified = true;
    }
    
    // Fix missing document checks
    const missingDocChecksRegex = /(const\s+missingDocChecks\s*=\s*compliance\.checks\.find\(\(check:\s*any\)\s*=>\s*check\.type\s*===\s*'document_requirements'\s*&&\s*check\.status\s*===\s*'failed'\s*\);?)/;
    if (missingDocChecksRegex.test(content)) {
      content = content.replace(missingDocChecksRegex, 'const missingDocChecks = compliance.checks.find((check: any) => check.type === \'document_requirements\' && check.status === \'failed\');');
      stats.errorsFix.semicolonErrors++;
      modified = true;
    }

    // Fix return type annotations for the methods
    [
      'private async checkProhibitedItems',
      'private async checkDocumentRequirements',
      'private async checkExportControls',
      'private async checkImportRestrictions',
      'private async assessRisk'
    ].forEach(methodSignature => {
      // Use a safer regex that doesn't try to match the entire method signature and parameters
      const methodRegex = new RegExp(`${methodSignature}\\s*\\([^{]*{`, 'g');
      if (methodRegex.test(content)) {
        content = content.replace(methodRegex, (match) => {
          if (!match.includes(': Promise<void>')) {
            return match.replace(/\)\s*{/, '): Promise<void> {');
          }
          return match;
        });
        stats.errorsFix.missingClosingBraces++;
        modified = true;
      }
    });
    
    // Fix calculateOverallCompliance method
    const calculateMethodRegex = /(private\s+calculateOverallCompliance\s*\([^)]+\))\s*{/;
    if (calculateMethodRegex.test(content)) {
      content = content.replace(calculateMethodRegex, '$1: void {');
      stats.errorsFix.missingClosingBraces++;
      modified = true;
    }
    
    // Fix private utility methods
    [
      'private determineHsCode',
      'private isProhibited',
      'private getRequiredDocuments',
      'private requiresCertificateOfOrigin',
      'private isExportControlled',
      'private getExportLicenseRequirements',
      'private getImportRestriction'
    ].forEach(methodSignature => {
      // Extract the method name to determine proper return type
      const methodName = methodSignature.match(/private\s+([a-zA-Z0-9_]+)$/)[1];
      let returnType = 'any';
      
      // Determine return type based on method name
      if (methodName === 'isProhibited' || methodName === 'requiresCertificateOfOrigin' || 
          methodName === 'isExportControlled') {
        returnType = 'boolean';
      } else if (methodName === 'getRequiredDocuments' || methodName === 'getExportLicenseRequirements') {
        returnType = 'string[]';
      } else if (methodName === 'determineHsCode') {
        returnType = 'string';
      } else if (methodName === 'getImportRestriction') {
        returnType = '{ reason: string; quota?: { limit: number; used: number; remaining: number } } | null';
      }
      
      // Use a safer regex that doesn't try to match the entire method signature and parameters
      const methodRegex = new RegExp(`${methodSignature}\\s*\\([^{]*{`, 'g');
      if (methodRegex.test(content)) {
        content = content.replace(methodRegex, (match) => {
          if (!match.includes(': ')) {
            return match.replace(/\)\s*{/, `): ${returnType} {`);
          }
          return match;
        });
        stats.errorsFix.missingClosingBraces++;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      console.log(`Fixed TypeScript errors in ${filePath}`);
    }
    
    stats.filesProcessed++;
  } catch (error) {
    console.error(`Error processing compliance.service.ts:`, error);
  }
}

/**
 * Main function to run the script
 */
function main() {
  console.log('Starting international-trade module fix script...');
  
  // Fix compliance.service.ts file specifically
  fixComplianceService();
  
  // Print summary
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log('Errors fixed:');
  console.log(`  - Shipment ID syntax: ${stats.errorsFix.shipmentIdSyntax}`);
  console.log(`  - Promise.all syntax: ${stats.errorsFix.promiseAllSyntax}`);
  console.log(`  - Missing closing braces/return types: ${stats.errorsFix.missingClosingBraces}`);
  console.log(`  - Comma errors: ${stats.errorsFix.commaErrors}`);
  console.log(`  - Semicolon errors: ${stats.errorsFix.semicolonErrors}`);
  console.log('\nDone!');
}

main();