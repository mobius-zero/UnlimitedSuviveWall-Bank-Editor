import { BankSummary } from '../core/model';

type RawFieldsProps = {
  summary: BankSummary;
};

export function RawFields({ summary }: RawFieldsProps): JSX.Element {
  return (
    <section className="card">
      <h2>읽기 전용 필드</h2>
      <ul>
        <li>Data3, Data7, Data8, Data9 (핸들 조각): 보존</li>
        <li>Data6: {summary.codecVersion}</li>
        <li>Data10: 0</li>
        <li>Data11: 0</li>
        <li>Data12: 0</li>
      </ul>
    </section>
  );
}
