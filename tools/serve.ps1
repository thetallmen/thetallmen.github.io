# Minimal local static server for previewing the site on Windows without Node or Python.
# Usage: powershell -ExecutionPolicy Bypass -File tools/serve.ps1 [-Port 5178]
param([int]$Port = 5178)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json'; '.svg' = 'image/svg+xml'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'
  '.png' = 'image/png'; '.webp' = 'image/webp'; '.mp4' = 'video/mp4'; '.txt' = 'text/plain'; '.yml' = 'text/yaml; charset=utf-8'; '.xml' = 'application/xml'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request; $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
    if ($rel -eq '' -or $rel.EndsWith('/')) { $rel = $rel + 'index.html' }
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $path.StartsWith($root) -or -not (Test-Path $path -PathType Leaf)) {
      $res.StatusCode = 404; $res.Close(); continue
    }
    $ext = [IO.Path]::GetExtension($path).ToLower()
    $res.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
    $res.Headers.Add('Accept-Ranges', 'bytes')
    $res.Headers.Add('Cache-Control', 'no-store') # always serve fresh edits while previewing
    $fs = [IO.File]::OpenRead($path)
    $len = $fs.Length; $start = 0; $end = $len - 1
    $range = $req.Headers['Range']
    if ($range -match 'bytes=(\d*)-(\d*)') {
      if ($matches[1]) { $start = [int64]$matches[1] }
      if ($matches[2]) { $end = [Math]::Min([int64]$matches[2], $len - 1) }
      $res.StatusCode = 206
      $res.Headers.Add('Content-Range', "bytes $start-$end/$len")
    }
    $count = $end - $start + 1
    $res.ContentLength64 = $count
    $fs.Seek($start, 'Begin') | Out-Null
    $buf = New-Object byte[] 65536
    while ($count -gt 0) {
      $n = $fs.Read($buf, 0, [Math]::Min($buf.Length, $count))
      if ($n -le 0) { break }
      $res.OutputStream.Write($buf, 0, $n); $count -= $n
    }
    $fs.Close()
  } catch { } finally { try { $res.Close() } catch { } }
}
