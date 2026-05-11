import { trustBar, toolHeader } from '../utils/helpers.js';

export class WorkflowBuilderTool {
  constructor() { this.steps = []; }

  render() {
    return `
    ${toolHeader('⚙️','Workflow Builder','Chain multiple PDF tools together into a processing pipeline.')}
    ${trustBar()}
    <div style="max-width:640px;">
      <div style="margin-bottom:1.5rem;">
        <label style="font-weight:600;color:#1A1530;display:block;margin-bottom:.75rem;">Add Steps to Your Workflow</label>
        <div style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;">
          <select id="wf-tool-select" style="flex:1;min-width:200px;">
            ${[['merge-pdf','🔗 Merge PDF'],['split-pdf','✂️ Split PDF'],['compress-pdf','📦 Compress PDF'],['rotate-pdf','🔄 Rotate PDF'],['watermark-pdf','💧 Watermark PDF'],['protect-pdf','🔐 Protect PDF'],['add-page-numbers','🔢 Add Page Numbers'],['pdf-to-jpg','🖼️ PDF to JPG'],['pdf-to-word','📝 PDF to Word'],['compress-image','🗜️ Compress Image'],['resize-image','📐 Resize Image'],['image-filters','🎞️ Image Filters']].map(([s,l])=>`<option value="${s}">${l}</option>`).join('')}
          </select>
          <button id="wf-add" class="btn-primary" style="height:48px;padding:0 1.5rem;">+ Add Step</button>
        </div>
      </div>
      <div id="wf-steps" style="margin-bottom:1.5rem;display:flex;flex-direction:column;gap:.75rem;"></div>
      <div id="wf-empty" style="text-align:center;padding:3rem;background:#F9FAFB;border:2px dashed #E5E7EB;border-radius:16px;color:#9CA3AF;">
        <div style="font-size:2rem;margin-bottom:.75rem;">⚙️</div>
        <p style="font-weight:600;">No steps yet</p>
        <p style="font-size:.875rem;margin-top:.25rem;">Add tools above to build your workflow</p>
      </div>
      <div id="wf-summary" style="display:none;background:#F3EEFF;border:1px solid #C4B5FD;border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;">
        <h3 style="font-weight:700;color:#1A1530;margin-bottom:.75rem;">Your Workflow</h3>
        <div id="wf-flow" style="display:flex;align-items:center;flex-wrap:wrap;gap:.5rem;"></div>
        <p style="font-size:.875rem;color:#6B7280;margin-top:.75rem;">Click each tool in your workflow to process files step by step.</p>
      </div>
      <button id="wf-run" class="btn-primary" style="display:none;width:100%;justify-content:center;">▶ Execute Workflow</button>
      <div id="wf-output" style="margin-top:1rem;"></div>
    </div>`;
  }

  setupEvents() {
    const toolLabels = {
      'merge-pdf':'🔗 Merge PDF','split-pdf':'✂️ Split PDF','compress-pdf':'📦 Compress PDF',
      'rotate-pdf':'🔄 Rotate PDF','watermark-pdf':'💧 Watermark PDF','protect-pdf':'🔐 Protect PDF',
      'add-page-numbers':'🔢 Page Numbers','pdf-to-jpg':'🖼️ PDF to JPG','pdf-to-word':'📝 PDF to Word',
      'compress-image':'🗜️ Compress Image','resize-image':'📐 Resize Image','image-filters':'🎞️ Filters'
    };

    document.getElementById('wf-add').onclick = () => {
      const slug = document.getElementById('wf-tool-select').value;
      this.steps.push({ slug, label: toolLabels[slug]||slug, id: Date.now() });
      this.render_steps(toolLabels);
    };
    document.getElementById('wf-run').onclick = () => this.execute(toolLabels);
  }

  render_steps(toolLabels) {
    const stepsEl = document.getElementById('wf-steps');
    const empty = document.getElementById('wf-empty');
    const summary = document.getElementById('wf-summary');
    const runBtn = document.getElementById('wf-run');
    if (!this.steps.length) { stepsEl.innerHTML=''; empty.style.display='block'; summary.style.display='none'; runBtn.style.display='none'; return; }
    empty.style.display='none'; summary.style.display='block'; runBtn.style.display='flex';
    stepsEl.innerHTML = this.steps.map((s, i) => `
      <div style="display:flex;align-items:center;gap:.75rem;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:.75rem 1rem;">
        <span style="background:#7B3FF2;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0;">${i+1}</span>
        <span style="flex:1;font-weight:600;font-size:.9rem;">${s.label}</span>
        ${i>0?`<button onclick="window._wfUp(${i})" style="background:none;border:none;cursor:pointer;min-width:32px;min-height:32px;font-size:1rem;">↑</button>`:''}
        ${i<this.steps.length-1?`<button onclick="window._wfDown(${i})" style="background:none;border:none;cursor:pointer;min-width:32px;min-height:32px;font-size:1rem;">↓</button>`:''}
        <button onclick="window._wfRemove(${i})" style="background:none;border:none;cursor:pointer;color:#EF4444;min-width:32px;min-height:32px;">✕</button>
      </div>`).join('');
    document.getElementById('wf-flow').innerHTML = this.steps.map((s,i) => `
      <span style="background:#7B3FF2;color:white;border-radius:20px;padding:.3rem .85rem;font-size:.8rem;font-weight:600;">${s.label}</span>
      ${i<this.steps.length-1?'<span style="color:#7B3FF2;font-weight:700;">→</span>':''}`).join('');
    window._wfUp = (i) => { if(i>0){[this.steps[i-1],this.steps[i]]=[this.steps[i],this.steps[i-1]];this.render_steps(toolLabels);} };
    window._wfDown = (i) => { if(i<this.steps.length-1){[this.steps[i],this.steps[i+1]]=[this.steps[i+1],this.steps[i]];this.render_steps(toolLabels);} };
    window._wfRemove = (i) => { this.steps.splice(i,1); this.render_steps(toolLabels); };
  }

  execute(toolLabels) {
    const out = document.getElementById('wf-output');
    out.innerHTML = `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:1.25rem;">
      <h3 style="font-weight:700;color:#166534;margin-bottom:.75rem;">✅ Workflow Ready!</h3>
      <p style="font-size:.875rem;color:#166534;margin-bottom:1rem;">Your ${this.steps.length}-step workflow is configured. Click each step below to process your files:</p>
      <div style="display:flex;flex-direction:column;gap:.5rem;">
        ${this.steps.map((s,i)=>`
          <a href="#${s.slug}" style="display:flex;align-items:center;gap:.75rem;background:white;border:1px solid #BBF7D0;border-radius:8px;padding:.75rem 1rem;text-decoration:none;color:#1A1530;font-weight:600;font-size:.9rem;">
            <span style="background:#059669;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;">${i+1}</span>
            ${s.label}
            <span style="margin-left:auto;color:#6B7280;font-size:.8rem;">→ Open tool</span>
          </a>`).join('')}
      </div>
    </div>`;
  }
}
