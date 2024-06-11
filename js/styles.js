const style = document.createElement('style');
style.type = 'text/css';
style.textContent = `
/* General Styles */
:root {
  --color-background: #1a1a1a;
  --color-border: #666666;
  --color-icon: #444;1
  --color-text: #eee;
  --spacing-gap: 12px;
  --spacing-padding: 8px;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-row {
  border-bottom: var(--color-border) 1px solid;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: var(--spacing-padding);
}

.timeline-controls {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--spacing-gap);
}

.btn {
  background-color: var(--color-icon);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: var(--spacing-padding);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
}

.btn-sm {
  width: 32px;
  height: 32px;
}

.timeline {
  background-color: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  padding: 2px;
}

.timeline-handler {
  background-color: #2A2A2B;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  height: calc(100% - 12px);
  position: absolute;
  overflow: hidden;
  gap: 4px;
}

.resize-handle {
  cursor: ew-resize;
  position: relative;
  height: 100%;
  width: 8px;
  border-right: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
}

.drag-area {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  cursor: grab;
  width: 100%;
  flex-wrap: nowrap;
  align-items: center;
}

.image-upload {
  background-color: var(--color-icon);
  border-radius: 4px;
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 72px;
  height: 72px;
  position: relative;
  max-width: 72px;
  max-height: 72px;
}

.uploaded-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.image-input {
  position: absolute;
  opacity: 0;
  width: 72px;
  height: 72px;
  cursor: pointer;
}

.handler-info {
  display: flex;
  flex-direction: column;
}

.image-number {
  font-size: 12px;
  color: var(--color-text);
  font-family: Arial, sans-serif;
}

.frame-info {
  font-size: 10px;
  color: #c6c6c6;
  font-family: Arial, sans-serif;
}

.handler-buttons {
  display: flex;
  gap: 8px;
  flex-direction: column;
  justify-content: space-between;
}

.rearrange-handle {
  cursor: move;
  position: relative;
  height: 88px;
  width: 8px;
  border-right: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
}

.no_selectionable {
  user-select: none;
}
`;

export {style};