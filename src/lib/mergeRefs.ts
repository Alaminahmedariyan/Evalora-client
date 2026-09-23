import type { Ref, RefCallback } from "react";

/**
 * Combines multiple refs (forwarded ref + a child element's own ref, etc.)
 * into a single ref callback so all of them get the same DOM node.
 * Used by components with an `asChild` pattern (Button, and any future
 * one) where the outer ref and the child's own ref both need to resolve.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.RefObject<T | null>).current = node;
      }
    }
  };
}