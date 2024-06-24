import { SVG_ADD_ROW, SVG_REMOVE_ROW, SVG_ADD_TIMEFRAME, SVG_REMOVE_TIMEFRAME, SVG_UPLOAD_IMAGE } from "../utils/SVGConstants.js";

function addImageRow(nodeMgr) {
    const newRow = document.createElement("section");
    const currentIndex = nodeMgr.htmlElement.querySelectorAll(".timeline-row").length + 1;
    newRow.className = "timeline-row";
    newRow.id = `timeline-row-${currentIndex}`;
    newRow.innerHTML = generateRowHTML(currentIndex);
    nodeMgr.htmlElement.appendChild(newRow);
    updateNodeHeight(nodeMgr.node);
    initializeSortable(nodeMgr.node); // Re-initialize Sortable to include new row
    initializeDragAndResize(); // Re-initialize custom drag and resize for new elements
    updateFrameInfo(nodeMgr.node, newRow.querySelector(".timeline-handler"));
}

function renumberImageRows(node) {
    const rows = node.htmlElement.querySelectorAll(".timeline-row");
    rows.forEach((row, index) => {
      row.id = `timeline-row-${index + 1}`;
      const textHook = row.querySelector(".image-number");
      if (textHook) {
        textHook.textContent = `IMAGE ${index + 1}`;
      }
    });
}

function removeImageRow(node, button) {
    const row = button.closest(".timeline-row");
    if (row) {
      row.remove();
      renumberImageRows(node);
    }
}

function generateRowHTML(currentIndex) {
    return `
      <div class="timeline-controls">
        <button class="btn remove-row">${SVG_REMOVE_ROW}</button>
        <button class="btn add-row">${SVG_ADD_ROW}</button>
      </div>
      <div class="timeline">
        <div class="timeline-handler" style="left: 0;">
          <div class="resize-handle left-handle"></div>
          <div class="drag-area">
            <div class="image-upload">
              ${SVG_UPLOAD_IMAGE}
              <input type="file" class="image-input" accept="image/*">
            </div>
            <div class="handler-info">
              <div class="image-number">IMAGE ${currentIndex}</div>
              <div class="frame-info"></div>
            </div>
            <div class="handler-buttons">
              <button class="btn btn-sm add-timeframe">${SVG_ADD_TIMEFRAME}</button>
              <button class="btn btn-sm remove-timeframe">${SVG_REMOVE_TIMEFRAME}</button>
            </div>
          </div>
          <div class="resize-handle right-handle"></div>
        </div>
      </div>
      <div class="rearrange-handle"></div>
    `;
}

export { addImageRow, renumberImageRows, removeImageRow, generateRowHTML };