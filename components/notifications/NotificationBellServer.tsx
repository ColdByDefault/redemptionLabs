import { getNotifications } from "@/actions/notification";
import { NotificationBell } from "./NotificationBell";

export async function NotificationBellServer(): Promise<React.ReactElement> {
  const { notifications, unreadCount } = await getNotifications(50);

  return (
    <NotificationBell notifications={notifications} unreadCount={unreadCount} />
  );
}
