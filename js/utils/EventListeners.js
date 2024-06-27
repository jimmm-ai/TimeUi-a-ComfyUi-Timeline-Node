function initializeDragAndResize() {
    let isDragging = false;
    let dragStartX;
    let handlerStartX;
    let isResizingLeft = false;
    let isResizingRight = false;
    let resizeStartX;
    let handlerStartWidth;

    document.addEventListener("mousedown", (e) => {
      const handler = e.target.closest(".timeline-handler");
      if (e.target.classList.contains("drag-area")) {
        isDragging = true;
        dragStartX = e.clientX;
        handlerStartX = handler.offsetLeft;
        handler.classList.add("dragging");
      } else if (e.target.classList.contains("left-handle")) {
        isResizingLeft = true;
        resizeStartX = e.clientX;
        handlerStartWidth = handler.offsetWidth;
        handlerStartX = handler.offsetLeft;
        handler.classList.add("resizing-left");
      } else if (e.target.classList.contains("right-handle")) {
        isResizingRight = true;
        resizeStartX = e.clientX;
        handlerStartWidth = handler.offsetWidth;
        handlerStartX = handler.offsetLeft;
        handler.classList.add("resizing-right");
      }
    });

    document.addEventListener("mousemove", (e) => {
      const handler = document.querySelector(".timeline-handler.dragging, .timeline-handler.resizing-left, .timeline-handler.resizing-right");
      if (!handler) return;

      const timelineContainer = handler.closest(".timeline");
      const paddingSize = 2 * parseInt(getComputedStyle(timelineContainer).paddingLeft);

      if (isDragging) {
        handleDragging(e, handler, handlerStartX, dragStartX, timelineContainer, paddingSize);
      } else if (isResizingRight) {
        handleResizingRight(e, handler, resizeStartX, handlerStartWidth, timelineContainer, paddingSize);
      } else if (isResizingLeft) {
        handleResizingLeft(e, handler, resizeStartX, handlerStartWidth, handlerStartX, timelineContainer, paddingSize);
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      isResizingLeft = false;
      isResizingRight = false;
      document.querySelectorAll(".timeline-handler").forEach((handler) => {
        handler.classList.remove("dragging", "resizing-left", "resizing-right");
      });
    });
}

function handleDragging(e, handler, handlerStartX, dragStartX, timelineContainer, paddingSize) {
    const dx = e.clientX - dragStartX;
    const newLeft = handlerStartX + dx;
    const maxRight = timelineContainer.clientWidth - handler.clientWidth - paddingSize;
    if (newLeft >= 0 && newLeft <= maxRight) {
      handler.style.left = `${newLeft}px`;
    }
}

function handleResizingRight(e, handler, resizeStartX, handlerStartWidth, timelineContainer, paddingSize) {
    const dx = e.clientX - resizeStartX;
    const newWidth = handlerStartWidth + dx;
    const maxRight = timelineContainer.clientWidth - handler.offsetLeft - paddingSize;
    if (newWidth > 0 && newWidth <= maxRight) {
      handler.style.width = `${newWidth}px`;
    }
}

function handleResizingLeft(e, handler, resizeStartX, handlerStartWidth, handlerStartX, timelineContainer, paddingSize) {
    const dx = e.clientX - resizeStartX;
    const newWidth = handlerStartWidth - dx;
    const newLeft = handlerStartX + dx;
    const maxRight = timelineContainer.clientWidth - handlerStartX - paddingSize;
    if (newWidth > 0 && newLeft >= 0 && newLeft <= maxRight) {
      handler.style.width = `${newWidth}px`;
      handler.style.left = `${newLeft}px`;
    }
 }

 export { initializeDragAndResize };