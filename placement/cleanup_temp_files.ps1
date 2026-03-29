# Cleanup script - removes temporary/debug files
# Does NOT touch: code files, manage.py, myapp/, static/, documentation

$filesToDelete = @(
    "5.txt",
    "check_db.py",
    "check_db_file.py",
    "check_records.py",
    "clear_dummy_data.py",
    "count.txt",
    "db_check_final.txt",
    "db_desc_out.txt",
    "db_out.txt",
    "db_test_out.txt",
    "debug.txt",
    "debug_attempts.py",
    "debug_out.txt",
    "debug_req.py",
    "debug_req2.py",
    "debug_script.py",
    "diagnose.py",
    "diag_db.py",
    "fetch_api.py",
    "fix_users.py",
    "grep.txt",
    "leaderboard_debug.log",
    "mig.txt",
    "migrate_out.txt",
    "mig_list.txt",
    "mig_utf8.txt",
    "out.txt",
    "output.json",
    "output.txt",
    "stats.txt",
    "test_api.py",
    "test_daily.py",
    "test_db.py",
    "test_out2.txt",
    "test_output.txt",
    "test_q.txt",
    "test_q5.txt",
    "test_q6.txt",
    "test_reports.txt",
    "test_req.py"
)

$deleteCount = 0
$baseDir = Get-Location

Write-Host "🧹 Starting cleanup of temporary files..." -ForegroundColor Green
Write-Host ""

foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $baseDir $file
    
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force -ErrorAction Stop
            Write-Host "✓ Deleted: $file" -ForegroundColor Green
            $deleteCount++
        }
        catch {
            Write-Host "✗ Failed to delete: $file" -ForegroundColor Red
        }
    }
    else {
        Write-Host "- Skipped (not found): $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✓ Cleanup complete!" -ForegroundColor Green
Write-Host "  Deleted: $deleteCount files" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Remaining structure:" -ForegroundColor Yellow
Write-Host "  ✓ manage.py (Django manager)"
Write-Host "  ✓ myapp/ (your app code - UNTOUCHED)"
Write-Host "  ✓ placement/ (settings - UNTOUCHED)"
Write-Host "  ✓ static/ (static files)"
Write-Host "  ✓ package.json (dependencies)"
Write-Host "  ✓ Documentation files (*.md)"
Write-Host "  ✓ test_login_emails.py (new test suite)"
