const isGithubActions = process.env.GITHUB_ACTIONS || false;

let assetPrefix = '';
let basePath = '';

if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '');
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

module.exports = {
  output: 'export', // 静的エクスポートを有効化
  assetPrefix,      // GitHub Pages 用のパス
  basePath,         // GitHub Pages 用のベースパス
  images: {
    unoptimized: true, // GitHub Pages では画像最適化が動作しないため
  },
};
