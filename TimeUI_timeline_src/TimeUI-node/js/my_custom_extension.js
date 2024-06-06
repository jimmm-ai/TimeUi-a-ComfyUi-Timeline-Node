import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";
import { DraggableList } from "../../scripts/ui/draggablelist.js";  // Import the DraggableList class
import { createImageHost } from "../../scripts/ui/imagePreview.js";  // Import the createImageHost function

// Include the CSS style block at the beginning of your JavaScript file
const style = document.createElement('style');
style.type = 'text/css';
style.textContent = `
  .img_row {
    border-bottom: #2A2A2A 1px solid;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .right_img_row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    justify-content: space-between;
  }
  
  .top_img_row {
    display: flex;
    gap: 12px;
    align-items: stretch;
    height: auto;
    padding: 8px 0 8px;
  }
  
  .grid-btn-icon {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(1, auto);
    gap: 8px;
  }
  
  .icon-btn {
    background-color: #444;
    border-radius: 8px;
    border: 1px solid #555;
    color: #A0A0A0;
    padding: 8px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
  }
  
  .icon-btn.add_timeframe.second {
    width: 32px;
    height: 32px;
  }
  
  .icon-btn.remove_curent_time_handler {
    width: 32px;
    height: 32px;
  }
  
  .timeline_container {
    background-color: #1a1a1a;
    border-radius: 8px;
    border: 1px solid #555;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    position: relative;
  }
  
  .timeline_handler {
    background-color: #2A2A2B;
    border-radius: 8px;
    border: 1px solid #555;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px;
    width: fit-content;
    height: 85%;
    position: absolute;
    overflow: hidden;
    gap: 4px;
  }
  
  .timeline_handler .right-handle {
    cursor: ew-resize;
    position: relative;
    height: 100%;
    width: 8px;
    border-right: 1px solid #959595;
    border-left: 1px solid #959595;
    right: 0;
  }
  
  .center-handler {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
    cursor: grab;
    width: 100%;
    flex-wrap: nowrap;
    align-items: center;
  }
  
  .upload_img {
    background-color: #444;
    border-radius: 4px;
    border: 1px solid #555;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 72px;
    height: 72px;
    position: relative;
    max-width: 72px;
    max-height: 72px;
  }
  
  .upload_img img {
    width: 100%;
    height: auto;
    border-radius: 4px;
  }
  
  .upload_img input {
    position: absolute;
    opacity: 0;
    width: 40px;
    height: 40px;
    cursor: pointer;
  }
  
  .text_hook_image_number {
    font-size: 12px;
    color: #eee;
    font-family: Arial, sans-serif;
  }
  
  .time_frame_text {
    font-size: 10px;
    color: #c6c6c6;
    font-family: Arial, sans-serif;
  }
  
  .text_timehandler_box {
    display: flex;
    flex-direction: column;
  }
  
  .timeline_handler_btns {
    display: flex;
    gap: 8px;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .rearange_img_row_handle {
    cursor: move;
    position: relative;
    height: 88px;
    width: 8px;
    border-right: 1px solid #959595;
    border-left: 1px solid #959595;
  }
  
  .no_selectionable {
    user-select: none;
  }

  .drag-handle {
    cursor: move;
  }
`;
document.head.appendChild(style);

