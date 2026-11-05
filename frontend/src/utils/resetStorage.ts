export function resetUserSettingsStorage() {
  ["menuFilter", "menuSort", "favoriteDishIds"].forEach((key) => localStorage.removeItem(key));
}
