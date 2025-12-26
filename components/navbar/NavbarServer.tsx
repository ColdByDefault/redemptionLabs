import { auth } from "@/auth";
import { getNotifications } from "@/actions/notification";
import { getEnabledPluginsForNav } from "@/lib/plugin";
import { getUserById } from "@/lib/auth";
import { Navbar } from "./Navbar";

export async function NavbarServer(): Promise<React.ReactElement> {
  const session = await auth();
  const { notifications, unreadCount } = await getNotifications(50);

  // Fetch fresh plugin data from database (not from session cache)
  let enabledPlugins: ReturnType<typeof getEnabledPluginsForNav> = [];
  if (session?.user?.id) {
    const user = await getUserById(session.user.id);
    if (user) {
      enabledPlugins = getEnabledPluginsForNav(user.enabledPlugins);
    }
  }

  return (
    <Navbar
      notifications={notifications}
      unreadCount={unreadCount}
      user={session?.user ?? null}
      enabledPlugins={enabledPlugins}
    />
  );
}
