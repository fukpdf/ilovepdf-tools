export class OutputFilenameManager {
  static generateFilename(originalName, ext) {
    if (!originalName) originalName = 'file';
    // Strip existing extension
    let base = originalName.replace(/\.[^.]+$/, '');
    // Sanitize: replace non-alphanumeric (except hyphen/underscore) with underscore
    base = base.replace(/[^a-zA-Z0-9_-]/g, '_');
    // Collapse multiple underscores
    base = base.replace(/_+/g, '_').replace(/^_|_$/g, '');
    // Prevent duplicate suffix
    if (base.endsWith('-ilovepdf')) {
      return `${base}.${ext}`;
    }
    return `${base}-ilovepdf.${ext}`;
  }

  static forTool(originalName, toolName, ext) {
    const base = (originalName||'file').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    return `${base}_${toolName}-ilovepdf.${ext}`;
  }
}
