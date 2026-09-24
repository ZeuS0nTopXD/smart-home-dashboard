export function toggleModuleField(current, moduleId, field) {
  return {
    ...current,
    modules: {
      ...current.modules,
      [moduleId]: {
        ...current.modules[moduleId],
        [field]: !current.modules[moduleId][field]
      }
    }
  };
}
