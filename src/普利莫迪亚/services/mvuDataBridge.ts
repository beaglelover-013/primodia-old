type PlainRecord = Record<string, any>;

declare const getVariables: ((option?: PlainRecord) => PlainRecord) | undefined;
declare const replaceVariables: ((variables: PlainRecord, option?: PlainRecord) => void) | undefined;
declare const updateVariablesWith:
  | ((updater: (variables: PlainRecord) => PlainRecord | void, option?: PlainRecord) => Promise<void> | void)
  | undefined;
declare const waitGlobalInitialized: undefined | (<T = unknown>(globalName: string) => Promise<T>);
declare const getChatMessages:
  | undefined
  | ((range: number | string, option?: PlainRecord) => Array<{ message_id: number; data?: PlainRecord }>);
declare const Mvu:
  | {
      getMvuData?: (option: PlainRecord) => PlainRecord;
      replaceMvuData?: (data: PlainRecord, option: PlainRecord) => Promise<void> | void;
    }
  | undefined;

let mvuInitialized = false;
let mvuInitPromise: Promise<void> | null = null;

const PRIMORDIA_ROOT_KEYS = [
  '\u4e16\u754c',
  '\u4e3b\u89d2',
  '\u9152\u9986',
  '\u4eba\u7269\u7f81\u7eca',
  '\u5e93\u623f',
  '\u884c\u56ca',
  '\u4e34\u65f6\u72b6\u6001',
  '\u8857\u574a\u5546\u94fa',
  '\u519c\u7530\u4e0e\u9152\u7a96',
];

function clonePlainData<T>(value: T): T {
  if (value === undefined || value === null) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function looksLikePrimordiaStatData(value: unknown): value is PlainRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as PlainRecord;
  return PRIMORDIA_ROOT_KEYS.some(key => record[key] !== undefined);
}

function hasPrimordiaStatDataContent(value: unknown): value is PlainRecord {
  return looksLikePrimordiaStatData(value) && Object.keys(value as PlainRecord).length > 0;
}

function countDataLeaves(value: unknown): number {
  if (value === undefined || value === null) return 0;
  if (typeof value !== 'object') return 1;
  if (Array.isArray(value)) return value.reduce((total, item) => total + countDataLeaves(item), 0);
  return Object.values(value as PlainRecord).reduce((total, item) => total + countDataLeaves(item), 0);
}

export function primordiaStatDataWeight(value: unknown): number {
  const statData = unwrapPrimordiaStatData(value);
  if (!statData) return 0;
  return countDataLeaves(statData);
}

export function isSubstantialPrimordiaStatData(value: unknown): value is PlainRecord {
  const statData = unwrapPrimordiaStatData(value);
  if (!statData) return false;
  const hasCoreRoots = Boolean(statData['\u4e16\u754c'] && statData['\u9152\u9986']);
  const hasLongTermRoots = Boolean(
    statData['\u5e93\u623f'] ||
      statData['\u884c\u56ca'] ||
      statData['\u4eba\u7269\u7f81\u7eca'] ||
      statData['\u519c\u7530\u4e0e\u9152\u7a96'],
  );
  return hasCoreRoots && hasLongTermRoots && countDataLeaves(statData) >= 30;
}

function canonicalizePrimordiaStatData(statData: PlainRecord): PlainRecord {
  const next = clonePlainData(statData);
  if (
    next['\u4eba\u7269\u7f81\u7eca'] &&
    typeof next['\u4eba\u7269\u7f81\u7eca'] === 'object' &&
    !Array.isArray(next['\u4eba\u7269\u7f81\u7eca'])
  ) {
    delete next['\u4eba\u7269'];
  }
  return next;
}

async function ensureMvuInitialized(): Promise<void> {
  if (mvuInitialized) return;
  if (mvuInitPromise) return mvuInitPromise;
  mvuInitPromise = (async () => {
    try {
      if (typeof waitGlobalInitialized === 'function') await waitGlobalInitialized('Mvu');
    } catch (error) {
      console.warn('[primordia] 等待 MVU 初始化失败:', error);
    } finally {
      mvuInitialized = true;
    }
  })();
  return mvuInitPromise;
}

