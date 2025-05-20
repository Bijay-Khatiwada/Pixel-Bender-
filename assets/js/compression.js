async function preProcessImage(file) {
  let preProcessedImage = null;
  let newFileType = null;

  const isHeic = file.type === "image/heic" || file.type === "image/heif" || isHeicExt(file);
  const isAvif = file.type === "image/avif";

  if (isHeic) {
    console.log("Pre-processing HEIC image...");
    preProcessedImage = await HeicTo({ blob: file, type: "image/jpeg", quality: 0.9 });
    console.log("preProcessedImage:", preProcessedImage);
    newFileType = "image/jpeg";
  }

  if (isAvif) {
    console.log("Pre-processing AVIF image...");
    setTimeout(() => {
      ui.progress.text.innerHTML = `Please wait. AVIF files may take longer to prepare<span class="loading-dots">`;
    }, 5000);

    preProcessedImage = await imageCompression(file, {
      quality: 0.8,
      fileType: "image/jpeg",
      useWebWorker: true,
      preserveExif: false,
      libURL: "./browser-image-compression.js",
      alwaysKeepResolution: true,
    });
    newFileType = "image/jpeg";
  }

  return { preProcessedImage, preProcessedNewFileType: newFileType };
}

async function createCompressionOptions(onProgress, file) {
  const compressMethod = getCheckedValue(ui.inputs.compressMethod);
  const dimensionMethod = getCheckedValue(ui.inputs.dimensionMethod);
  const { selectedFormat } = getFileType(file);
  const inputSizeMB = (file.size / 1024 / 1024).toFixed(3);

  quality = Math.min(Math.max(parseFloat(ui.inputs.quality.value) / 100, 0), 1);
  console.log("Input image file size:", inputSizeMB, "MB");

  const maxWeightMB = ui.inputs.limitWeightUnit.value.toUpperCase() === "KB"
    ? ui.inputs.limitWeight.value / 1024
    : ui.inputs.limitWeight.value;

  const isHeic = file.type === "image/heic" || file.type === "image/heif" || isHeicExt(file);
  let limitDimensionsValue;

  if (isHeic) {
    limitDimensionsValue = (dimensionMethod === "limit" && ui.inputs.limitDimensions.value > 50)
      ? ui.inputs.limitDimensions.value
      : undefined;
  } else {
    limitDimensionsValue = (dimensionMethod === "limit")
      ? await getAdjustedDimensions(file, ui.inputs.limitDimensions.value)
      : undefined;
  }

  const options = {
    maxSizeMB: compressMethod === "limitWeight" ? maxWeightMB : inputSizeMB,
    initialQuality: compressMethod === "quality" ? quality : undefined,
    maxWidthOrHeight: limitDimensionsValue,
    useWebWorker: true,
    onProgress,
    preserveExif: false,
    fileType: selectedFormat || undefined,
    libURL: "./browser-image-compression.js",
    alwaysKeepResolution: true,
  };

  if (state.controller) {
    options.signal = state.controller.signal;
  }

  console.log("Settings:", options);
  return options;
}

async function compressImageQueue() {
  if (!state.compressQueue.length) {
    resetCompressionState(true);
    return;
  }

  const file = state.compressQueue[0];
  const index = state.compressProcessedCount;

  if (!isFileTypeSupported(file.type, file)) {
    console.error(`Unsupported file type: ${file.type}. Skipping "${file.name}".`);
    ui.progress.text.innerHTML = `Unsupported file "<div class='progress-file-name'>${file.name}</div>"`;
    state.compressQueue.shift();
    await compressImageQueue();
    return;
  }

  const options = await createCompressionOptions((p) => onProgress(p, index, file.name), file);
  const { preProcessedImage, preProcessedNewFileType } = await preProcessImage(file);

  if (preProcessedImage) {
    options.fileType = preProcessedNewFileType;
  }

  try {
    const output = await imageCompression(preProcessedImage || file, options);
    handleCompressionResult(file, output);
  } catch (error) {
    console.error(error.message);
  } finally {
    state.compressProcessedCount++;
    state.compressQueue.shift();
    resetCompressionState(state.compressProcessedCount === state.compressQueueTotal);
    if (state.compressProcessedCount < state.compressQueueTotal) {
      compressImageQueue();
    }
  }
}

function onProgress(progress, index, fileName) {
  const shortName = fileName.length > 15 ? fileName.slice(0, 12) + "..." : fileName;
  state.fileProgressMap[index] = progress;

  const overallProgress = calculateOverallProgress(state.fileProgressMap, state.compressQueueTotal);
  ui.progress.queueCount.textContent = `${state.compressProcessedCount + 1} / ${state.compressQueueTotal}`;
  ui.progress.text.dataset.progress = overallProgress;
  ui.progress.text.innerHTML = `Optimizing "<div class='progress-file-name'>${fileName}</div>"`;
  ui.progress.bar.style.width = `${overallProgress}%`;

  console.log(`Optimizing "${shortName}" (${overallProgress}%)`);

  if (progress === 100 && state.compressProcessedCount === state.compressQueueTotal - 1) {
    ui.progress.text.innerHTML = `
      <div class="badge badge--success pt-2xs pb-2xs bg:surface">
        <div class="badge-text flex items-center gap-3xs">
          <svg height="16" stroke-linejoin="round" viewBox="0 0 16 16" width="16" style="color: currentcolor;">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM11.5303 6.53033L12.0607 6L11 4.93934L10.4697 5.46967L6.5 9.43934L5.53033 8.46967L5 7.93934L3.93934 9L4.46967 9.53033L5.96967 11.0303C6.26256 11.3232 6.73744 11.3232 7.03033 11.0303L11.5303 6.53033Z" fill="currentColor"></path>
          </svg>
          <span>Done!</span>
        </div>
      </div>
    `;
  }
}

function compressImage(event) {
  state.controller = new AbortController();
  state.compressQueue = Array.from(event.target.files);
  state.compressQueueTotal = state.compressQueue.length;
  state.compressProcessedCount = 0;
  state.fileProgressMap = {};
  state.isCompressing = true;

  document.body.classList.add("compressing--is-active");
  ui.actions.dropZone.classList.add("hidden");
  ui.actions.abort.classList.remove("hidden");
  ui.progress.container.classList.remove("hidden");
  ui.progress.text.innerHTML = `Preparing<span class="loading-dots">`;

  compressImageQueue();
}

function calculateOverallProgress(progressMap, totalFiles) {
  const total = Object.values(progressMap).reduce((sum, val) => sum + val, 0);
  return Math.round(total / totalFiles);
}

function resetCompressionState(isAllProcessed, aborted) {
  const resetState = () => {
    state.compressProcessedCount = 0;
    state.compressQueueTotal = 0;
    ui.progress.queueCount.textContent = "";
    state.compressQueue = [];
    state.isCompressing = false;
  };

  if (aborted) {
    resetUI();
    resetState();
    return;
  }

  if (isAllProcessed) {
    ui.actions.abort.classList.add("hidden");
    ui.progress.bar.style.width = "100%";
    setTimeout(() => {
      resetUI();
      state.isCompressing = false;
    }, 1000);
    return;
  }

  if (state.isCompressing && state.compressProcessedCount === 0) {
    ui.progress.text.dataset.progress = 0;
    ui.progress.text.textContent = "Preparing 0%";
    ui.progress.bar.style.width = "0%";
  }
}
