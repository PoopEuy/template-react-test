export const filterNavByPermissions = (nav, userPermissions) => {
  const names = userPermissions.map((p) => p.name)

  return nav
    .map((item) => {
      if (item.items) {
        const filteredItems = filterNavByPermissions(item.items, userPermissions)
        return filteredItems.length > 0 ? { ...item, items: filteredItems } : null
      }
      if (item.permissions && !item.permissions.some((perm) => names.includes(perm))) {
        return null
      }
      return item
    })
    .filter(Boolean)
}