export function unwrapPrimordiaStatData(value: unknown): PlainRecord | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as PlainRecord;
  if (hasPrimordiaStatDataContent(record.stat_data)) return clonePlainData(record.stat_data);
  if (hasPrimordiaStatDataContent(record.data?.stat_data)) return clonePlainData(record.data.stat_data);
  if (hasPrimordiaStatDataContent(record)) return clonePlainData(record);
  return null;
}

function unwrapMvuEnvelope(value: unknown): PlainRecord | null {
  if (!value || typeof value !== 'object') return null;
  const record = clonePlainData(value as PlainRecord);
  if (record.stat_data && typeof record.stat_data === 'object') return record;
  if (record.data?.stat_data && typeof record.data.stat_data === 'object') {
    return { ...record, stat_data: clonePlainData(record.data.stat_data) };
  }
  if (looksLikePrimordiaStatData(record)) {
    return { stat_data: record };
  }
  return record;
}

export function normalizeMessageVariableOption(messageId?: number): PlainRecord {
  return { type: 'message', message_id: typeof messageId === 'number' ? messageId : -1 };
}

export function wrapPrimordiaMvuData(statData: PlainRecord, baseEnvelope: PlainRecord = {}): PlainRecord {
  const envelope = clonePlainData(baseEnvelope);
  delete envelope.display_data;
  delete envelope.delta_data;
  if (
    envelope.initialized_lorebooks &&
    typeof envelope.initialized_lorebooks === 'object' &&
    !Array.isArray(envelope.initialized_lorebooks) &&
    Object.keys(envelope.initialized_lorebooks).length === 0
  ) {
    delete envelope.initialized_lorebooks;
  }
  return {
    ...envelope,
    stat_data: clonePlainData(statData),
  };
}

function wrapReadableMvuData(value: unknown): PlainRecord | null {
  const statData = unwrapPrimordiaStatData(value);
  if (!statData) return null;
  return wrapPrimordiaMvuData(statData, unwrapMvuEnvelope(value) ?? {});
}

/** 按示例项目的顺序读取：最新 assistant → latest → 0 层。 */
export async function getPrimordiaMvuData(): Promise<PlainRecord> {
  await ensureMvuInitialized();
  let firstReadable: PlainRecord | null = null;
  const rememberReadable = (value: PlainRecord | null) => {
    if (!value) return null;
    if (!firstReadable) firstReadable = value;
    return isSubstantialPrimordiaStatData(value) ? value : null;
  };

  try {
    if (typeof getChatMessages === 'function') {
      const assistantMessages = getChatMessages(-1, { role: 'assistant' });
      const newestFirst = [...(assistantMessages ?? [])].reverse();
      for (const assistantMessage of newestFirst) {
        const messageId = assistantMessage?.message_id;
        if (typeof messageId === 'number' && typeof Mvu !== 'undefined' && typeof Mvu.getMvuData === 'function') {
          const mvuData = rememberReadable(wrapReadableMvuData(Mvu.getMvuData({ type: 'message', message_id: messageId })));
          if (mvuData) return mvuData;
        }
        const messageData = rememberReadable(wrapReadableMvuData(assistantMessage?.data));
        if (messageData) return messageData;
      }
    }
  } catch (error) {
    console.warn('[primordia] 读取最新 assistant MVU 数据失败:', error);
  }

  const fallbackOptions = [
    { type: 'message', message_id: 'latest' },
    { type: 'message', message_id: 0 },
  ];

  for (const option of fallbackOptions) {
    try {
      if (typeof Mvu !== 'undefined' && typeof Mvu.getMvuData === 'function') {
        const mvuData = rememberReadable(wrapReadableMvuData(Mvu.getMvuData(option)));
        if (mvuData) return mvuData;
      }
    } catch {
      /* 继续回退 */
    }

    try {
      if (typeof getVariables === 'function') {
        const variables = rememberReadable(wrapReadableMvuData(getVariables(option)));
        if (variables) return variables;
      }
    } catch {
      /* 继续回退 */
    }
  }

  if (firstReadable) return firstReadable;
  return wrapPrimordiaMvuData({});
}