app.registerExtension({
    name: "my.unique.node.extension",
    registerCustomNodes() {
        class TimeUInode extends LiteGraph.LGraphNode {
            constructor() {
                super("TimeUI - Timeline Node");
                this.color = LGraphCanvas.node_colors.black.groupcolor;
                this.bgcolor = LGraphCanvas.node_colors.black.groupcolor;
                this.groupcolor = LGraphCanvas.node_colors.black.groupcolor;

                this.addInput("Model", "string");
                this.addOutput("Model", "string");

                // Set default size
                this.size = [600, 800];
                this.resizable = true;

                // Set properties with defaults
                // this.properties = {
                //     preset: "LIGHT - SD1.5 only (low strength)",
                //     frame_animation: 96,
                //     width_animation: 512,
                //     height_animation: 512,
                //     interpolation: "Linear",
                //     time_format: "Frames",
                // };

                // Add widgets using ComfyWidgets
                ComfyWidgets.COMBO(this, "IP Adapter Settings", [["LIGHT - SD1.5 only (low strength)", "STANDARD (medium strength)", "VIT-G (medium strength)", "PLUS (high strength)", "PLUS FACE (portraits)", "FULL FACE - SD1.5 only (portraits stronger)"], { default: "LIGHT - SD1.5 only (low strength)" }]);
                ComfyWidgets.FLOAT(this, "Number of Animation Frames", ["FLOAT", { default: 96, min: 0, max: 10000, step: 1 }], app);
                ComfyWidgets.FLOAT(this, "Width of the Animation", ["FLOAT", { default: 512, min: 0, max: 10000, step: 1 }], app);
                ComfyWidgets.FLOAT(this, "Height of the Animation", ["FLOAT", { default: 512, min: 0, max: 10000, step: 1 }], app);
                ComfyWidgets.COMBO(this, "InterInterpolation", [["Linear", "Ease_in", "Ease_out", "Ease_in_out"], { default: "Linear" }]);

                // Keep it for ComfyWidgets exemples

                // ComfyWidgets["INT:seed"](this, "Seed", ["INT:seed", { default: 42 }], app);
                // ComfyWidgets.FLOAT(this, "Float Value", ["FLOAT", { default: 0.5, min: 0, max: 1, step: 0.1 }], app);
                // ComfyWidgets.INT(this, "Integer Value", ["INT", { default: 10, min: 0, max: 100, step: 1 }], app);
                // ComfyWidgets.BOOLEAN(this, "Toggle", ["BOOLEAN", { default: true, label_on: "Enabled", label_off: "Disabled" }], app);
                // ComfyWidgets.STRING(this, "String Value", ["STRING", { default: "Hello, World!", multiline: false }], app);
                // ComfyWidgets.COMBO(this, "IP Adapter Settings", [["LIGHT - SD1.5 only (low strength)", "STANDARD (medium strength)", "VIT-G (medium strength)", "PLUS (high strength)", "PLUS FACE (portraits)", "FULL FACE - SD1.5 only (portraits stronger)"], { default: "LIGHT - SD1.5 only (low strength)" }]);

                const htmlContent = `
                    <div id="row_nodes" class="flex_row img_row">
                        <div class="right_img_row">
                            <div class="top_img_row">
                                <div class="grid-btn-icon">
                                    <button class="icon-btn remove_img_row">-</button>
                                    <button class="icon-btn add_img_row">+</button>
                                </div>
                                <div class="timeline_container">
                                    <div class="timeline_handler">
                                        <div class="center-handler">
                                            <div class="upload_img">
                                                <img class="uploadedImage" src="#" alt="Upload an image">
                                                <input type="file" class="imgUploadInput" accept="image/*">
                                            </div>
                                            <div class="text_timehandler_box">
                                                <div class="text_hook_image_number no_selectionable">IMAGE 1</div>
                                                <div class="time_frame_text no_selectionable"></div>
                                            </div>
                                            <div class="timeline_handler_btns">
                                                <button class="icon-btn add_timeframe second">+</button>
                                                <button class="icon-btn remove_curent_time_handler">-</button>
                                            </div>
                                        </div>
                                        <div class="right-handle drag-handle"></div>
                                    </div>
                                </div>
                                <div class="rearange_img_row_handle drag-handle"></div>
                            </div>
                        </div>
                    </div>
                `;

                const htmlElement = document.createElement("div");
                htmlElement.innerHTML = htmlContent;
                document.body.appendChild(htmlElement);

                this.htmlElement = htmlElement;
                this.addDOMWidget("custom-html", "html", htmlElement, {
                    getValue: () => htmlContent,
                    setValue: (value) => {
                        htmlElement.innerHTML = value;
                    },
                });

                this.setupEventListeners();
                this.initializeDraggableList();
            }

            setupEventListeners() {
                this.htmlElement.addEventListener("click", (event) => {
                    if (event.target.classList.contains("add_img_row")) {
                        this.addImageRow();
                    } else if (event.target.classList.contains("remove_img_row")) {
                        this.removeImageRow(event.target);
                    } else if (event.target.classList.contains("imgUploadInput")) {
                        event.target.addEventListener("change", (e) => this.handleImageUpload(e));
                    }
                });
            }

            addImageRow() {
                const newRow = document.createElement("div");
                const currentIndex = this.htmlElement.querySelectorAll(".img_row").length + 1;
                newRow.id = `row_nodes${currentIndex}`;
                newRow.className = "flex_row img_row";
                newRow.innerHTML = `
                    <div class="right_img_row">
                        <div class="top_img_row">
                            <div class="grid-btn-icon">
                                <button class="icon-btn remove_img_row">-</button>
                                <button class="icon-btn add_img_row">+</button>
                            </div>
                            <div class="timeline_container">
                                <div class="timeline_handler">
                                    <div class="center-handler">
                                        <div class="upload_img">
                                            <img class="uploadedImage" src="#" alt="Upload an image">
                                            <input type="file" class="imgUploadInput" accept="image/*">
                                        </div>
                                        <div class="text_timehandler_box">
                                            <div class="text_hook_image_number no_selectionable">IMAGE ${currentIndex}</div>
                                            <div class="time_frame_text no_selectionable"></div>
                                        </div>
                                        <div class="timeline_handler_btns">
                                            <button class="icon-btn add_timeframe second">+</button>
                                            <button class="icon-btn remove_curent_time_handler">-</button>
                                        </div>
                                    </div>
                                    <div class="right-handle drag-handle"></div>
                                </div>
                            </div>
                            <div class="rearange_img_row_handle drag-handle"></div>
                        </div>
                    </div>
                `;
                this.htmlElement.appendChild(newRow);
                this.initializeDraggableList();  // Re-initialize DraggableList to include new row
            }

            removeImageRow(button) {
                const row = button.closest(".img_row");
                if (row) {
                    row.remove();
                    this.renumberImageRows();
                }
            }

            renumberImageRows() {
                const rows = this.htmlElement.querySelectorAll(".img_row");
                rows.forEach((row, index) => {
                    const textHook = row.querySelector(".text_hook_image_number");
                    if (textHook) {
                        textHook.textContent = `IMAGE ${index + 1}`;
                    }
                });
            }

            initializeDraggableList() {
                const draggableList = new DraggableList(this.htmlElement, ".img_row");
                draggableList.addEventListener("dragend", () => {
                    this.renumberImageRows();
                });
            }

            handleImageUpload(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.src = e.target.result;
                        img.className = "uploadedImage";

                        const uploadContainer = event.target.closest(".upload_img");
                        uploadContainer.querySelector(".uploadedImage").replaceWith(img);
                    };
                    reader.readAsDataURL(file);
                }
            }

            onAdded() {
                // Set default size
                this.size = [900, 600];
                this.resizable = true;
            }

            onExecute() {
                let inputData = this.getInputData(0);
                if (inputData !== undefined) {
                    this.setOutputData(0, `Processed: ${inputData}`);
                }
            }
        }

        LiteGraph.registerNodeType("utils/TimeUInode", TimeUInode);
        TimeUInode.category = "utils";
    },
});

