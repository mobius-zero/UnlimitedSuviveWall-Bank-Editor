type DownloadPanelProps = {
  filename: string;
  onDownload: () => void;
};

export function DownloadPanel({ filename, onDownload }: DownloadPanelProps): JSX.Element {
  return (
    <section className="card">
      <h2>완료</h2>
      <p>생성본 검증 완료. XML 다운로드를 진행할 수 있습니다.</p>
      <button type="button" className="button" onClick={onDownload}>
        {filename} 다운로드
      </button>
    </section>
  );
}
