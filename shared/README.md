# MIT Salon — Shared Package

`@mit-salon/shared` — types, API client, UI components, styles used by **admin** and **customer**.

## Used by

- `../admin` — admin dashboard
- `../customer` — customer app

## Contents

- `src/types` — TypeScript models
- `src/services/api` — HTTP client (real backend API only)
- `src/components` — shared UI (dialog, select, inputs, etc.)
- `src/lib` — utilities, staff roles, catalog sync keys
- `src/styles/index.css` — global + dialog/select styles

## Own repo

Publish as `@mit-salon/shared` or copy this entire folder into admin/customer repos and set:

```json
"@mit-salon/shared": "file:./shared"
```

No runtime dependency on the backend folder.
