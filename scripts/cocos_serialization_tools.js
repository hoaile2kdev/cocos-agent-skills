#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function usage() {
  console.error([
    'Usage:',
    '  cocos_serialization_tools.js class-map <projectRoot>',
    '  cocos_serialization_tools.js class-id <projectRoot> <ClassName|script path>',
    '  cocos_serialization_tools.js uuid [--compressed] [--min]',
    '  cocos_serialization_tools.js compress-uuid <uuid> [--min]',
    '  cocos_serialization_tools.js validate <prefabOrFire>',
  ].join('\n'));
  process.exit(2);
}

function walk(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      walk(file, predicate, out);
    }
    else if (!predicate || predicate(file)) {
      out.push(file);
    }
  }
  return out;
}

function uuidV4() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function compressUuid(uuid, min = false) {
  const hex = uuid.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) {
    throw new Error(`Invalid UUID: ${uuid}`);
  }

  const reserved = min ? 5 : 2;
  let out = hex.slice(0, reserved);
  for (let i = reserved; i < hex.length; i += 3) {
    const chunk = hex.slice(i, i + 3);
    const value = parseInt(chunk, 16);
    out += BASE64_KEYS[value >> 6];
    out += BASE64_KEYS[value & 0x3f];
  }
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function collectTsMetas(projectRoot) {
  const assetsDir = path.join(projectRoot, 'assets');
  const metas = new Map();
  for (const metaPath of walk(assetsDir, (file) => file.endsWith('.ts.meta'))) {
    try {
      const meta = readJson(metaPath);
      if (meta.uuid) {
        metas.set(meta.uuid, {
          uuid: meta.uuid,
          tsPath: metaPath.slice(0, -'.meta'.length),
        });
      }
    }
    catch (error) {
      // Ignore malformed metadata; validation should catch it separately.
    }
  }
  return metas;
}

function collectCompiledClassIds(projectRoot) {
  const roots = [
    path.join(projectRoot, 'library', 'imports'),
    path.join(projectRoot, 'temp', 'quick-scripts', 'src'),
    path.join(projectRoot, 'temp', 'quick-scripts', 'dst'),
  ];
  const entries = [];
  const pushPattern = /cc\._RF\.push\(module,\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/;

  for (const root of roots) {
    for (const jsPath of walk(root, (file) => file.endsWith('.js'))) {
      const text = fs.readFileSync(jsPath, 'utf8');
      const match = text.match(pushPattern);
      if (!match) {
        continue;
      }
      const base = path.basename(jsPath, '.js');
      const uuid = /^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(base) ? base : undefined;
      entries.push({
        classId: match[1],
        className: match[2],
        uuid,
        jsPath,
      });
    }
  }
  return entries;
}

function classMap(projectRoot) {
  const metas = collectTsMetas(projectRoot);
  const byKey = new Map();
  for (const entry of collectCompiledClassIds(projectRoot)) {
    const meta = entry.uuid ? metas.get(entry.uuid) : undefined;
    const merged = {
      className: entry.className,
      classId: entry.classId,
      uuid: entry.uuid || (meta && meta.uuid),
      tsPath: meta && meta.tsPath,
      jsPath: entry.jsPath,
    };
    const key = `${merged.className}|${merged.classId}`;
    if (!byKey.has(key) || (merged.tsPath && !byKey.get(key).tsPath)) {
      byKey.set(key, merged);
    }
  }
  return Array.from(byKey.values()).sort((a, b) => {
    return a.className.localeCompare(b.className) || a.classId.localeCompare(b.classId);
  });
}

function findClass(projectRoot, query) {
  const normalized = query.replace(/\\/g, '/');
  return classMap(projectRoot).filter((entry) => {
    return entry.className === query ||
      entry.classId === query ||
      (entry.tsPath && entry.tsPath.replace(/\\/g, '/').endsWith(normalized)) ||
      (entry.tsPath && path.basename(entry.tsPath, '.ts') === query);
  });
}

function validateSerializedFile(file) {
  const data = readJson(file);
  const errors = [];
  if (!Array.isArray(data)) {
    errors.push('Root JSON value must be an array.');
  }
  else {
    const ids = [];
    const seenObjectIds = new Set();
    function visit(value, pointer) {
      if (!value || typeof value !== 'object') {
        return;
      }
      if (Object.prototype.hasOwnProperty.call(value, '__id__')) {
        ids.push({ id: value.__id__, pointer });
      }
      if (Object.prototype.hasOwnProperty.call(value, '_id') && value._id) {
        if (seenObjectIds.has(value._id)) {
          errors.push(`Duplicate non-empty _id: ${value._id}`);
        }
        seenObjectIds.add(value._id);
      }
      if (Array.isArray(value)) {
        value.forEach((item, index) => visit(item, `${pointer}/${index}`));
      }
      else {
        for (const key of Object.keys(value)) {
          visit(value[key], `${pointer}/${key}`);
        }
      }
    }
    visit(data, '');
    for (const ref of ids) {
      if (!Number.isInteger(ref.id) || ref.id < 0 || ref.id >= data.length) {
        errors.push(`Invalid __id__ ${ref.id} at ${ref.pointer}`);
      }
    }
    data.forEach((obj, index) => {
      if (!obj || typeof obj !== 'object') {
        errors.push(`Array element ${index} is not an object.`);
        return;
      }
      if (!obj.__type__) {
        errors.push(`Array element ${index} is missing __type__.`);
      }
      if (obj.__type__ && obj.__type__ !== 'cc.Node' && obj.__type__ !== 'cc.Scene' && obj.__type__ !== 'cc.Prefab' && !obj.node && obj._enabled !== undefined) {
        errors.push(`Component-like element ${index} is missing node reference.`);
      }
    });
  }
  return errors;
}

const args = process.argv.slice(2);
const command = args.shift();

try {
  if (command === 'class-map') {
    const projectRoot = path.resolve(args[0] || usage());
    process.stdout.write(`${JSON.stringify(classMap(projectRoot), null, 2)}\n`);
  }
  else if (command === 'class-id') {
    const projectRoot = path.resolve(args[0] || usage());
    const query = args[1] || usage();
    const matches = findClass(projectRoot, query);
    if (matches.length === 0) {
      console.error(`No class id found for ${query}`);
      process.exit(1);
    }
    process.stdout.write(`${JSON.stringify(matches, null, 2)}\n`);
  }
  else if (command === 'uuid') {
    const uuid = uuidV4();
    const min = args.includes('--min');
    if (args.includes('--compressed')) {
      process.stdout.write(`${compressUuid(uuid, min)}\n`);
    }
    else {
      process.stdout.write(`${uuid}\n`);
    }
  }
  else if (command === 'compress-uuid') {
    const uuid = args[0] || usage();
    process.stdout.write(`${compressUuid(uuid, args.includes('--min'))}\n`);
  }
  else if (command === 'validate') {
    const file = path.resolve(args[0] || usage());
    const errors = validateSerializedFile(file);
    if (errors.length) {
      for (const error of errors) {
        console.error(error);
      }
      process.exit(1);
    }
    process.stdout.write(`OK ${file}\n`);
  }
  else {
    usage();
  }
}
catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
