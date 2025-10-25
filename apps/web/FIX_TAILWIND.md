# Fix Tailwind CSS PostCSS Error

If you see an error about `@tailwindcss/postcss`, run these commands:

```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Install dependencies with correct Tailwind version
npm install

# Restart the dev server
npm run dev
```

This downgrades Tailwind CSS from v4 to the stable v3 version.
