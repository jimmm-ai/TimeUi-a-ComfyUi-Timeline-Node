const style = document.createElement('style');
style.type = 'text/css';
style.textContent = `
/* General Styles */
:root {
  --color-background: #1a1a1a;
  --color-border: #666666;
  --color-icon: #444;
  --color-text: #eee;
  --spacing-gap: 12px;
  --spacing-padding: 8px;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  user-select: none; /* Disable text selection for the entire timeline container */
  -webkit-user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
}

.timeline-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
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
    flex-direction: row; /* Change to column to align input and text vertically */
    justify-content: center; /* Center the content vertically */
    align-items: center; /* Center the content horizontally */
    padding: 4px;
    height: calc(100% - 12px);
    position: absolute;
    overflow: hidden;
    gap: 4px;
    cursor: grab;
    left: 0;
    width: 30%; /* Initial width */
}

.timeline-handler.dragging, .timeline-handler.resizing-left, .timeline-handler.resizing-right {
    cursor: grabbing;
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
    gap: 8px;
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

.time-ruler-container {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 10px; // not sure
    justify-content: space-between;
}

.time-ruler {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  border-bottom: 1px solid var(--color-border);
}

.time-ruler .time-marker {
  position: absolute;
  bottom: 0;
  width: 1px;
  background-color: var(--color-border);
  text-align: center;
  font-size: 10px;
}

.time-ruler .time-marker span {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  font-size: 8px;
  padding: 0 2px;
  font-family: Arial, sans-serif;
}

.time-ruler .big-tick {
  height: 60%;
  background-color: var (--color-text);
}

.time-ruler .medium-tick {
  height: 40%;
  background-color: var (--color-text);
}

.time-ruler .small-tick {
  height: 20%;
  background-color: var (--color-text);
}

.same-space-handle {
  position: relative;
  width: 8px;
}

.frame-info-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
}

.frame-info-container-input {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
}

.frame-info-input {
    font-size: 10px;
    color: #c6c6c6;
    font-family: Arial, sans-serif;
    background: transparent;
    border: 1px solid #c6c6c6;
    width: 35%;
    text-align: center;
    border-radius: 2px;
}

span {
    font-size: 10px;
    color: var(--color-text);
    font-family: Arial, sans-serif;
}
`;

export { style };