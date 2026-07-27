# start-server.ps1 — اجرای SmartAgri با PM2
$env:PATH = "C:\Program Files\nodejs;C:\Users\Administrator\AppData\Roaming\npm;" + $env:PATH
Set-Location "C:\Users\Administrator\Desktop\محاسبه-هوشمند-طرح_های-کشاورزی"

# اگه pm2 در حال اجراست، فقط resurrect کن
pm2 resurrect 2>&1
if ($LASTEXITCODE -ne 0) {
    pm2 start ecosystem.config.cjs
}
pm2 save
