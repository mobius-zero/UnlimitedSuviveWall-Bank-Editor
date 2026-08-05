type ErrorSummaryProps = {
  message: string;
};

export function ErrorSummary({ message }: ErrorSummaryProps): JSX.Element {
  return (
    <section className="card error">
      <h2>오류</h2>
      <p aria-live="assertive">{message}</p>
    </section>
  );
}
