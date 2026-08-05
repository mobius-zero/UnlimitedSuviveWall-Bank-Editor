import { MAP_CONFIG } from '../core/config';
import { requiredXp } from '../core/experience';

type ProgressForm = {
  level: string;
  currentXp: string;
  playCount: string;
  clearCount: string;
};

type ProgressEditorProps = {
  progress: ProgressForm;
  onProgressChange: (next: ProgressForm) => void;
  onSubmit: () => void;
  onReset: () => void;
  disabled: boolean;
  levelConflictMessage?: string | null;
  onConflictAction: (action: 'reset' | 'max' | 'cancel' | null) => void;
  conflictAction?: 'reset' | 'max' | 'cancel' | null;
};

export function ProgressEditor({
  progress,
  onProgressChange,
  onSubmit,
  onReset,
  disabled,
  levelConflictMessage,
  onConflictAction,
  conflictAction,
}: ProgressEditorProps): JSX.Element {
  let required: number = MAP_CONFIG.maxLevel;
  if (/^-?\d+$/.test(progress.level)) {
    try {
      required = requiredXp(Number(progress.level));
    } catch {
      required = MAP_CONFIG.maxLevel;
    }
  }

  const submitDisabled = disabled || (!!levelConflictMessage && conflictAction == null);
  return (
    <section className="card">
      <h2>편집</h2>
      <div className="row">
        <label htmlFor="level">레벨 (1~75)</label>
        <input
          id="level"
          inputMode="numeric"
          value={String(progress.level)}
          onChange={(event) => onProgressChange({ ...progress, level: event.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="row">
        <label htmlFor="xp">
          현재 경험치 (0 ~ {required - 1})
        </label>
        <input
          id="xp"
          inputMode="numeric"
          value={String(progress.currentXp)}
          onChange={(event) => onProgressChange({ ...progress, currentXp: event.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="row">
        <label htmlFor="play">플레이 횟수</label>
        <input
          id="play"
          inputMode="numeric"
          value={String(progress.playCount)}
          onChange={(event) => onProgressChange({ ...progress, playCount: event.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="row">
        <label htmlFor="clear">클리어 횟수</label>
        <input
          id="clear"
          inputMode="numeric"
          value={String(progress.clearCount)}
          onChange={(event) => onProgressChange({ ...progress, clearCount: event.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="actions">
        <button type="button" className="button" onClick={onSubmit} disabled={submitDisabled}>
          수정본 생성
        </button>
        <button type="button" className="button" onClick={onReset}>
          파일 초기화
        </button>
      </div>
      {levelConflictMessage ? (
        <div className="warn">
          <p>{levelConflictMessage}</p>
          <label>
            <input
              type="radio"
              name="xp-conflict"
              checked={conflictAction === 'reset'}
              onChange={() => onConflictAction('reset')}
            />
            XP를 0으로 초기화
          </label>
          <label>
            <input
              type="radio"
              name="xp-conflict"
              checked={conflictAction === 'max'}
              onChange={() => onConflictAction('max')}
            />
            XP를 레벨 최대값-1로 제한
          </label>
          <label>
            <input
              type="radio"
              name="xp-conflict"
              checked={conflictAction === 'cancel'}
              onChange={() => onConflictAction('cancel')}
            />
            레벨 변경 취소
          </label>
        </div>
      ) : null}
    </section>
  );
}
