import { Document } from "./Document";

export const Preview = () => {
  const { key, error, onError, Preview } = Document.get();

  flex: 1;
  flexAlign: center;
  border: dashed, 2, $borderLight;
  background: $cmBackgroundDark;
  radius: 8;
  position: relative;
  overflow: hidden;
  color: $cmText;

  issue: {
    color: $red;
  }

  return (
    <div>
      {error ? (
        <issue>{error}</issue>
      ) : Preview ? (
        <Preview key={key} onError={onError} />
      ) : (
        <issue>Waiting for exports...</issue>
      )}
    </div>
  );
};
