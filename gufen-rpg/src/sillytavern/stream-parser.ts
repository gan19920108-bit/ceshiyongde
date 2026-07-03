export class StreamParser {
  /**
   * Parses standard or partial XML text to extract tag contents on-the-fly.
   * If a tag is opened but not closed, it extracts from the opening tag to the end of the text.
   */
  static parse(rawText: string): {
    thinking: string;
    maintext: string;
    options: string[];
    sum: string;
    vars: Record<string, any>;
  } {
    const result = {
      thinking: '',
      maintext: '',
      options: [] as string[],
      sum: '',
      vars: {} as Record<string, any>,
    };

    // Helper to extract tag contents (handles unclosed tags gracefully)
    const extractTag = (tag: string, text: string): string => {
      const openTag = `<${tag}>`;
      const closeTag = `</${tag}>`;
      const openIdx = text.indexOf(openTag);
      
      if (openIdx === -1) return '';

      const startIdx = openIdx + openTag.length;
      const closeIdx = text.indexOf(closeTag, startIdx);

      if (closeIdx === -1) {
        // Tag is opened but not closed yet, capture everything to the end
        return text.substring(startIdx).trim();
      }

      return text.substring(startIdx, closeIdx).trim();
    };

    // Extract thinking
    result.thinking = extractTag('thinking', rawText);

    // Extract maintext
    result.maintext = extractTag('maintext', rawText);

    // Extract sum
    result.sum = extractTag('sum', rawText);

    // Extract options
    const rawOptions = extractTag('option', rawText);
    if (rawOptions) {
      // Split by newline and clean up
      result.options = rawOptions
        .split('\n')
        .map((opt) => opt.trim().replace(/^[-*•\d.\s]+/, '')) // strip markdown lists/numbers
        .filter((opt) => opt !== '');
    }

    // Extract vars
    const rawVars = extractTag('vars', rawText);
    if (rawVars) {
      try {
        // Find the first '{' and last '}' to isolate JSON
        const startJson = rawVars.indexOf('{');
        const endJson = rawVars.lastIndexOf('}');
        if (startJson !== -1 && endJson !== -1 && endJson >= startJson) {
          const jsonStr = rawVars.substring(startJson, endJson + 1);
          result.vars = JSON.parse(jsonStr);
        } else if (rawVars.startsWith('{')) {
          // If the JSON is incomplete, we can attempt to parse it (or wait till it's finished)
          // Simple lenient parse or just try-catch
          result.vars = JSON.parse(rawVars);
        }
      } catch (e) {
        // Quietly fail or wait for more chunks to make it valid JSON
      }
    }

    // Fallback: If no tags are found, treat the entire text as maintext
    if (
      !rawText.includes('<thinking>') &&
      !rawText.includes('<maintext>') &&
      !rawText.includes('<option>') &&
      !rawText.includes('<sum>') &&
      !rawText.includes('<vars>')
    ) {
      result.maintext = rawText.trim();
    }

    return result;
  }
}
