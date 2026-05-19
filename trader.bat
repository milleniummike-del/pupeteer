@echo off
cd /d market\trader

start "Trader 1" cmd /k "npm start"
start "Trader 2" cmd /k "npm start"
start "Trader 3" cmd /k "npm start"