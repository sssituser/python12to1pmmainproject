const fs = require('fs');
const path = 'placement/myapp/views/playground_dispatcher.py';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING SUBJECT DISPATCHER MAPPING
    // Added 'springboot' and 'spring_boot' to the subject_map to enable assessment delivery.
    
    const target = "'c_data_structures': 'c_data_structures',";
    const replacement = target + "\n        'springboot': 'springboot',\n        'spring_boot': 'springboot',";
    
    if (content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(path, content, 'utf8');
        console.log("SUCCESS: Mapped SpringBoot in playground_dispatcher.py.");
    } else {
        console.log("ERROR: Target string not found.");
    }
}
