@echo off
SET JSFOLDER=src-min
chdir /d %JSFOLDER%
for /r . %%a in (*.js) do (
    rem @echo %%~a -m -o %%~fa
    uglifyjs %%~fa  -m -o %%~fa
)
echo ok
