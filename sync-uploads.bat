@echo off
REM Sync script to copy files from media to image directory
REM This is a temporary fix until all uploads go directly to the correct directories

set MEDIA_DIR=c:\Users\kyron\Downloads\Migs and Bia\MigsAndBia\uploads\media
set IMAGE_DIR=c:\Users\kyron\Downloads\Migs and Bia\MigsAndBia\uploads\image

REM Create image directory if it doesn't exist
if not exist "%IMAGE_DIR%" mkdir "%IMAGE_DIR%"

REM Copy all files from media to image directory
copy "%MEDIA_DIR%\*" "%IMAGE_DIR%\" >nul 2>&1

echo Files synced from media to image directory
