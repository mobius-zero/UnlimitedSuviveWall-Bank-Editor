import { useMemo, useState } from 'react';
import { MAP_CONFIG } from './core/config';
import {
  createEditedBank,
  parseBankXml,
  readBankValues,
  verifyGeneratedBank,
} from './core';
import { requiredXp } from './core/experience';
import { parseStrictDecimalInteger } from './core/strict-integer';
import { BankEditorError } from './core/errors';
import { validateEditableProgressValues } from './core/validation';
import { BankSummary, EditableProgress, EditedBankResult } from './core/model';
import { downloadTextFile } from './core/xml-serializer';
import { BankDiagnostics } from './components/BankDiagnostics';
import { PrivacyNotice } from './components/PrivacyNotice';
import { FileDropZone } from './components/FileDropZone';
import { ProgressEditor } from './components/ProgressEditor';
import { RawFields } from './components/RawFields';
import { ChangeReview } from './components/ChangeReview';
import { DownloadPanel } from './components/DownloadPanel';
import { ErrorSummary } from './components/ErrorSummary';

type AppMode =
  | { type: 'idle' }
  | { type: 'editing'; fileName: string; originalXml: string; summary: BankSummary }
  | { type: 'review'; result: EditedBankResult }
  | { type: 'error'; message: string };

type FormInputs = {
  level: string;
  currentXp: string;
  playCount: string;
  clearCount: string;
};

type ConflictAction = 'reset' | 'max' | 'cancel' | null;

const EMPTY_FORM: FormInputs = {
  level: '',
  currentXp: '',
  playCount: '',
  clearCount: '',
};

const DEFAULT_ACCOUNT_PLACEHOLDER = '[본인 Battle.net 계정 번호]';
const DEFAULT_MAP_HANDLE_PLACEHOLDER = '[뱅크 데이터의 핸들]';
const DEFAULT_BANK_FILE = `${MAP_CONFIG.bankName}.SC2Bank`;

function resolveBankFolderHint(accountFolderId: string, mapHandleId: string | undefined): string {
  const accountDir = accountFolderId.trim() || DEFAULT_ACCOUNT_PLACEHOLDER;
  const mapDir = mapHandleId?.trim() || DEFAULT_MAP_HANDLE_PLACEHOLDER;
  return `%USERPROFILE%\\Documents\\StarCraft II\\Accounts\\${accountDir}\\${mapDir}\\Banks\\${MAP_CONFIG.authorId}`;
}

function resolveBankFileHint(accountFolderId: string, mapHandleId: string | undefined, fileName: string): string {
  const folder = resolveBankFolderHint(accountFolderId, mapHandleId);
  const file = fileName.trim() || DEFAULT_BANK_FILE;
  return `${folder}\\${file}`;
}

function normalizeOutputFileName(fileName: string): string {
  const trimmed = fileName.trim();
  if (trimmed.toLowerCase().endsWith('.edited.sc2bank')) {
    return `${trimmed.slice(0, -14)}.SC2Bank`;
  }
  if (trimmed.toLowerCase().endsWith('.sc2bank')) {
    return trimmed;
  }
  return `${trimmed}.SC2Bank`;
}

function parseForm(form: FormInputs): EditableProgress {
  return {
    level: parseStrictDecimalInteger(form.level, '레벨'),
    currentXp: parseStrictDecimalInteger(form.currentXp, '현재 경험치'),
    playCount: parseStrictDecimalInteger(form.playCount, '플레이 횟수'),
    clearCount: parseStrictDecimalInteger(form.clearCount, '클리어 횟수'),
  };
}

