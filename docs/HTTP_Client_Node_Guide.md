# HTTP Client Node - Comprehensive Usage Guide

This guide provides detailed explanations of all features and usage scenarios for the HTTP Client Node in the BPAZ-Agentic-Platform platform.

## 🚀 What is HTTP Client Node?

HTTP Client Node is a powerful component of the BPAZ-Agentic-Platform platform that sends HTTP requests to external services. It is used for connecting to RESTful APIs, fetching/sending data, and integrating with external systems.

## ⚙️ Core Features

### 🌐 HTTP Methods
- **GET** - Data retrieval
- **POST** - Data sending/creation
- **PUT** - Data update/replacement
- **PATCH** - Partial update
- **DELETE** - Data deletion
- **HEAD** - Header information only
- **OPTIONS** - Learn supported methods

### 🔐 Authentication Types
- **Bearer Token** - JWT and OAuth tokens
- **Basic Auth** - Username/password
- **API Key** - As header or query parameter
- **Custom Headers** - Custom authentication headers
- **No Auth** - For open APIs

### 📄 Content Type Support
- **application/json** - JSON data (default)
- **application/x-www-form-urlencoded** - Form data
- **multipart/form-data** - File uploads
- **text/plain** - Text data
- **application/xml** - XML data
- **Custom** - Custom content types

## 🔧 Configuration Parameters

### 📋 Basic Settings
```json
{
  "url": "https://api.example.com/users",
  "method": "GET",
  "timeout": 30,
  "follow_redirects": true,
  "verify_ssl": true
}
```

### 🔑 Authentication Settings
```json
{
  "auth_type": "bearer",
  "auth_token": "your-jwt-token-here",
  "auth_username": "user@example.com",
  "auth_password": "secure-password",
  "api_key_header": "X-API-Key",
  "api_key_value": "api-key-value"
}
```

