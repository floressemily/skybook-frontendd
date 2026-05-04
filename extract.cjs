const fs = require('fs');
const path = require('path');
const logPath = 'C:\\Users\\milly\\.gemini\\antigravity\\brain\\8d2657da-5387-4462-b7b7-ea2f63db3582\\.system_generated\\logs\\overview.txt';
const logContent = fs.readFileSync(logPath, 'utf8');

const regex = /The following changes were made by the USER to: c:\\\\Users\\\\milly\\\\source\\\\repos\\\\microservicios\\\\MicroserviciosVuelos\\\\Frontend\\\\src\\\\pages\\\\admin\\\\([^.]+)\.jsx\..*?\[diff_block_start\]\n@@ -1,0 \+\d+,\d+ @@\n([\s\S]*?)\[diff_block_end\]/g;

let match;
const pagesDir = 'c:/Users/milly/source/repos/microservicios/MicroserviciosVuelos/Frontend/src/pages/admin';

let processedCount = 0;
while ((match = regex.exec(logContent)) !== null) {
    const filename = match[1] + '.jsx';
    let fileContent = match[2];
    
    // Process content to add JWT
    if (!fileContent.includes('useAuth')) {
        fileContent = fileContent.replace(/import \{ useState, useEffect \} from 'react';/, "import { useState, useEffect } from 'react';\nimport { useAuth } from '../../context/AuthContext';");
    }
    
    fileContent = fileContent.replace(/const (\w+) = \([^)]*\) => \{/g, (m, p1) => {
        return m + '\n  const { token } = useAuth();';
    });
    
    fileContent = fileContent.replace(/\/\/\s*'Authorization':\s*`Bearer \$\{token\}`/g, "'Authorization': `Bearer ${token}`");
    fileContent = fileContent.replace(/\/\/\s*TODO \(Antigravity\): agregar token JWT\n?/g, "");
    
    fs.writeFileSync(path.join(pagesDir, filename), fileContent, 'utf8');
    console.log('Processed ' + filename);
    processedCount++;
}

console.log('Processed total: ' + processedCount);
