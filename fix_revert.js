const fs = require('fs');
const path = 'placement/myapp/views/python_views.py';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ ENFORCING PERMANENT REVERT LOGIC
    // Fulfilling requirement: "after completing the exam, again the user should get permanent settings automatically"
    
    // 1. Ensure AutomatedExamConfig is imported
    if (!content.includes('AutomatedExamConfig')) {
        content = content.replace('from ..models import ', 'from ..models import AutomatedExamConfig, ');
    }
    
    // 2. Inject Revert/Purge logic into save_exam_report_api
    const target = "return Response({\n        'success': True,\n        'message': 'Exam report saved successfully',";
    
    const purgeLogic = `
    # 🏗️ 1000% AUTOMATIC REVERT TO LIFETIME PATTERN
    # Purge transient faculty overrides once an exam is completed to restore default (25q/80m/2marks)
    try:
        if student_course:
            AutomatedExamConfig.objects.filter(course_name__iexact=student_course.strip()).delete()
    except Exception as e:
        print(f"Revert Pattern Error: {e}")
    `;
    
    if (content.includes(target)) {
        content = content.replace(target, purgeLogic + "\n    " + target);
        fs.writeFileSync(path, content, 'utf8');
        console.log("SUCCESS: Deployed Lifetime Revert Pattern in python_views.py.");
    } else {
        console.log("ERROR: Target Response block not found in python_views.py.");
    }
}