export function readPrimordiaStatDataFromOptions(options: PlainRecord[]): PlainRecord | null {
  if (typeof Mvu !== 'undefined' && typeof Mvu.getMvuData === 'function') {
    for (const option of options) {
      const statData = unwrapPrimordiaStatData(Mvu.getMvuData(option));
      if (statData) return statData;
    }
  }

  if (typeof getVariables === 'function') {
    for (const option of options) {
      const statData = unwrapPrimordiaStatData(getVariables(option));
      if (statData) return statData;
    }
  }

  return null;
}

export function readPrimordiaStatData(option: PlainRecord): PlainRecord | null {
  return readPrimordiaStatDataFromOptions([option]);
}

function sameJsonValue(left: unknown, right: unknown) {
  try {
    return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
  } catch {
    return left === right;
  }
}

function readExistingMvuEnvelope(option: PlainRecord): PlainRecord {
  if (typeof Mvu !== 'undefined' && typeof Mvu.getMvuData === 'function') {
    try {
      const mvuEnvelope = unwrapMvuEnvelope(Mvu.getMvuData(option));
      if (mvuEnvelope) return mvuEnvelope;
    } catch (error) {
      console.warn('[primordia] 读取现有 MVU 信封失败:', error);
    }
  }

  if (typeof getVariables === 'function') {
    try {
      const variablesEnvelope = unwrapMvuEnvelope(getVariables(option));
      if (variablesEnvelope) return variablesEnvelope;
    } catch (error) {
      console.warn('[primordia] 读取现有变量信封失败:', error);
    }
  }

  return {};
}

export async function writePrimordiaStatData(statData: PlainRecord, option: PlainRecord): Promise<boolean> {
  await ensureMvuInitialized();
  const nextStatData = canonicalizePrimordiaStatData(statData);
  if (!isSubstantialPrimordiaStatData(nextStatData)) {
    console.warn('[primordia] 拒绝写入疑似残缺的 stat_data，避免覆盖完整变量:', {
      option,
      keys: Object.keys(nextStatData),
      weight: primordiaStatDataWeight(nextStatData),
    });
    return false;
  }
  let wrote = false;
  let lastError: unknown;

  if (typeof updateVariablesWith === 'function') {
    try {
      await updateVariablesWith(variables => {
        const nextVariables = variables && typeof variables === 'object' ? { ...variables } : {};
        nextVariables.stat_data = clonePlainData(nextStatData);
        return nextVariables;
      }, option);
      wrote = true;
    } catch (error) {
      lastError = error;
      console.warn('[primordia] updateVariablesWith 写入失败，继续尝试 MVU/replaceVariables:', error);
    }
  }

  if (typeof Mvu !== 'undefined' && typeof Mvu.replaceMvuData === 'function') {
    try {
      const nextEnvelope = wrapPrimordiaMvuData(nextStatData, readExistingMvuEnvelope(option));
      await Mvu.replaceMvuData(nextEnvelope, option);
      wrote = true;
    } catch (error) {
      lastError = error;
      console.warn('[primordia] Mvu.replaceMvuData 写入失败，继续尝试 replaceVariables:', error);
    }
  }

  if (!wrote && typeof getVariables === 'function' && typeof replaceVariables === 'function') {
    try {
      const currentVariables = getVariables(option);
      const nextVariables = currentVariables && typeof currentVariables === 'object' ? { ...currentVariables } : {};
      nextVariables.stat_data = clonePlainData(nextStatData);
      replaceVariables(nextVariables, option);
      wrote = true;
    } catch (error) {
      lastError = error;
      console.warn('[primordia] replaceVariables 兜底写入失败:', error);
    }
  }

  if (!wrote && lastError) throw lastError;
  if (!wrote) return false;

  const readable = readPrimordiaStatData(option);
  if (sameJsonValue(readable, nextStatData)) return true;

  console.warn('[primordia] 变量接口未报错，但写后读回未匹配:', {
    option,
    expectedKeys: Object.keys(nextStatData),
    readableKeys: readable ? Object.keys(readable) : [],
  });
  return false;
}
