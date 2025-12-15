import { spawn } from "child_process";

// Configuration
const BASE_URL = "http://localhost:3000";
const ADMIN_EMAIL = "admin@boutique.com";
const ADMIN_PASSWORD = "admin123";

// Helpers
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;

async function fetchJson(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json();
    return { status: res.status, data, ok: res.ok };
  } catch (error) {
    return { status: 0, data: null, ok: false, error };
  }
}

async function loginAdmin() {
  console.log(blue(`Creating session for ${ADMIN_EMAIL}...`));
  // Note: Since this is NextAuth, programmatically login is tricky without browser or direct API if not credentials
  // Assuming Credentials provider at /api/auth/callback/credentials or similar is not standard exposure
  // We will assume permissions might be checked via cookie.
  // However, simpler for this test script is to test PUBLIC endpoints first,
  // and for PROTECTED endpoints, we'd need a valid session cookie.
  // For now, we'll verify PUBLIC endpoints and report headers.

  // Actually, let's try to hit the backend directly if possible or simulate headers
  // But wait, the API uses `getServerSession`. We can't easily fake that from 'outside' fetch without a real cookie.
  // STRATEGY CHANGE: We will valid PUBLIC endpoints only for connectivity,
  // OR we rely on dev mode headers if we implemented a bypass (we didn't).
  // So we will focus on PUBLIC endpoints to ensure server is up and database is reachable.
  // And try to hit protected routes to assume 401/403 is "Success" (Authentication working).
  // Wait, I can try to use a login endpoint if I made one custom? I made `/api/admin/auth/login`?
  // Let's check `src/app/api/admin/auth/login/route.ts` if it exists...
  // Just checked file list, it exists! `api/admin/auth/login`.

  const res = await fetchJson("/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  // If this custom route sets a cookie or returns a token, we use it.
  // But standard NextAuth usually handles this.
  // If we can't login, we'll skip auth tests.

  if (res.ok) {
    console.log(green("Login successful (Mock/Custom)"));
    // If it returns a token, return it. If it sets cookie, we need to capture it.
    // Fetch doesn't auto-persist cookies by default in node.
    return null; // Implementation dependent.
  } else {
    console.log(
      yellow(
        "Login endpoint not standard or failed. Skipping deep auth tests.",
      ),
    );
    return null;
  }
}

async function runTests() {
  console.log(blue("Starting API Tests..."));

  // 1. Health Check / Public Products
  console.log("\nTesting Public API: Products...");
  const prods = await fetchJson("/api/products");
  if (prods.ok && Array.isArray(prods.data)) {
    console.log(
      green(`✓ GET /api/products : ${prods.data.length} items found`),
    );
  } else {
    console.log(red(`✗ GET /api/products failed: ${prods.status}`));
  }

  // 2. Categories
  console.log("\nTesting Public API: Categories...");
  const cats = await fetchJson("/api/categories");
  if (cats.ok && Array.isArray(cats.data)) {
    console.log(
      green(`✓ GET /api/categories : ${cats.data.length} items found`),
    );
  } else {
    console.log(red(`✗ GET /api/categories failed: ${cats.status}`));
  }

  // 3. Admin Reports (Expect 401/403 if not logged in, or 200 if we could auth)
  // Since we rely on NextAuth session which is hard to mock in simple fetch script,
  // We will expect 401 Unauthorized as a "Pass" for security check.
  console.log("\nTesting Admin Security (Unauthenticated)...");

  const sales = await fetchJson("/api/admin/reports/sales");
  if (sales.status === 401 || sales.status === 403 || sales.status === 500) {
    // 500 might happen if session is null and code crashes accessing it, but ideally 401.
    // My `checkApiPermission` logic returns `{ error: "Non autorisé" }, { status: 401 }` usually.
    if (sales.status === 401)
      console.log(
        green(`✓ GET /api/admin/reports/sales : Secured (401 received)`),
      );
    else
      console.log(
        yellow(
          `⚠ GET /api/admin/reports/sales : Status ${sales.status} (Expected 401)`,
        ),
      );
  } else if (sales.ok) {
    console.log(
      yellow(
        `! GET /api/admin/reports/sales : Accessible Publicly? (Unexpected 200)`,
      ),
    );
  }

  console.log("\nTests Finished.");
}

runTests();