### 📝 Request Body and Headers
```json
{
  "headers": {
    "Content-Type": "application/json",
    "User-Agent": "BPAZ-Agentic-Platform/2.1.0",
    "Accept": "application/json"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## 🎯 Usage Scenarios

### 1. **RESTful API Integration**
```json
{
  "url": "https://jsonplaceholder.typicode.com/posts",
  "method": "POST",
  "content_type": "application/json",
  "body": {
    "title": "{{title}}",
    "body": "{{content}}", 
    "userId": 1
  },
  "headers": {
    "Authorization": "Bearer {{token}}"
  }
}
```

### 2. **Webhook Calling**
```json
{
  "url": "https://hooks.slack.com/services/xxx/yyy/zzz",
  "method": "POST",
  "content_type": "application/json",
  "body": {
    "text": "BPAZ-Agentic-Platform notification: {{message}}",
    "channel": "#alerts"
  }
}
```

### 3. **Database API Queries**
```json
{
  "url": "https://api.airtable.com/v0/{{base_id}}/{{table_name}}",
  "method": "GET",
  "auth_type": "bearer",
  "auth_token": "{{airtable_token}}",
  "headers": {
    "Accept": "application/json"
  }
}
```

### 4. **File Upload**
```json
{
  "url": "https://api.cloudinary.com/v1_1/{{cloud_name}}/image/upload",
  "method": "POST",
  "content_type": "multipart/form-data",
  "body": {
    "file": "{{file_data}}",
    "upload_preset": "ml_default"
  }
}
```

## 🎨 Template Engine (Jinja2)

### Dynamic URLs
```json
{
  "url": "https://api.github.com/repos/{{owner}}/{{repo}}/issues",
  "method": "GET"
}
```

### Conditional Content
```json
{
  "body": {
    "status": "{% if priority == 'high' %}urgent{% else %}normal{% endif %}",
    "priority": "{{priority}}",
    "message": "{{message | title}}"
  }
}
```

### Loops and Lists
```json
{
  "body": {
    "items": [
      "{% for item in items %}",
      {
        "id": "{{item.id}}",
        "name": "{{item.name}}"
      },
      "{% if not loop.last %},{% endif %}",
      "{% endfor %}"
    ]
  }
}
```

## 🔄 Retry and Error Handling

### Retry Configuration
```json
{
  "max_retries": 3,
  "retry_delay": 1,
  "retry_exponential_backoff": true,
  "retry_on_status_codes": [502, 503, 504],
  "circuit_breaker_enabled": true
}
```

### Error Responses
```json
{
  "status_code": 404,
  "error": "Not Found",
  "response": {
    "message": "Resource not found",
    "error_code": "RESOURCE_NOT_FOUND"
  },
  "request_time": "2024-08-06T09:30:00Z"
}
```

## 📊 Response Processing

### Successful Response
```json
{
  "status_code": 200,
  "headers": {
    "Content-Type": "application/json",
    "X-RateLimit-Remaining": "99"
  },
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "response_time": 0.45,
  "request_url": "https://api.example.com/users/1"
}
```

### Response Filtering
```json
{
  "response_filter": "$.data.users[*].{id: id, name: name}",
  "extract_field": "data.access_token",
  "save_to_variable": "user_token"
}
```

## 🛡️ Security Features

### SSL/TLS Verification
```json
{
  "verify_ssl": true,
  "ssl_cert_path": "/path/to/cert.pem",
  "ssl_key_path": "/path/to/key.pem",
  "ssl_ca_bundle": "/path/to/ca-bundle.crt"
}
```

### Proxy Support
```json
{
  "proxy_url": "http://proxy.company.com:8080",
  "proxy_username": "proxy_user",
  "proxy_password": "proxy_pass"
}
```

## 🔗 Workflow Integration

### 1. **API Chain Workflow**
```json
{
  "nodes": [
    {
      "id": "auth_request",
      "type": "HttpClient",
      "data": {
        "url": "https://api.service.com/auth",
        "method": "POST",
        "body": {"username": "{{user}}", "password": "{{pass}}"}
      }
    },
    {
      "id": "data_request", 
      "type": "HttpClient",
      "data": {
        "url": "https://api.service.com/data",
        "method": "GET",
        "auth_type": "bearer",
        "auth_token": "{{auth_request.response.access_token}}"
      }
    }
  ]
}
```

### 2. **Conditional API Calls**
```json
{
  "condition": "{{previous_response.status_code}} == 200",
  "if_true": {
    "url": "https://api.success-handler.com/webhook",
    "method": "POST",
    "body": {"status": "success", "data": "{{data}}"}
  },
  "if_false": {
    "url": "https://api.error-handler.com/webhook", 
    "method": "POST",
    "body": {"status": "error", "error": "{{error}}"}
  }
}
```

## 📈 Performance & Monitoring

### Request Metrics
```json
{
  "request_metrics": {
    "response_time": 0.245,
    "dns_lookup_time": 0.012,
    "connection_time": 0.089,
    "ssl_handshake_time": 0.156,
    "transfer_time": 0.088,
    "total_time": 0.245
  }
}
```

### Rate Limiting
```json
{
  "rate_limit_enabled": true,
  "requests_per_second": 10,
  "burst_size": 50,
  "rate_limit_headers": {
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": "85",
    "X-RateLimit-Reset": "1641234567"
  }
}
```

## 🧪 Testing & Debugging

### Test Configuration
```json
{
  "test_mode": true,
  "mock_response": {
    "status_code": 200,
    "body": {"id": 1, "name": "Test User"},
    "headers": {"Content-Type": "application/json"}
  },
  "debug_logging": true,
  "save_request_response": true
}
```

### Debug Output
```json
{
  "debug_info": {
    "request_headers": {"Authorization": "[REDACTED]"},
    "request_body": {"name": "John"},
    "response_headers": {"Content-Type": "application/json"},
    "curl_command": "curl -X POST 'https://api.example.com/users' -H 'Content-Type: application/json' -d '{\"name\":\"John\"}'"
  }
}
```

## 🎯 Best Practices

### 1. **Error Handling**
```json
{
  "error_handling": {
    "on_4xx": "log_and_continue",
    "on_5xx": "retry_with_backoff", 
    "on_timeout": "retry_once",
    "on_network_error": "fail_fast"
  }
}
```

### 2. **Security**
```json
{
  "security_practices": {
    "never_log_auth_headers": true,
    "use_environment_variables": true,
    "validate_ssl_certificates": true,
    "sanitize_sensitive_data": true
  }
}
```

### 3. **Performance**
```json
{
  "performance_tips": {
    "connection_pooling": true,
    "keep_alive": true,
    "compression": "gzip",
    "timeout_optimization": true
  }
}
```

## 📋 Common Use Cases

### 1. **CRM Integration**
- Synchronize customer data
- Automatically create leads
- Update sales pipeline

### 2. **Notification Systems**
- Slack/Teams notifications
- Email services
- SMS gateway integration

### 3. **Data Collection**
- Fetch data from APIs
- Scheduled data sync
- Real-time data streaming

### 4. **Authentication Flows**
- OAuth token retrieval
- JWT refresh operations
- Multi-step authentication

## 🛠️ Troubleshooting

### Common Errors
```json
{
  "connection_timeout": {
    "error": "Connection timed out",
    "solution": "Increase timeout value or check network connection"
  },
  "ssl_error": {
    "error": "SSL certificate verification failed", 
    "solution": "Set verify_ssl: false or use correct certificates"
  },
  "404_not_found": {
    "error": "Resource not found",
    "solution": "Check URL and endpoint"
  }
}
```

## 📚 Examples

### GitHub API Integration
```json
{
  "url": "https://api.github.com/user/repos",
  "method": "GET",
  "auth_type": "bearer",
  "auth_token": "{{github_token}}",
  "headers": {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "BPAZ-Agentic-Platform-Bot"
  }
}
```

### Stripe Payment Processing
```json
{
  "url": "https://api.stripe.com/v1/charges",
  "method": "POST", 
  "auth_type": "basic",
  "auth_username": "{{stripe_secret_key}}",
  "auth_password": "",
  "content_type": "application/x-www-form-urlencoded",
  "body": {
    "amount": "{{amount}}",
    "currency": "usd",
    "source": "{{token}}"
  }
}
```

The HTTP Client Node is a powerful and flexible tool for building integrations with external systems in the BPAZ-Agentic-Platform platform. You can easily create your own API integrations using the examples in this guide.
