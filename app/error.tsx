"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="text-xl font-semibold tracking-tight">
        Etwas ist schiefgelaufen
      </h1>
      <p className="text-sm text-muted-foreground">
        Diese Seite konnte nicht dargestellt werden. Das liegt meist an
        unerwarteten Daten von einer externen Quelle, nicht an deinen
        Einstellungen.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Fehler-ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
