# WorldHopper account setup

The profile icon opens `/sign-in.html`. Guest access is available from both pages. Supabase Auth manages the session. World progress is still saved locally in the browser.

## Run locally

Use Node.js 22.12 or later. From the repo root:

```sh
npm install
npm run dev
npm test
npm run build
```

Vite builds both HTML entry points into `dist/`. The shared site styles live in `src/styles.css`. The account theme and scoped Tailwind utilities live in `src/account.css`. The supplied form and its shadcn primitives live under `components/ui/`. That folder matches the `@/components/ui/*` imports and the UI alias in `components.json`, so future generated primitives resolve in the same place.

The branch includes the Vite, Tailwind and TypeScript setup. For a fresh Vite TypeScript project, the equivalent setup is `npm create vite@latest -- --template react-ts`, followed by Tailwind v4 setup and `npx shadcn@latest init`. Here `components.json` is already configured, so the init command is unnecessary. Use `npx shadcn@latest add <component>` when adding other primitives.

## Enable authentication

1. Create or select a Supabase Free project. Copy `.env.example` to `.env.local` and set the project URL and **publishable** key. Set the same variables in Vercel for the environments that should accept sign-ins. The build embeds these values in the browser bundle, so keep service-role keys and OAuth secrets out of them.
2. In Supabase Auth URL Configuration, set the site URL and allow the account URLs for each environment. For local Vite the routes are `http://localhost:5173/sign-in.html` and `http://localhost:5173/sign-in.html?mode=reset`. Add the corresponding production routes and only the preview origins you intend to use.
3. For Google sign-in, add a Google OAuth Web client and allow the Supabase Auth callback URL shown in the provider settings. Enter the client ID and secret in Supabase's Google provider configuration.
4. For public email sign-up and recovery, enable the email provider and configure custom SMTP. Keep email confirmation enabled for public registration. Supabase's built-in test sender only supports project team members. Open confirmation and recovery links in the browser that initiated the request so PKCE can complete.
5. Restart Vite after setting local variables and redeploy after setting Vercel variables. Verify Google sign-in, email confirmation, password recovery and sign-out using test accounts.

Without a configured project, account submission is disabled and the map remains accessible as a guest.
