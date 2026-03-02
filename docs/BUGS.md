# Known Bugs & Fixes

Bugs encountered during development, with root cause analysis and the fix applied.

---

## Bug 1 — `pg_config executable not found`

**Error**
```
Error: pg_config executable not found.
```

**Context**
Occurred when running `pip install psycopg2` directly on the host (not inside Docker).

**Root Cause**
`psycopg2` requires PostgreSQL development headers and `pg_config` to compile.
These are not installed by default on Ubuntu.

**Fix**
```bash
sudo apt-get install libpq-dev gcc
```
Or switch to `psycopg2-binary` in `requirements.txt`, which ships pre-compiled
wheels and requires no system dependencies. The project uses `psycopg2-binary==2.9.6`.

**Lesson**
Prefer `psycopg2-binary` for containerised/dev environments. Use the source
`psycopg2` package only in production where you control the build environment.

---

## Bug 2 — Database connection fails inside container (`POSTGRES_SERVER=localhost`)

**Error**
```
sqlalchemy.exc.OperationalError: could not connect to server: Connection refused
    Is the server running on host "localhost" and accepting TCP/IP connections on port 5432?
```

**Context**
App ran inside Docker but tried to connect to `localhost:5432`. PostgreSQL was
running in a sibling container (`db`), not on localhost.

**Root Cause**
`POSTGRES_SERVER` in `.env` was set to `localhost`, which resolves to the
container itself. Inside Docker Compose, services communicate via their
service name.

**Fix**
Changed `POSTGRES_SERVER=localhost` to `POSTGRES_SERVER=db` in the `.env`
file on the server. The `db` hostname resolves to the PostgreSQL container
on Docker's internal network.

**Lesson**
`.env.example` should document this difference explicitly. Localhost works
for running the app directly on the host; the service name is required inside
Docker Compose.

---

## Bug 3 — `bcrypt` crash with `passlib` (`AttributeError: module 'bcrypt' has no attribute '__about__'`)

**Error**
```
AttributeError: module 'bcrypt' has no attribute '__about__'
```

**Context**
Occurred on startup when `passlib` tried to read the bcrypt version.

**Root Cause**
`passlib==1.7.4` was written before `bcrypt` v5, which removed the `__about__`
module. Running any recent `bcrypt` version broke passlib's introspection.

**Fix**
Pinned `bcrypt==4.0.1` in `requirements.txt`:
```
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
```

**Lesson**
When using libraries that introspect their dependencies (like passlib does with
bcrypt), pin both packages, not just the top-level one.

---

## Bug 4 — Node v24 incompatible with `react-scripts 4.0.1`

**Error**
```
Error: error:0308010C:digital envelope routines::unsupported
```

**Context**
Running `npm start` with Node 24 and `react-scripts 4.0.1`.

**Root Cause**
`react-scripts 4.x` uses Webpack 4, which relies on OpenSSL legacy APIs removed
in Node 17+. Node 24 ships OpenSSL 3 with strict defaults.

**Fix**
Used Node v18 via NVM:
```bash
nvm install 18
nvm use 18
npm start
```

**Lesson**
`react-scripts 4.x` is pinned to an older Node compatibility range. Use NVM
to manage Node versions per project. A long-term fix is upgrading to
`react-scripts 5.x` or migrating to Vite.

---

## Bug 5 — `ERR_OSSL_EVP_UNSUPPORTED`

**Error**
```
Error: error:0308010C:digital envelope routines::unsupported
    at new Hash (node:internal/crypto/hash:79:19)
```

**Context**
Same root cause as Bug 4. An alternative workaround without switching Node versions.

**Root Cause**
Node 17+ disables OpenSSL legacy providers by default.

**Fix**
Set the `NODE_OPTIONS` environment variable before running:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

**Lesson**
This is a workaround, not a fix. The proper resolution is Bug 4 (use Node 18)
or upgrade react-scripts.

---

## Bug 6 — CORS blocked between frontend (port 3000) and backend (port 8000)

**Error**
```
Access to fetch at 'http://localhost:8000/blogs' from origin 'http://localhost:3000'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Context**
React app (port 3000) making API calls to FastAPI (port 8000).

**Root Cause**
Browsers block cross-origin requests by default. FastAPI had no CORS middleware configured.

**Fix**
Added `CORSMiddleware` to `main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Lesson**
CORS must be explicitly configured for any API consumed by a browser on a
different origin. The `allow_origins` list must include the deployed frontend
URL when moving to production.

---

## Bug 7 — `process is not defined` in browser

**Error**
```
Uncaught ReferenceError: process is not defined
```

**Context**
React app loaded in the browser; some dependency referenced `process.env`.

**Root Cause**
`process` is a Node.js global. It doesn't exist in browsers. Some packages
depend on it (particularly older Redux/middleware packages), and Webpack 4
no longer automatically polyfills it.

**Fix**
Added a `window.process` polyfill to `public/index.html`:
```html
<script>
  window.process = {
    env: { NODE_ENV: 'development' }
  };
</script>
```

**Lesson**
The `NODE_ENV` value is hardcoded to `'development'` in this polyfill, which
is technically wrong in production builds. A proper fix is to configure
Webpack to inject `process.env.NODE_ENV` automatically, or upgrade to a
bundler that handles this (Vite, CRA v5).

---

## Bug 8 — Stray Unicode character `é` in API base URL

**Error**
All API requests failed silently or with network errors.

**Context**
`frontend/src/endpoints.js` BASEURL contained a stray `é` character:
```js
const BASEURL = "http://3.135.248.151:8000é";
```

**Root Cause**
Likely an accidental keypress during editing (common on French-layout keyboards
or macOS with Option key). The character was visually easy to miss.

**Fix**
Remove the `é` character so the URL is valid:
```js
const BASEURL = "http://3.135.248.151:8000/";
```

**Lesson**
API base URLs should come from environment variables (`process.env.REACT_APP_API_URL`),
not string literals, to prevent these errors and make environment switching trivial.

---

## Bug 9 — Extra whitespace in `detailEndpoint` URL path

**Error**
Blog detail page returned 404 or network error.

**Context**
`frontend/src/endpoints.js` had three spaces in the path:
```js
export const detailEndpoint = `${BASEURL}   blog`;
//                                      ^^^
```

**Root Cause**
Accidental whitespace in the template literal.

**Fix**
```js
export const detailEndpoint = `${BASEURL}blog/`;
```

**Lesson**
URL construction in string literals is fragile. Use a URL builder or
environment-variable-based config to avoid silent path errors.
