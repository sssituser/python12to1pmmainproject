const fs = require('fs');
const path = 'placementapp/src/pages/DailyExam.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ DEPLOYING INDESTRUCTIBLE SESSION ENGINE
    // Fulfilling requirement: "It should not happen like that again to any user. Current page should persist on refresh."
    
    // 1. Remove the explicit state deletion on mount
    const badCleanup = `// Always start fresh - don't restore previous exam state
    try {
      sessionStorage.removeItem('dailyExamState');
    } catch (e) {
      console.error("Failed to clear session storage:", e);
    }`;
    
    // We will replace the entire logic in that useEffect with a restoration-first approach.
    
    const startOfMountEffect = 'useEffect(() => {\n    if (!courseResolved) return;';
    
    const restorationCode = `
    // 🏗️ 1000% SESSION RESTORATION ENGINE
    const restoreState = () => {
      try {
        const saved = sessionStorage.getItem('dailyExamState');
        if (saved) {
          const state = JSON.parse(saved);
          // Only restore if the refreshed subject matches the stored subject
          if (state.subjectKey === subjectKey) {
            setExamStarted(state.examStarted);
            setQuestions(state.questions);
            setAnswers(state.answers);
            setTimeLeft(state.timeLeft);
            setExamDuration(state.examDuration);
            setWarningCount(state.warningCount || 0);
            setCurrentQuestion(state.currentQuestion || 0);
            setMarksPerQuestion(state.marksPerQuestion || 2);
            setPassingRule(state.passingRule || 'percentage');
            setPassingValue(state.passingValue || 50);
            setIsLoadingQuestions(false);
            return true;
          }
        }
      } catch (e) {
        console.error("Session restoration failed:", e);
      }
      return false;
    };

    if (restoreState()) return;

    if (localStorage.getItem("examResult")) {
      navigate("/dashboard/playground-results", { replace: true });
      return;
    }
    `;

    // 2. Add the Persistence Effect
    const persistenceEffect = `
  // 🛡️ 1000% STATE PERSISETNCE WATCHDOG
  useEffect(() => {
    if (questions.length > 0 && !examSubmitted) {
      const state = {
        subjectKey,
        examStarted,
        questions,
        answers,
        timeLeft,
        examDuration,
        warningCount,
        currentQuestion,
        marksPerQuestion,
        passingRule,
        passingValue
      };
      sessionStorage.setItem('dailyExamState', JSON.stringify(state));
    }
  }, [questions, answers, timeLeft, examStarted, examSubmitted, warningCount, currentQuestion, subjectKey, examDuration, marksPerQuestion, passingRule, passingValue]);

  // Prevent accidental refresh warnings
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (examStarted && !examSubmitted) {
        e.preventDefault();
        e.returnValue = "Exam is in progress. Refreshing may cause data loss.";
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examStarted, examSubmitted]);
    `;

    // Injection:
    // We replace the block from 303 to 312
    const targetBlock = /if\s*\(\s*localStorage\.getItem\("examResult"\)\s*\)\s*\{[\s\S]*?sessionStorage\.removeItem\('dailyExamState'\);[\s\S]*?}/;
    
    if (targetBlock.test(content)) {
        content = content.replace(targetBlock, restorationCode);
        
        // Inject Persistence Effect before the component's closing brace
        // Find the last occurrence of "return (" which typically starts the JSX
        const returnIndex = content.lastIndexOf('return (');
        if (returnIndex !== -1) {
            content = content.substring(0, returnIndex) + persistenceEffect + "\n  " + content.substring(returnIndex);
        }
        
        fs.writeFileSync(path, content, 'utf8');
        console.log("SUCCESS: Deployed Indestructible Session Engine in DailyExam.jsx.");
    } else {
        console.log("ERROR: Could not find restoration target block.");
    }
}
