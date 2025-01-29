export enum AdminScreen{
    Analysis = "Analysis",
    Articles = "Articles",
    Splash = "Splash",
    BackLog = "BackLog",
    Users = "Users",
    Edit = "Edit"
}

export enum StudentScreen{
    Browse = "Browse",
    Home = "Home",
    Recently_Viewed = "Recently_Viewed"
}

export type Screen = AdminScreen | StudentScreen;

export function screenToString(screen: Screen): string {
    if (screen in AdminScreen) {
      return AdminScreen[screen as AdminScreen];
    }
    if (screen in StudentScreen) {
      return StudentScreen[screen as StudentScreen];
    }
    throw new Error("Invalid screen value");
  }