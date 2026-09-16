export function DataError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-8 text-center">
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        Kursdaten konnten nicht geladen werden
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
