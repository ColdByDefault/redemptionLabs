import { toast, type ExternalToast } from "sonner";

// ============================================================
// TYPES
// ============================================================

type ToastType = "success" | "error" | "info" | "warning" | "message";

interface QueuedToast {
  type: ToastType;
  message: string;
  options: ExternalToast | undefined;
}

// ============================================================
// QUEUE STATE
// ============================================================

const queue: QueuedToast[] = [];
let isProcessing = false;
const DEFAULT_DURATION = 3000; // 3 seconds default

// ============================================================
// QUEUE PROCESSING
// ============================================================

function processQueue(): void {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const item = queue.shift();

  if (!item) {
    isProcessing = false;
    return;
  }

  const duration = item.options?.duration ?? DEFAULT_DURATION;

  // Show the toast
  switch (item.type) {
    case "success":
      toast.success(item.message, item.options);
      break;
    case "error":
      toast.error(item.message, item.options);
      break;
    case "info":
      toast.info(item.message, item.options);
      break;
    case "warning":
      toast.warning(item.message, item.options);
      break;
    case "message":
    default:
      toast.message(item.message, item.options);
      break;
  }

  // Wait for toast duration + small buffer, then process next
  setTimeout(() => {
    isProcessing = false;
    processQueue();
  }, duration + 300); // 300ms buffer for animation
}

// ============================================================
// QUEUE API
// ============================================================

function enqueue(
  type: ToastType,
  message: string,
  options?: ExternalToast
): void {
  queue.push({ type, message, options });
  processQueue();
}

export const queuedToast = {
  success: (message: string, options?: ExternalToast): void => {
    enqueue("success", message, options);
  },
  error: (message: string, options?: ExternalToast): void => {
    enqueue("error", message, options);
  },
  info: (message: string, options?: ExternalToast): void => {
    enqueue("info", message, options);
  },
  warning: (message: string, options?: ExternalToast): void => {
    enqueue("warning", message, options);
  },
  message: (message: string, options?: ExternalToast): void => {
    enqueue("message", message, options);
  },
};
