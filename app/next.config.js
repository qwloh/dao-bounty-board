/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/dao/:id/",
        destination: "/dao/:id/bounty-board",
        permanent: true,
      },
      // Path Matching - will match `/old-blog/a`, but not `/old-blog/a/b`
      {
        source: "/old-blog/:slug",
        destination: "/news/:slug",
        permanent: false,
      },
      // Wildcard Path Matching - will match `/blog/a` and `/blog/a/b`
      {
        source: "/blog/:slug*",
        destination: "/news/:slug*",
        permanent: false,
      },
      // Regex Path Matching - The regex below will match `/post/123` but not `/post/abc`
      {
        source: "/post/:slug(\\d{1,})",
        destination: "/news/:slug",
        permanent: false,
      },
    ];
  },
};
