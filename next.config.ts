import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image refuses a query string on a local image unless its path is allowed here, and
    // the certification badges carry ?v=<n> as a cache key. Optimised output is served from
    // /_next/image with a one-year immutable cache keyed on the source path, so a badge whose
    // pixels change while its filename does not keeps its old rendering at the edge and in
    // every browser that has seen it — which no redeploy can clear.
    //
    // No `search` here on purpose: pinning it to one value would mean the next version bump
    // fails the build with an error about image configuration, which is nobody's first guess.
    localPatterns: [{ pathname: "/certs/**" }],
  },
};

export default nextConfig;
