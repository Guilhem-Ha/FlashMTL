/**
 * Singleton callbacks for "tap active tab → scroll to top" behaviour.
 * Each tab screen registers its scroll callback on mount and clears on unmount.
 */
export const tabScrollCallbacks: ((() => void) | null)[] = [null, null, null]
