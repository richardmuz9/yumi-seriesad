# Test script for Alipay endpoints
$ErrorActionPreference = "Stop"

# Configuration
$baseUrl = "http://localhost:3001"
$email = "test@example.com"
$password = "testpassword123"
$packageId = "tokens_5"  # Example token package ID

# Helper function to make HTTP requests
function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$ContentType = "application/json",
        [string]$Token
    )
    
    $headers = @{
        "Content-Type" = $ContentType
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Method = $Method
        Uri = "$baseUrl$Endpoint"
        Headers = $headers
    }
    
    if ($Body) {
        if ($ContentType -eq "application/json") {
            $params["Body"] = ($Body | ConvertTo-Json)
        } else {
            $params["Body"] = $Body
        }
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "Error calling $Endpoint"
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Response: $($_.ErrorDetails.Message)"
        throw
    }
}

# Step 1: Check if server is running
try {
    $healthCheck = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "Server is running"
} catch {
    Write-Host "Server is not running. Please start the server first."
    exit 1
}

# Step 2: Register test user
try {
    $registerBody = @{
        email = $email
        password = $password
    }
    $registerResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/api/auth/register" -Body $registerBody
    Write-Host "User registered successfully"
    $token = $registerResponse.token
} catch {
    # If registration fails, try logging in
    try {
        $loginBody = @{
            email = $email
            password = $password
        }
        $loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/api/auth/login" -Body $loginBody
        Write-Host "User logged in successfully"
        $token = $loginResponse.token
    } catch {
        Write-Host "Failed to register/login user"
        exit 1
    }
}

# Step 3: Test Alipay checkout endpoint
try {
    $checkoutBody = @{
        packageId = $packageId
        provider = "alipay"
    }
    $checkoutResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/api/billing/checkout" -Body $checkoutBody -Token $token
    Write-Host "Checkout successful"
    Write-Host "Payment URL: $($checkoutResponse.url)"
} catch {
    Write-Host "Checkout failed"
    exit 1
}

# Step 4: Test Alipay webhook endpoint
try {
    $webhookBody = @{
        out_trade_no = "TEST_" + [Guid]::NewGuid().ToString("N")
        trade_status = "TRADE_SUCCESS"
        total_amount = "5.50"  # Example amount with tax
    }
    $webhookResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/api/billing/webhook/alipay" -Body $webhookBody -ContentType "application/x-www-form-urlencoded"
    Write-Host "Webhook test successful"
} catch {
    Write-Host "Webhook test failed"
    exit 1
}

Write-Host "All tests completed successfully" 