@echo off
echo ============================================================
echo Starting Trent Trace PySpark Sentiment & Topic Modeling Pipeline
echo ============================================================

cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo [!] Virtual environment .venv not found in pipeline/
    echo Please create it first using: py -m venv .venv
    exit /b 1
)

echo [*] Activating virtual environment...
call .venv\Scripts\activate.bat

echo [*] Step 1: Running Environment Validation Check...
.venv\Scripts\python.exe check_env.py
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Environment validation check failed. Please resolve issues before proceeding.
    pause
    exit /b %ERRORLEVEL%
)

echo [*] Step 2: Running Ingestion (Downloading/generating Reddit comments)...
.venv\Scripts\python.exe ingest.py
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Ingestion failed.
    pause
    exit /b %ERRORLEVEL%
)

echo [*] Step 3: Running Spark Cleaning, Sentiment Analysis & Topic Modeling...
.venv\Scripts\python.exe process.py
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Spark processing failed.
    pause
    exit /b %ERRORLEVEL%
)

echo ============================================================
echo [SUCCESS] Pipeline completed successfully!
echo Output saved in pipeline/output/dashboard_data.json
echo ============================================================
pause
