/** @type {import('next').NextConfig} */
const nextConfig = {
  // OTP auth used to rely on a /api/proxy/:path* rewrite here. That baked
  // NEXT_PUBLIC_BASE_API_URL in at build time, so Preview deploys (or any build
  // without the env var) proxied to "undefined/..." and users saw errors like
  // "Cannot GET /415.shtml". Use app/api/proxy/[...path]/route.ts instead.
};

module.exports = nextConfig;
