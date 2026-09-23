/**
 * The bits of dialog behaviour that are easy to get subtly wrong, kept in one
 * place so the lightbox and the mobile menu cannot drift apart.
 */

export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab inside `container`. Returns true when the key was handled, so the
 * caller can decide whether to also act on it.
 */
export function trapTabKey(container: HTMLElement | null, e: KeyboardEvent): boolean {
  if (e.key !== 'Tab') return false;

  const nodes = container?.querySelectorAll<HTMLElement>(FOCUSABLE);
  if (!container || !nodes || nodes.length === 0) {
    e.preventDefault();
    return true;
  }

  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const active = document.activeElement;

  if (!container.contains(active)) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }

  return true;
}
