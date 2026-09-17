# Production deployment

GitHub Pages does not deploy this repository automatically after a push.

To publish a release:

1. Commit the reviewed public files to `main`.
2. Copy the full 40-character SHA of that exact commit.
3. Run **Deploy approved commit to Pages** from the Actions tab.
4. Enter the full SHA and wait for validation and deployment to finish.
5. Verify `https://studiomox.ru` on desktop and mobile.

The workflow rejects branch names, shortened SHAs, uncommitted files, private or
operational directories, common credential/data files, missing production
assets, and retired first-visit promotions.
