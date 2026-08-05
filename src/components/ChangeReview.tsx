import { BankSummary, FieldChange } from '../core/model';

type ChangeReviewProps = {
  before: BankSummary;
  after: BankSummary;
  changes: readonly FieldChange[];
  onBack: () => void;
};

export function ChangeReview({ before, after, changes, onBack }: ChangeReviewProps): JSX.Element {
  return (
    <section className="card">
      <h2>변경 검토</h2>
      <table>
        <thead>
          <tr>
            <th>항목</th>
            <th>변경 전</th>
            <th>변경 후</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((change) => (
            <tr key={String(change.field)}>
              <td>{String(change.field)}</td>
              <td>{String(change.before)}</td>
              <td>{String(change.after)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row">
        <strong>PS</strong> {before.ps} → {after.ps}
      </div>
      <div className="row">
        <strong>Signature</strong> {before.signature} → {after.signature}
      </div>
      <div className="actions">
        <button type="button" className="button" onClick={onBack}>
          편집으로 돌아가기
        </button>
      </div>
    </section>
  );
}
