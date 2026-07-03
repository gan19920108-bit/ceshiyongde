import { Lorebook, LorebookEntry } from './types';
import { db } from './database';

export class LorebookEngine {
  /**
   * Scans the query text and history text to find matching Lorebook entries,
   * returning them ordered by priority.
   */
  static async scanAndMatch(
    textToScan: string,
    activeLorebookIds: string[]
  ): Promise<LorebookEntry[]> {
    if (!activeLorebookIds || activeLorebookIds.length === 0) {
      return [];
    }

    const matchedEntries: Map<string, LorebookEntry> = new Map();

    // Fetch all active lorebooks from database
    const allLorebooks = await db.lorebooks.toArray();
    const activeBooks = allLorebooks.filter(
      (book) => book.isGlobalEnabled && activeLorebookIds.includes(book.id)
    );

    const lowercaseScanText = textToScan.toLowerCase();

    for (const book of activeBooks) {
      for (const entry of book.entries) {
        if (!entry.isEnabled) continue;

        // If constant, it is always matched
        if (entry.isConstant) {
          matchedEntries.set(entry.id, entry);
          continue;
        }

        // Match based on keys
        let hasMatch = false;
        for (const key of entry.keys) {
          if (!key || key.trim() === '') continue;
          if (lowercaseScanText.includes(key.toLowerCase())) {
            hasMatch = true;
            break;
          }
        }

        if (hasMatch) {
          matchedEntries.set(entry.id, entry);
        }
      }
    }

    // Convert map to array and sort by priority (descending) then order (ascending)
    return Array.from(matchedEntries.values()).sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.order - b.order;
    });
  }

  /**
   * Format matched entries to be injected into the system prompt.
   */
  static formatMatchedLore(entries: LorebookEntry[]): string {
    if (entries.length === 0) return '';

    return `\n=== WORLD LOREBOOK KNOWLEDGE INJECTED (matched keywords: ${entries.map(e => e.keys[0]).join(', ')}) ===\n` +
      entries
        .map((entry) => {
          const keysStr = entry.keys.join(', ');
          return `[Setting/Lore Topic: ${entry.id} (Keywords: ${keysStr})]\n${entry.content}`;
        })
        .join('\n\n') +
      '\n=== END OF LOREBOOK INJECTION ===\n';
  }
}
