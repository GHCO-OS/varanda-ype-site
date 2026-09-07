param([string]$DatabaseName = "varanda-delivery-db")
$ErrorActionPreference = "Stop"

Write-Host "Verificando autenticação Cloudflare..."
npx wrangler whoami
if ($LASTEXITCODE -ne 0) { throw "Autenticação Cloudflare inválida. Corrija o token/login antes de criar recursos." }

$databases = npx wrangler d1 list --json | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw "Não foi possível listar bancos D1." }
$database = $databases | Where-Object { $_.name -eq $DatabaseName } | Select-Object -First 1

if (-not $database) {
  Write-Host "Criando $DatabaseName..."
  npx wrangler d1 create $DatabaseName --location enam --binding DELIVERY_DB --update-config
  if ($LASTEXITCODE -ne 0) { throw "Falha ao criar o banco D1." }
} else {
  Write-Host "Banco existente encontrado; nenhum banco duplicado será criado."
  $config = Get-Content -Raw -LiteralPath "wrangler.jsonc" | ConvertFrom-Json
  $binding = [pscustomobject]@{
    binding = "DELIVERY_DB"
    database_name = $DatabaseName
    database_id = $database.uuid
    migrations_dir = "./migrations"
  }
  if ($config.PSObject.Properties.Name -contains "d1_databases") { $config.d1_databases = @($binding) }
  else { $config | Add-Member -NotePropertyName d1_databases -NotePropertyValue @($binding) }
  $config | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath "wrangler.jsonc" -Encoding utf8
}

Write-Host "Aplicando migrations remotas com backup automático..."
npx wrangler d1 migrations apply DELIVERY_DB --remote
if ($LASTEXITCODE -ne 0) { throw "Falha ao aplicar migrations." }

npx wrangler d1 execute DELIVERY_DB --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
if ($LASTEXITCODE -ne 0) { throw "Falha ao verificar tabelas." }
Write-Host "Banco D1 e migrations prontos."
