// Test script for Netlify Functions
const fs = require('fs');
const path = require('path');

console.log('Testing Netlify Functions structure...\n');

// Check if functions directory exists
const functionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
    console.error('ERROR: netlify/functions directory does not exist');
    process.exit(1);
}

// List files in functions directory
const files = fs.readdirSync(functionsDir);
console.log('Functions directory contents:');
files.forEach(file => {
    console.log(`  - ${file}`);
});

// Check each function file
const requiredFunctions = ['process-payment.js', 'payment-status.js', 'health.js'];
console.log('\nChecking required functions:');

requiredFunctions.forEach(func => {
    const funcPath = path.join(functionsDir, func);
    if (fs.existsSync(funcPath)) {
        console.log(`  ✓ ${func} - Found`);
        
        // Check if file has content
        const content = fs.readFileSync(funcPath, 'utf8');
        if (content.length > 0) {
            console.log(`    Size: ${content.length} characters`);
        } else {
            console.log(`    WARNING: ${func} is empty`);
        }
    } else {
        console.log(`  ✗ ${func} - NOT FOUND`);
    }
});

// Check Netlify config
const netlifyConfig = path.join(__dirname, 'netlify.toml');
if (fs.existsSync(netlifyConfig)) {
    console.log('\n✓ netlify.toml - Found');
    const configContent = fs.readFileSync(netlifyConfig, 'utf8');
    console.log(`  Size: ${configContent.length} characters`);
} else {
    console.log('\n✗ netlify.toml - NOT FOUND');
}

console.log('\nNetlify Functions setup verification complete.');