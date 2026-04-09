const fs = require('fs');
const path = 'placement/myapp/views/playground_dispatcher.py';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING DISPATCHER WITH UNIVERSAL DYNAMIC ENGINE
    // Added a database-fallback layer that automatically resolves assessments for 
    // any faculty-added subject WITHOUT requiring new Python view files.
    
    const insertionPoint = "import types";
    const dynamicResolver = `
    # 🛡️ 1000% UNIVERSAL DYNAMIC RESOLVER
    # If no static view exists, we search the database for a matching Exam pool.
    from myapp.models import Exam, MCQQuestion
    db_exams = Exam.objects.filter(title__icontains=subject)
    if db_exams.exists():
        exam = db_exams.first()
        mcqs = MCQQuestion.objects.filter(exam=exam)
        if mcqs.exists():
            data = []
            for q in mcqs:
                data.append({
                    "id": q.id,
                    "question": q.question_text,
                    "options": [q.option_a, q.option_b, q.option_c, q.option_d],
                    "correct": ['A','B','C','D'].index(q.correct_option)
                })
            return Response({"success": True, "data": data})

    `;
    
    content = content.replace(insertionPoint, dynamicResolver + "\n    " + insertionPoint);

    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Deployed Universal Dynamic Assessment Engine in playground_dispatcher.py.");
}
