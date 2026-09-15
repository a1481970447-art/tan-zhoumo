import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const token = execSync('gh auth token', { encoding: 'utf8' }).trim()
const owner = 'a1481970447-art'
const repo = 'tan-zhoumo'
const root = process.cwd()

async function api(path, method, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tan-zhoumo-deploy',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} ${res.status} ${text}`)
  return text ? JSON.parse(text) : {}
}

function walk(dir) {
  const files = []
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules' || name === 'dist') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) files.push(...walk(p))
    else files.push(p)
  }
  return files
}

async function publish(branch, dir, message) {
  const paths = walk(dir)
  const tree = []
  for (const file of paths) {
    const rel = relative(dir, file).replaceAll('\\', '/')
    const buf = readFileSync(file)
    const blob = await api(`/repos/${owner}/${repo}/git/blobs`, 'POST', {
      content: buf.toString('base64'),
      encoding: 'base64',
    })
    tree.push({ path: rel, mode: '100644', type: 'blob', sha: blob.sha })
  }
  const treeRes = await api(`/repos/${owner}/${repo}/git/trees`, 'POST', {
    tree,
  })
  let parents = []
  try {
    const ref = await api(`/repos/${owner}/${repo}/git/ref/heads/${branch}`, 'GET')
    parents = [ref.object.sha]
  } catch {
    parents = []
  }
  const commit = await api(`/repos/${owner}/${repo}/git/commits`, 'POST', {
    message,
    tree: treeRes.sha,
    parents,
  })
  if (parents.length) {
    await api(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, 'PATCH', {
      sha: commit.sha,
      force: true,
    })
  } else {
    await api(`/repos/${owner}/${repo}/git/refs`, 'POST', {
      ref: `refs/heads/${branch}`,
      sha: commit.sha,
    })
  }
  console.log(`published ${branch} ${commit.sha}`)
}

const target = process.argv[2] || 'main'
if (target === 'gh-pages') {
  await publish('gh-pages', join(root, 'dist'), 'Deploy GitHub Pages')
} else {
  await publish('main', root, 'Add Tan Zhoumo weekend city guide for Shenzhen.')
}
