export function preparePrivatePwa(): void {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return;
  }
  void navigator.storage.persisted().then((alreadyPersistent) => {
    if (!alreadyPersistent) {
      return navigator.storage.persist();
    }
    return alreadyPersistent;
  });
}
