import { ChangeEvent, DragEvent, useRef } from 'react';

type FileDropZoneProps = {
  disabled?: boolean;
  onFileSelected: (file: File) => void;
};

export function FileDropZone({ disabled, onFileSelected }: FileDropZoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    onFileSelected(file);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    onFileSelected(file);
  };

  return (
    <section className="drop-zone">
      <button type="button" className="button" disabled={disabled} onClick={() => inputRef.current?.click()}>
        파일 선택
      </button>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            inputRef.current?.click();
          }
        }}
        className="drop-body"
        onDrop={onDrop}
        onDragOver={onDragOver}
        aria-label=".SC2Bank 파일 드롭 영역"
      >
        .SC2Bank 파일을 드래그 앤 드롭
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".SC2Bank,application/xml,text/xml"
        onChange={onChange}
        hidden
      />
    </section>
  );
}
