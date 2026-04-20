export const mergeSignals = (signal1: AbortSignal, signal2: AbortSignal): AbortSignal => {
  const controller = new AbortController();
  const abort = () => controller.abort();

  if (signal1) signal1.addEventListener('abort', abort);
  if (signal2) signal2.addEventListener('abort', abort);

  return controller.signal;
}
