const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, 'src', 'app', 'actions');
const files = fs.readdirSync(actionsDir);

for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    const filePath = path.join(actionsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let changed = false;
    
    if (content.includes('supabase.auth.getUser()')) {
        if (!content.includes('authService')) {
            content = 'import { authService } from "@/services/auth";\n' + content;
        }
        
        // Remove createClient calls
        content = content.replace(/const supabase = await createClient\(\);/g, '');
        
        // Replace supabase.auth.getUser() multi-line patterns
        content = content.replace(/const\s*\{\s*data:\s*\{\s*user\s*\}\s*,?\s*\}\s*=\s*await\s+supabase\.auth\.getUser\(\);/g, 'const user = await authService.requireUser();');
        content = content.replace(/const\s*\{\s*data:\s*\{\s*user\s*\}\s*\}\s*=\s*await\s+supabase\.auth\.getUser\(\);/g, 'const user = await authService.requireUser();');
        
        // Remove if (!user) ...
        content = content.replace(/if\s*\(!user\)\s*throw new Error\([^)]+\);/g, '');
        content = content.replace(/if\s*\(!user\)\s*return[^;]+;/g, '');
        
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
}
