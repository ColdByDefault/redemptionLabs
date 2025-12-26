import { getNotifications } from "@/actions/notification";
import { Navbar } from "./Navbar";

export async function NavbarServer(): Promise<React.ReactElement> {
  const { notifications, unreadCount } = await getNotifications(50);

  return <Navbar notifications={notifications} unreadCount={unreadCount} />;
}
