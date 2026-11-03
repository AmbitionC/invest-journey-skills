#!/usr/bin/env node
// Invest Journey 命令行：登录授权 + 取数。零依赖，Node 18+。
//
//   node ij.mjs login            浏览器打开授权页，登录后点「授权」即完成（没有账号会自动注册）
//   node ij.mjs status           是否已登录、剩余点数
//   node ij.mjs tools            列出可用的数据工具
//   node ij.mjs call <工具> ['{"参数":"值"}']
//   node ij.mjs logout           删除本机保存的凭证
//
// 凭证保存在 ~/.config/invest-journey/credentials.json（仅本人可读）。
// 也可以用环境变量 INVEST_JOURNEY_API_KEY 直接指定一把 Key（手动建的 Key）。
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const PRODUCT = 'invest';
const NAME = 'Invest Journey';
const ENV_PREFIX = 'INVEST_JOURNEY';
const VERSION = '0.5.0';
const BASE = (process.env[`${ENV_PREFIX}_BASE`] ||
  'https://fe-journey-main-ktantdfjcs.cn-hangzhou.fcapp.run').replace(/\/+$/, '');
const MCP_URL = `${BASE}/mcp/${PRODUCT}`;
const DIR = join(homedir(), '.config', `${PRODUCT}-journey`);
const CRED = join(DIR, 'credentials.json');
const PENDING = join(DIR, 'pending-login.json');
const CLIENT_HEADER = `skill-cli/${PRODUCT}-journey@${VERSION}`;

const out = (s = '') => process.stdout.write(s + '\n');
const err = (s = '') => process.stderr.write(s + '\n');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function readJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}
function writeJson(p, v) {
  mkdirSync(DIR, { recursive: true, mode: 0o700 });
  writeFileSync(p, JSON.stringify(v, null, 2), { mode: 0o600 });
}

function apiKey() {
  return process.env[`${ENV_PREFIX}_API_KEY`] || readJson(CRED)?.key || '';
}

function clientName() {
  const e = process.env;
  if (e.CLAUDECODE || e.CLAUDE_CODE_ENTRYPOINT) return 'Claude Code';
  if (e.CURSOR_TRACE_ID || e.CURSOR_AGENT) return 'Cursor';
  if (e.CODEX_HOME || e.CODEX_SANDBOX || e.CODEX_MANAGED_BY_NPM) return 'Codex';
  return '命令行';
}

async function post(url, body, headers = {}) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Journey-Client': CLIENT_HEADER, ...headers },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {
    // Streamable HTTP 可能回 SSE：取最后一条 data
    const lines = text.split('\n').filter(l => l.startsWith('data:'));
    if (lines.length) try { json = JSON.parse(lines[lines.length - 1].slice(5)); } catch { /* ignore */ }
  }
  // 我们的接口只回 JSON / SSE；回来的是别的东西（405、Site Unavailable、拦截页），说明请求被所在环境的网络代理拦了
  if (!json && r.status >= 400) throw new BlockedError(r.status, text);
  return { status: r.status, json, text };
}

class BlockedError extends Error {
  constructor(status, text) {
    super(`HTTP ${status}${text ? '：' + text.replace(/\s+/g, ' ').slice(0, 80) : ''}`);
    this.blocked = true;
  }
}

function openBrowser(url) {
  try {
    const p = platform();
    const [cmd, args] = p === 'darwin' ? ['open', [url]]
      : p === 'win32' ? ['cmd', ['/c', 'start', '', url]]
      : ['xdg-open', [url]];
    const c = spawn(cmd, args, { stdio: 'ignore', detached: true });
    c.on('error', () => {});
    c.unref();
  } catch { /* 打不开就让用户自己点链接 */ }
}

let rpcId = 0;
async function rpc(method, params, key = apiKey()) {
  if (!key) {
    err(`还没登录 ${NAME}。运行：node ${scriptPath()} login`);
    process.exit(3);
  }
  const r = await post(MCP_URL, { jsonrpc: '2.0', id: ++rpcId, method, params },
    { Authorization: `Bearer ${key}`, Accept: 'application/json, text/event-stream' });
  if (r.status === 401 || r.status === 403) {
    const msg = r.json?.error?.message || r.json?.message || r.text.slice(0, 200);
    err(`凭证不可用（${msg}）。重新登录：node ${scriptPath()} login`);
    process.exit(3);
  }
  if (r.json?.error) {
    err(r.json.error.message || JSON.stringify(r.json.error));
    process.exit(1);
  }
  if (!r.json) {
    err(`服务返回异常（HTTP ${r.status}）：${r.text.slice(0, 200)}`);
    process.exit(1);
  }
  return r.json.result;
}

function scriptPath() {
  return process.argv[1] || 'ij.mjs';
}

function printToolResult(res) {
  const parts = (res?.content || []).map(c => (c.type === 'text' ? c.text : JSON.stringify(c)));
  out(parts.join('\n'));
  if (res?.isError) process.exit(1);
}

async function status(quiet = false) {
  const key = apiKey();
  if (!key) {
    if (!quiet) out(`未登录。运行：node ${scriptPath()} login`);
    return false;
  }
  const res = await rpc('tools/call', { name: 'account_usage', arguments: {} }, key);
  printToolResult(res);
  return true;
}

