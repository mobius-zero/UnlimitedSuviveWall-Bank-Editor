import { BankSummary } from '../core/model';

type BankDiagnosticsProps = {
  fileName: string;
  diagnostics?: readonly string[];
  summary?: BankSummary;
  stateLabel?: string;
  keepVisible?: boolean;
};

export function BankDiagnostics({
  fileName,
  diagnostics,
  summary,
  stateLabel,
  keepVisible = false,
}: BankDiagnosticsProps): JSX.Element {
  const psState = summary?.psValid ? '정상' : '오류';
  const signatureState = summary?.signatureValid ? '정상' : '오류';

  return (
    <section className={`card diagnostics ${keepVisible ? 'diagnostics--sticky' : ''}`}>
      <div className="diagnostics__header">
        <h2>파일 진단</h2>
        {stateLabel ? <span className="diagnostics__state">{stateLabel}</span> : null}
      </div>
      <dl className="kv-grid">
        <div className="kv-row">
          <dt>파일</dt>
          <dd>{fileName}</dd>
        </div>
        {summary ? (
          <>
            <div className="kv-row">
              <dt>계정</dt>
              <dd className="important-field">{summary.userId}</dd>
            </div>
            <div className="kv-row">
              <dt>코덱</dt>
              <dd>{summary.codecVersion}</dd>
            </div>
            <div className="kv-row">
              <dt>PS</dt>
              <dd>
                <span className={`status-pill ${summary.psValid ? 'status-pill--ok' : 'status-pill--error'}`}>
                  {psState}
                </span>
                <span className="status-detail">({summary.ps})</span>
              </dd>
            </div>
            <div className="kv-row">
              <dt>Signature</dt>
              <dd>
                <span
                  className={`status-pill ${summary.signatureValid ? 'status-pill--ok' : 'status-pill--error'}`}
                >
                  {signatureState}
                </span>
                <span className="status-detail">{summary.signature}</span>
              </dd>
            </div>
          </>
        ) : null}
      </dl>
      {diagnostics && diagnostics.length ? (
        <ul className="diagnostics__list" aria-live="polite">
          {diagnostics.map((diag, index) => (
            <li key={`${diag}-${index}`}>{diag}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