export default function App(): JSX.Element {
  const [mode, setMode] = useState<AppMode>({ type: 'idle' });
  const [form, setForm] = useState<FormInputs>(EMPTY_FORM);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [conflictAction, setConflictAction] = useState<ConflictAction>(null);
  const [accountFolderId, setAccountFolderId] = useState<string>('');

  const parsedForm = useMemo((): EditableProgress | null => {
    try {
      return parseForm(form);
    } catch {
      return null;
    }
  }, [form]);

  const conflictMessage = useMemo(() => {
    if (!parsedForm) return null;
    const needed = requiredXp(parsedForm.level);
    if (parsedForm.currentXp < needed) return null;
    return `레벨 ${parsedForm.level}에서 requiredXp는 ${needed}입니다.`;
  }, [parsedForm]);

  const visibleFileName = useMemo(() => {
    if (mode.type === 'editing') return mode.fileName;
    if (mode.type === 'review') return mode.result.filename;
    return '';
  }, [mode]);

  const visibleSummary = useMemo(() => {
    if (mode.type === 'editing') return mode.summary;
    if (mode.type === 'review') return mode.result.before;
    return undefined;
  }, [mode]);

  const diagnosticsModeLabel = useMemo(() => {
    if (mode.type === 'editing') return '편집 중';
    if (mode.type === 'review') return '수정본 생성 후';
    return '진단';
  }, [mode]);

  const bankFolderHint = resolveBankFolderHint(accountFolderId, visibleSummary?.userId);
  const bankFileHint = resolveBankFileHint(
    accountFolderId,
    visibleSummary?.userId,
    visibleFileName,
  );

  const onFileSelected = async (file: File): Promise<void> => {
    if (file.size > MAP_CONFIG.maxFileSizeBytes) {
      setMode({ type: 'error', message: '파일 크기가 1MiB를 초과합니다.' });
      return;
    }
    if (!file.name.toLowerCase().endsWith('.sc2bank')) {
      setMode({ type: 'error', message: '확장자가 .SC2Bank 인 파일만 처리됩니다.' });
      return;
    }
    if (file.size === 0) {
      setMode({ type: 'error', message: '빈 파일은 처리할 수 없습니다.' });
      return;
    }

    const originalXml = await file.text();
    try {
      const verification = await verifyGeneratedBank(originalXml);
      if (!verification.valid) {
        setMode({
          type: 'error',
          message: `편집 불가: ${verification.diagnostics.map((item) => item.message).join(' / ')}`,
        });
        return;
      }

      const parsed = parseBankXml(originalXml);
      const values = readBankValues(parsed);
      const summary = {
        ...verification.summary,
        level: values.Data1,
        currentXp: values.Data2,
        playCount: values.Data4,
        clearCount: values.Data5,
      };

      setMode({
        type: 'editing',
        fileName: file.name,
        originalXml,
        summary,
      });
      setForm({
        level: String(values.Data1),
        currentXp: String(values.Data2),
        playCount: String(values.Data4),
        clearCount: String(values.Data5),
      });
      setDiagnostics([]);
      setConflictAction(null);
    } catch (error) {
      console.error('[SC2Bank] 파일 로드 실패', error);
      if (error instanceof BankEditorError) {
        setMode({ type: 'error', message: error.message });
      } else {
        setMode({ type: 'error', message: '알 수 없는 파일 처리 오류입니다.' });
      }
    }
  };

  const onProgressChange = (next: FormInputs): void => {
    setForm(next);
    try {
      const parsed = parseForm(next);
      const result = validateEditableProgressValues(parsed);
      setDiagnostics(result.valid ? [] : result.diagnostics.map((item) => item.message));
    } catch {
      setDiagnostics(['입력이 엄격한 정수 형식을 충족하지 않습니다.']);
    }
  };

  const onSubmit = async (): Promise<void> => {
    if (mode.type !== 'editing') return;
    let parsed: EditableProgress;
    try {
      parsed = parseForm(form);
    } catch {
      setMode({ type: 'error', message: '입력이 엄격한 정수 형식을 충족하지 않습니다.' });
      return;
    }

    const result = validateEditableProgressValues(parsed);
    if (!result.valid) {
      setMode({ type: 'error', message: result.diagnostics.map((diag) => diag.message).join(' / ') });
      return;
    }

    const required = requiredXp(parsed.level);
    if (parsed.currentXp >= required) {
      if (conflictAction === 'cancel' || conflictAction === null) {
        setMode({
          type: 'error',
          message: `${parsed.currentXp}는 레벨 ${parsed.level}의 범위를 벗어납니다.`,
        });
        return;
      }
      parsed =
        conflictAction === 'reset'
          ? { ...parsed, currentXp: 0 }
          : { ...parsed, currentXp: required - 1 };
      setForm({
        ...form,
        currentXp: String(parsed.currentXp),
      });
      setConflictAction(null);
    }

    try {
      const result = await createEditedBank({
        originalXml: mode.originalXml,
        edits: parsed,
      });
      setMode({
        type: 'review',
        result: {
          ...result,
          filename: normalizeOutputFileName(mode.fileName),
        },
      });
      setDiagnostics([]);
      setConflictAction(null);
    } catch (error) {
      console.error('[SC2Bank] 생성본 생성 실패', error);
      if (error instanceof BankEditorError) {
        setMode({ type: 'error', message: error.message });
      } else {
        setMode({ type: 'error', message: '수정본 생성 실패' });
      }
    }
  };

  const onBackToEdit = async (): Promise<void> => {
    if (mode.type !== 'review') return;
    try {
      const verification = await verifyGeneratedBank(mode.result.xml);
      if (!verification.valid) {
        setMode({
          type: 'error',
          message: `재진입 검증 실패: ${verification.diagnostics.map((item) => item.message).join(' / ')}`,
        });
        return;
      }
      const parsed = parseBankXml(mode.result.xml);
      const values = readBankValues(parsed);

      setMode({
        type: 'editing',
        fileName: mode.result.filename,
        originalXml: mode.result.xml,
        summary: {
          ...verification.summary,
          level: values.Data1,
          currentXp: values.Data2,
          playCount: values.Data4,
          clearCount: values.Data5,
        },
      });
      setForm({
        level: String(values.Data1),
        currentXp: String(values.Data2),
        playCount: String(values.Data4),
        clearCount: String(values.Data5),
      });
      setDiagnostics([]);
    } catch (error) {
      console.error('[SC2Bank] 편집 재진입 실패', error);
      if (error instanceof BankEditorError) {
        setMode({ type: 'error', message: error.message });
      } else {
        setMode({ type: 'error', message: '편집 재진입 실패' });
      }
    }
  };

  const onDownload = (): void => {
    if (mode.type !== 'review') return;
    downloadTextFile({
      text: mode.result.xml,
      filename: mode.result.filename,
    });
  };

  return (
    <main className="app-shell">
      <header>
        <h1>극한 벽짓고 살아남기 Remaster Bank Editor</h1>
        <p>스타크래프트 II 종료 후 백업본 파일로만 사용하세요.</p>
      </header>

      <PrivacyNotice />

      {mode.type === 'idle' ? <FileDropZone onFileSelected={onFileSelected} /> : null}
      {(mode.type === 'idle' || mode.type === 'editing' || mode.type === 'review') && (
        <section className="card path-hint">
          <h2>권장 Banks 경로 힌트</h2>
          <p>계정 폴더가 다르면 {`{...}`}만 변경해서 파일을 저장하세요.</p>
          <p className="status-detail">
            <strong>권장 경로:</strong> {bankFolderHint}
          </p>
          <p className="status-detail">
            <strong>권장 저장 파일:</strong> {bankFileHint}
          </p>
          <div className="row">
            <label htmlFor="account-folder-id">내 계정 폴더(Battle.net 숫자)</label>
            <input
              id="account-folder-id"
              value={accountFolderId}
              onChange={(event) => setAccountFolderId(event.target.value)}
              placeholder="예: 87654321"
            />
          </div>
        </section>
      )}
      {(mode.type === 'editing' || mode.type === 'review') && visibleSummary ? (
        <BankDiagnostics
          fileName={visibleFileName}
          summary={visibleSummary}
          diagnostics={diagnostics}
          stateLabel={diagnosticsModeLabel}
          keepVisible
        />
      ) : null}

      {mode.type === 'editing' ? (
        <ProgressEditor
          progress={{
            level: form.level,
            currentXp: form.currentXp,
            playCount: form.playCount,
            clearCount: form.clearCount,
          }}
          onProgressChange={(next) => onProgressChange(next)}
          onSubmit={onSubmit}
          onReset={() => setMode({ type: 'idle' })}
          disabled={false}
          levelConflictMessage={conflictMessage}
          onConflictAction={setConflictAction}
          conflictAction={conflictAction}
        />
      ) : null}

      {mode.type === 'editing' ? <RawFields summary={mode.summary} /> : null}
      {diagnostics.length ? <ErrorSummary message={diagnostics.join(' / ')} /> : null}

      {mode.type === 'review' ? (
        <>
          <ChangeReview
            before={mode.result.before}
            after={mode.result.after}
            changes={mode.result.changes}
            onBack={onBackToEdit}
          />
          <DownloadPanel filename={mode.result.filename} onDownload={onDownload} />
        </>
      ) : null}

      {mode.type === 'error' ? <ErrorSummary message={mode.message} /> : null}

      {mode.type !== 'idle' ? (
        <button type="button" className="button secondary" onClick={() => setMode({ type: 'idle' })}>
          다른 파일 열기
        </button>
      ) : null}
    </main>
  );
}
