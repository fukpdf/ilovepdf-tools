export class OutputFilenameManager {
  static generate(originalName, newExt) {
    const lastDot = (originalName || 'file').lastIndexOf('.');
    const name = lastDot > 0 ? originalName.substring(0, lastDot) : (originalName || 'file');
    const ext = newExt || (lastDot > 0 ? originalName.substring(lastDot + 1) : 'pdf');
    const sanitized = name.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '-').substring(0, 150);
    const clean = sanitized.replace(/-ilovepdf\.cyou$/i, '');
    return clean + '-ilovepdf.cyou.' + ext;
  }

  static generateFilename(originalName, ext) {
    if (!originalName) originalName = 'file';
    let base = originalName.replace(/\.[^.]+$/, '');
    base = base.replace(/[^a-zA-Z0-9_-]/g, '_');
    base = base.replace(/_+/g, '_').replace(/^_|_$/g, '');
    if (base.endsWith('-ilovepdf')) return `${base}.${ext}`;
    return `${base}-ilovepdf.${ext}`;
  }

  static forTool(originalName, toolName, ext) {
    const base = (originalName || 'file').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    return `${base}_${toolName}-ilovepdf.${ext}`;
  }
}
