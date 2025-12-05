# App Settings System Documentation

Hệ thống quản lý cài đặt ứng dụng động với caching tự động.

## Overview

- ✅ Load settings từ API endpoint `/api/settings/public`
- ✅ Cache tự động trong 24 giờ
- ✅ Fallback sang cache khi API fails
- ✅ TypeScript support đầy đủ
- ✅ Hooks React để dễ dàng sử dụng

## Cấu trúc

```
src/
├── types/
│   └── settings.ts          # Type definitions
├── lib/api/
│   └── settings.ts          # Settings API client với caching
├── hooks/
│   ├── use-app-settings.ts  # Main hook
│   └── use-settings-utils.ts # Utility hooks
└── app/(auth)/
    └── layout-client.tsx    # Example usage
```

## API Response Format

```json
[
  {
    "key": "app.branding.logo",
    "value": "/images/logo.png",
    "dataType": 12,
    "group": "branding"
  }
]
```

## Data Types

- `0`: String
- `1`: Text
- `9`: Email
- `12`: File/URL

## Settings Groups

- **branding**: Logo, favicon, theme
- **features**: Feature titles, descriptions, icons
- **footer**: Copyright, company info, contact
- **general**: Site name, description

## Usage

### 1. Get All Settings

```tsx
"use client";

import { useAppSettings } from "@/hooks/use-app-settings";

export function MyComponent() {
  const { settings, loading, error, getSetting } = useAppSettings();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const siteName = getSetting("app.general.siteName");

  return <h1>{siteName}</h1>;
}
```

### 2. Get Settings by Group

```tsx
import { useAppSettingsByGroup } from "@/hooks/use-app-settings";

export function BrandingComponent() {
  const { settings, loading } = useAppSettingsByGroup("branding");

  if (loading) return <div>Loading...</div>;

  return <img src={settings["app.branding.logo"]} alt="Logo" />;
}
```

### 3. Use Utility Hooks

```tsx
import { useBrandingSettings, useFooterSettings } from "@/hooks/use-settings-utils";

export function Header() {
  const { settings: branding } = useBrandingSettings();

  return <img src={branding["app.branding.logo"]} />;
}

export function Footer() {
  const { settings: footer } = useFooterSettings();

  return <p>{footer["app.footer.copyright"]}</p>;
}
```

### 4. Access Settings in Layout Client

```tsx
import { useAppSettingsByGroup } from "@/hooks/use-app-settings";

export function AuthLayoutClient() {
  const { settings: brandingSettings } = useAppSettingsByGroup("branding");
  const { settings: featureSettings } = useAppSettingsByGroup("features");
  const { settings: footerSettings } = useAppSettingsByGroup("footer");

  // Use settings to render dynamic content
  return (
    <div>
      <img src={brandingSettings["app.branding.logo"]} />
      {/* Render features dynamically */}
    </div>
  );
}
```

## API Client Methods

### `settingsApi.getAllSettings(): Promise<AppSettingsGrouped>`

Fetch all settings grouped by category. Auto-caches for 24 hours.

```typescript
const settings = await settingsApi.getAllSettings();
// {
//   branding: { "app.branding.logo": "/images/logo.png", ... },
//   features: { "app.features.feature1Title": "Quản lý tập trung", ... },
//   ...
// }
```

### `settingsApi.getSettingsByGroup(group: string): Promise<AppSettingsMap>`

Get settings for specific group.

```typescript
const branding = await settingsApi.getSettingsByGroup("branding");
// { "app.branding.logo": "/images/logo.png", ... }
```

### `settingsApi.getSettingValue(key: string): Promise<string | null>`

Get value for specific setting key.

```typescript
const logo = await settingsApi.getSettingValue("app.branding.logo");
// "/images/logo.png"
```

### `settingsApi.clearCache(): void`

Clear the cache (useful after updating settings).

```typescript
settingsApi.clearCache();
```

## Caching Strategy

1. **Default cache duration**: 24 hours (86,400,000 ms)
2. **Cache check**: Before fetching, check if cache is still valid
3. **Fallback**: If API fails, return cached data (even if expired)
4. **Empty fallback**: If no cache and API fails, return empty object

## Performance Benefits

- ✅ **Reduced API calls**: Settings cached for 24 hours
- ✅ **Faster load time**: Use cached settings immediately
- ✅ **Offline support**: Fallback to cache if network fails
- ✅ **Grouped data**: Organized by category for easier access

## Examples

### Dynamic Logo

```tsx
import Image from "next/image";
import { useBrandingSettings } from "@/hooks/use-settings-utils";

export function Logo() {
  const { settings } = useBrandingSettings();

  const logoUrl = settings["app.branding.logo"] || "/logo.png";

  return <Image src={logoUrl} alt="Logo" width={200} height={100} />;
}
```

### Dynamic Features List

```tsx
export function FeaturesList() {
  const { settings } = useFeatureSettings();

  const features = [
    {
      title: settings["app.features.feature1Title"],
      description: settings["app.features.feature1Description"],
      icon: settings["app.features.feature1Icon"],
    },
    // ... more features
  ];

  return (
    <div>
      {features.map((feature, idx) => (
        <div key={idx}>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
          {feature.icon && (
            <div dangerouslySetInnerHTML={{ __html: feature.icon }} />
          )}
        </div>
      ))}
    </div>
  );
}
```

### Dynamic Footer

```tsx
export function Footer() {
  const { settings } = useFooterSettings();

  return (
    <footer>
      <p>{settings["app.footer.copyright"]}</p>
      <p>{settings["app.footer.company"]}</p>
      {settings["app.footer.phone"] && <p>Tel: {settings["app.footer.phone"]}</p>}
      {settings["app.footer.email"] && <p>Email: {settings["app.footer.email"]}</p>}
    </footer>
  );
}
```

## Best Practices

1. **Use hooks**: Always use hooks instead of calling API directly in components
2. **Handle loading**: Check loading state and show skeleton/placeholder
3. **Handle errors**: Handle error state gracefully
4. **Group by category**: Use utility hooks (`useBrandingSettings`, etc.)
5. **Cache invalidation**: Clear cache after settings update via admin panel

## Testing

```typescript
import { useAppSettings } from "@/hooks/use-app-settings";

describe("useAppSettings", () => {
  it("should cache settings for 24 hours", async () => {
    const { getSetting } = useAppSettings();
    
    // First call - should fetch from API
    const logo1 = await getSetting("app.branding.logo");
    
    // Second call - should return cached
    const logo2 = await getSetting("app.branding.logo");
    
    expect(logo1).toBe(logo2);
  });
});
```

## Migration Checklist

- [ ] Replace hardcoded branding (logo, favicon) with `useBrandingSettings()`
- [ ] Replace hardcoded features with `useFeatureSettings()`
- [ ] Replace hardcoded footer with `useFooterSettings()`
- [ ] Replace hardcoded site name/description with `useGeneralSettings()`
- [ ] Test with different settings values
- [ ] Test cache invalidation
- [ ] Test offline fallback

## Future Enhancements

1. **Real-time updates**: Use WebSocket for instant settings updates
2. **Settings management UI**: Create admin panel for managing settings
3. **Settings validation**: Add schema validation for settings
4. **Settings versioning**: Track settings history and rollback
5. **Multi-language support**: Store settings in multiple languages
