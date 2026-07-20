$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5132"

Write-Host "1. Testing Swagger..."
$swagger = Invoke-RestMethod -Uri "$baseUrl/swagger/v1/swagger.json" -Method Get
if ($swagger.openapi) { Write-Host "Swagger loaded successfully." -ForegroundColor Green }

Write-Host "2. Testing GET /api/book..."
$books = Invoke-RestMethod -Uri "$baseUrl/api/book" -Method Get
Write-Host "Got $($books.data.items.Count) books." -ForegroundColor Green

Write-Host "4. Logging in as Admin..."
$loginBody = @{
    email = "admin@libraryms.com"
    password = "Admin@123456!"
} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "Login response data: $($loginResponse | ConvertTo-Json -Depth 5)"
$token = $loginResponse.data.token

if ($null -eq $token) {
    Write-Host "Failed to extract token!" -ForegroundColor Red
} else {
    Write-Host "Token received!" -ForegroundColor Green

    Write-Host "5. Testing /api/auth/test-auth (Authorized endpoint)..."
    $testAuthResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/test-auth" -Method Get -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Auth Test: $($testAuthResponse.message)" -ForegroundColor Green
    
    Write-Host "6. Testing GET /api/category..."
    $categories = Invoke-RestMethod -Uri "$baseUrl/api/category" -Method Get
    Write-Host "Got $($categories.data.Count) categories." -ForegroundColor Green

    Write-Host "7. Testing POST /api/category (Admin)..."
    $newCategory = @{ name = "Test Category"; description = "Test Desc" } | ConvertTo-Json
    $catResponse = Invoke-RestMethod -Uri "$baseUrl/api/category" -Method Post -Body $newCategory -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Category created: $($catResponse.data.name)" -ForegroundColor Green

    Write-Host "8. Testing GET /api/dashboard/statistics (Admin)..."
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/statistics" -Method Get -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Dashboard Stats - Total Books: $($stats.data.totalBooks)" -ForegroundColor Green

    Write-Host "ALL BASIC TESTS PASSED!" -ForegroundColor Cyan
}