async function login(argv) {
  const noOpen = argv.includes('--no-open');
  const waitArg = argv.find(a => a.startsWith('--wait='));
  const waitSec = waitArg ? Math.max(5, Number(waitArg.slice(7)) || 100) : 100;

  if (apiKey() && !argv.includes('--force')) {
    const r = await post(MCP_URL, { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'account_usage', arguments: {} } },
      { Authorization: `Bearer ${apiKey()}`, Accept: 'application/json, text/event-stream' });
    if (r.status === 200 && r.json?.result && !r.json.result.isError) {
      out(`已经登录 ${NAME}，可以直接用。`);
      printToolResult(r.json.result);
      return;
    }
  }

  let pend = readJson(PENDING);
  if (!pend || pend.product !== PRODUCT || Date.now() > pend.expiresAt) {
    const r = await post(`${BASE}/mcp/oauth/${PRODUCT}/device`, { client_name: clientName() });
    if (r.status !== 200 || !r.json?.device_code) {
      err(`发起登录失败（HTTP ${r.status}）：${r.json?.error_description || r.text.slice(0, 200)}`);
      process.exit(1);
    }
    pend = {
      product: PRODUCT,
      deviceCode: r.json.device_code,
      userCode: r.json.user_code,
      url: r.json.verification_uri_complete,
      interval: r.json.interval || 3,
      expiresAt: Date.now() + (r.json.expires_in || 600) * 1000,
    };
    writeJson(PENDING, pend);
    if (!noOpen) openBrowser(pend.url);
  }

  out(`请在浏览器打开下面的地址，登录 ${NAME}（没有账号用手机号验证码登录会自动注册），然后点「授权」：`);
  out(`  ${pend.url}`);
  out(`确认码：${pend.userCode}（网页上显示的应与此一致）`);
  out('等待授权中…');

  const deadline = Math.min(pend.expiresAt, Date.now() + waitSec * 1000);
  let interval = pend.interval * 1000;
  while (Date.now() < deadline) {
    await sleep(interval);
    const r = await post(`${BASE}/mcp/oauth/token`, {
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      device_code: pend.deviceCode,
    });
    if (r.status === 200 && r.json?.access_token) {
      writeJson(CRED, { key: r.json.access_token, product: PRODUCT, createdAt: new Date().toISOString() });
      rmSync(PENDING, { force: true });
      out(`授权成功，已登录 ${NAME}。`);
      await status(true);
      return;
    }
    const e = r.json?.error;
    if (e === 'authorization_pending') continue;
    if (e === 'slow_down') { interval += 2000; continue; }
    rmSync(PENDING, { force: true });
    if (e === 'access_denied') { err('你在网页上取消了授权。需要时重新运行 login。'); process.exit(4); }
    if (e === 'expired_token') { err('授权链接已过期（10 分钟），请重新运行 login。'); process.exit(4); }
    err(`登录失败：${r.json?.error_description || e || r.text.slice(0, 200)}，请重新运行 login。`);
    process.exit(4);
  }
  if (Date.now() >= pend.expiresAt) {
    rmSync(PENDING, { force: true });
    err('授权链接已过期（10 分钟），请重新运行 login。');
    process.exit(4);
  }
  out('');
  out('还在等你在浏览器里点「授权」。点完后再运行一次同样的 login 命令即可（链接 10 分钟内有效，不会重新生成）。');
  process.exit(2);
}

async function main() {
  const [cmd = 'help', ...rest] = process.argv.slice(2);
  if (cmd === 'login') return login(rest);
  if (cmd === 'status' || cmd === 'whoami') return void (await status());
  if (cmd === 'logout') {
    rmSync(CRED, { force: true });
    rmSync(PENDING, { force: true });
    out(`已删除本机凭证。要彻底作废，到 ${NAME} 网站的「我的账户」吊销对应的 Key。`);
    return;
  }
  if (cmd === 'tools') {
    const res = await rpc('tools/list', {});
    for (const t of res?.tools || []) {
      const props = Object.keys(t.inputSchema?.properties || {});
      out(`- ${t.name}${props.length ? `（参数：${props.join(', ')}）` : ''}：${(t.description || '').split('\n')[0]}`);
    }
    return;
  }
  if (cmd === 'call') {
    const [name, raw] = rest;
    if (!name) { err('用法：call <工具名> [\'{"参数":"值"}\']'); process.exit(64); }
    let args = {};
    if (raw) {
      try { args = JSON.parse(raw); } catch { err('参数要是 JSON，例如 \'{"start":"20250101"}\''); process.exit(64); }
    }
    return printToolResult(await rpc('tools/call', { name, arguments: args }));
  }
  out(`${NAME} 命令行 ${VERSION}
  login     浏览器登录并授权（第一次使用先运行它）
  status    登录状态与剩余点数
  tools     列出数据工具
  call <工具> ['{json 参数}']   调用一个工具
  logout    删除本机凭证`);
  if (existsSync(CRED)) out('\n当前：已登录'); else out('\n当前：未登录');
}

main().catch(e => {
  err(`出错了：${e?.message || e}`);
  if (e?.blocked || /fetch failed|ENOTFOUND|ECONN|ETIMEDOUT/i.test(String(e?.message || e) + String(e?.cause?.code || ''))) {
    const host = new URL(BASE).host;
    err(`连不上 ${NAME} 的服务：当前环境的网络没有放行 ${host}（服务本身是正常的）。`);
    err(`请告诉用户：在所用客户端的网络设置里允许访问 ${host}（Claude App / 网页版：设置 → 功能 → 代码执行的网络访问，选「所有域名」或把它加进允许列表），改完新开对话再登录；或改用本机终端里的 Agent。`);
  }
  process.exit(1);
});
