# API Key Management

## How API Keys are Loaded

The application now automatically loads API keys from the `src/api-keys/` directory at startup.

### Google Maps API Key

**File location:** `src/api-keys/google-maps`

**How it works:**
1. The `ApiKeyConfiguration` bean loads the key from the file on startup
2. The key is exposed through the `ApiKeyService`
3. Your application can inject `ApiKeyService` to get the key anywhere needed

### Using API Keys in Your Code

```java
@RestController
public class MyController {
    
    private final ApiKeyService apiKeyService;
    
    public MyController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }
    
    @GetMapping("/use-maps")
    public ResponseEntity<?> useGoogleMaps() {
        String apiKey = apiKeyService.getGoogleMapsApiKey();
        
        // Check if key is valid
        if (!apiKeyService.hasValidGoogleMapsKey()) {
            return ResponseEntity.status(400)
                .body("Google Maps API key not configured");
        }
        
        // Use the API key in your requests
        // ...
        
        return ResponseEntity.ok("Success");
    }
}
```

## Testing API Key Loading

Once your app is running, check if the API key was loaded:

```bash
curl http://localhost:8080/api/test/api-keys/status
```

**Response if key is loaded:**
```json
{
  "google_maps_loaded": true,
  "google_maps_key_preview": "AIzaSyC...",
  "message": "API keys successfully loaded"
}
```

**Response if key is NOT found:**
```json
{
  "google_maps_loaded": false,
  "google_maps_key_preview": "NOT LOADED",
  "message": "API keys not found. Please add src/api-keys/google-maps file"
}
```

## Security Notes

✅ **What's Protected:**
- `src/api-keys/` directory is in `.gitignore`
- API key files will never be committed to Git
- You can safely commit code that references the API keys

⚠️ **What You Must Do:**
1. Keep your actual API keys in the `src/api-keys/` folder (NOT in Git)
2. Share `.gitignore` but NOT the files in `src/api-keys/`
3. Each developer should have their own API keys in their local `src/api-keys/` folder

## Adding More API Keys

To add another API key (e.g., for a different service):

1. **Create the file:**
   ```bash
   echo "YOUR_KEY_HERE" > src/api-keys/service-name
   ```

2. **Add to .gitignore** (if not already there):
   ```
   src/api-keys/
   ```

3. **Load it in `ApiKeyConfiguration.java`:**
   ```java
   @Bean
   public String serviceNameApiKey() {
       return loadApiKeyFromFile("src/api-keys/service-name");
   }
   ```

4. **Create a getter in `ApiKeyService.java`:**
   ```java
   public String getServiceNameApiKey() {
       return serviceNameApiKey;
   }
   ```

## Fallback Behavior

If an API key file is missing:
- The application will still start successfully
- A warning will be logged
- The placeholder `YOUR_API_KEY_HERE` will be used
- Endpoints can check `hasValidGoogleMapsKey()` to handle missing keys gracefully

## For Hackathon Deployment

If you need to deploy to a server:

1. **Add the API key to the server's environment**
2. **Update `ApiKeyConfiguration.java`** to also check environment variables:
   ```java
   String keyFromEnv = System.getenv("GOOGLE_MAPS_API_KEY");
   if (keyFromEnv != null && !keyFromEnv.isEmpty()) {
       return keyFromEnv;
   }
   ```

This way, you can use environment variables in production while keeping the file-based approach for local development.

