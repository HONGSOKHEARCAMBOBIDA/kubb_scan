<template>
  <div class="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
    <!-- ========================================== -->
    <!-- HEADER                                     -->
    <!-- ========================================== -->
    <header
      class="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs"
    >
      <!-- Photos Counter Badge -->
      <div class="flex justify-end items-center gap-2">
        <el-tag
          v-if="photos.length > 0"
          type="primary"
          effect="dark"
          size="large"
        >
          {{ photos.length }} {{ photos.length === 1 ? "Photo" : "Photos" }}
        </el-tag>

        <el-button
          v-if="photos.length > 0"
          type="danger"
          plain
          size="default"
          @click="clearAllPhotos"
        >
          <el-icon class="mr-1"><Delete /></el-icon>
          Clear
        </el-button>
      </div>
    </header>

    <!-- ========================================== -->
    <!-- MAIN WORKSPACE                             -->
    <!-- ========================================== -->
    <main
      class="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-28 flex flex-col gap-6"
    >
      <!-- SECTION 1: LIVE CAMERA VIEWFINDER -->
      <section
        class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-5"
      >
        <div
          class="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner"
        >
          <video
            ref="videoElement"
            autoplay
            playsinline
            muted
            class="w-full  h-[95%] object-contain"
            :class="{ hidden: !isCameraActive }"
          ></video>

          <canvas ref="canvasElement" class="hidden"></canvas>

<div
  ref="cropOverlay"
  v-if="isCameraActive"
  class="absolute inset-4 pointer-events-none border-2 border-red-400/40 rounded-xl flex items-center justify-center"
>
  <div class="absolute top-0 left-16 w-6 h-6 border-t-4 border-l-4 border-red-400 rounded-tl"></div>
  <div class="absolute top-0 right-16 w-6 h-6 border-t-4 border-r-4 border-red-400 rounded-tr"></div>
  <div class="absolute bottom-0 left-16 w-6 h-6 border-b-4 border-l-4 border-red-400 rounded-bl"></div>
  <div class="absolute bottom-0 right-16 w-6 h-6 border-b-4 border-r-4 border-red-400 rounded-br"></div>
</div>

          <div
            v-if="!isCameraActive && !cameraErrorMessage"
            class="text-center p-6 flex flex-col items-center"
          >
            <div
              class="w-16 h-16 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-3xl mb-3"
            >
              <el-icon><Camera /></el-icon>
            </div>
            <h3 class="text-white font-semibold text-base mb-1">
              Camera ត្រូវបានបិទ
            </h3>
            <p class="text-slate-400 text-xs max-w-sm mb-4">
              សូមចុចប៊ូតុងខាងក្រោម ដើម្បីអនុញ្ញាតឱ្យប្រើប្រាស់កាមេរ៉ា
              និងចាប់ផ្តើមថតទំព័រឯកសារ
            </p>
            <el-button
              type="success"
              size="large"
              @click="startCamera"
              class="w-full"
            >
              <el-icon class="mr-1.5"><Camera /></el-icon>
              ចាប់ផ្ដើម
            </el-button>
          </div>

          <div
            v-if="cameraErrorMessage"
            class="text-center p-6 flex flex-col items-center max-w-md"
          >
            <div
              class="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-2xl mb-2"
            >
              <el-icon><Warning /></el-icon>
            </div>
            <h3 class="text-white font-semibold text-sm mb-1">
              Cannot Access Camera
            </h3>
            <p class="text-red-300 text-xs mb-4">{{ cameraErrorMessage }}</p>
            <el-button type="primary" size="small" @click="startCamera">
              Try Again
            </el-button>
          </div>
        </div>

        <div
          v-if="isCameraActive"
          class="mt-4 flex items-center justify-center gap-4"
        >
          <el-button
            class="w-full"
            size="large"
            type="danger"
            @click="stopCamera"
          >
            បញ្ឃប់
          </el-button>
          <el-button
            type="success"
            size="large"
            @click="takePhoto"
            class="w-full"
          >
            <el-icon class="mr-2 text-xl"><Camera /></el-icon>
            ថត (#{{ photos.length + 1 }})
          </el-button>
        </div>
      </section>

      <!-- SECTION 2: CAPTURED PHOTOS GALLERY -->
      <section
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2
              class="text-sm font-bold text-slate-800 uppercase tracking-wide"
            >
              រូបថតដែលបានថតមានចំនួន ({{ photos.length }}) រូប
            </h2>
          </div>
        </div>

        <div
          v-if="photos.length === 0"
          class="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50"
        >
          <el-icon class="text-4xl text-slate-300 mb-2"><Picture /></el-icon>
          <p class="text-sm font-medium text-slate-600">មិនទាន់មានរូបភាពទេ!!</p>
        </div>

        <div
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        >
          <div
            v-for="(item, index) in photos"
            :key="item.id"
            class="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs flex flex-col"
          >
            <div
              class="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[11px] font-semibold"
            >
              រូបទី {{ index + 1 }}
            </div>

            <div
              class="aspect-[3/4] overflow-hidden bg-slate-900 flex items-center justify-center"
            >
              <img
                :src="item.dataUrl"
                :alt="`Document Page ${index + 1}`"
                class="w-full h-full object-contain cursor-pointer"
                @click="openFullPreview(item.dataUrl)"
              />
            </div>

            <div
              class="p-2 bg-white flex items-center justify-between border-t border-slate-100"
            >
              <span class="text-[11px] text-slate-500"
                >រូបទី {{ index + 1 }}</span
              >
              <div class="flex items-center gap-1">
                <!-- NEW: Crop button -->
                <el-button
                  type="warning"
                  circle
                  size="small"
                  plain
                  @click="openCropDialog(index)"
                  title="Crop this photo"
                >
                  <el-icon><Crop /></el-icon>
                </el-button>
                <el-button
                  type="danger"
                  circle
                  size="small"
                  plain
                  @click="removePhoto(index)"
                  title="Remove this photo"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: CONVERT TO PDF & SHARE TO TELEGRAM -->
      <section
        v-if="photos.length > 0"
        class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-xs"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div class="flex items-center gap-2">
            <el-button
              type="primary"
              size="large"
              :loading="isGeneratingPdf"
              class="!font-bold !px-6 shadow-md shadow-blue-500/20 w-full"
              @click="convertPhotosToPdfAndOpenShare"
            >
              <el-icon class="mr-2"><Promotion /></el-icon>
              Convert to PDF & Share
            </el-button>
          </div>
        </div>
      </section>
    </main>

    <!-- ========================================== -->
    <!-- TELEGRAM SHARING MODAL DIALOG              -->
    <!-- ========================================== -->
    <el-dialog
      v-model="showTelegramModal"
      width="90%"
      class="max-w-lg"
      destroy-on-close
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600"
            >អាចប្ដូឈ្មោះ File បាន:</label
          >
          <el-input v-model="pdfFileName" placeholder="">
            <template #append>.pdf</template>
          </el-input>
        </div>

        <el-divider class="!my-1" />

        <div class="flex flex-col gap-3">
          <div
            v-if="canUseWebShare"
            class="p-3.5 border border-slate-200 hover:border-blue-400 rounded-xl bg-white transition-colors cursor-pointer flex items-center justify-between group"
            @click="shareViaWebShareApi"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg"
              >
                <el-icon><Share /></el-icon>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">
                  ផ្ញើរទៅ Telegram App
                </p>
              </div>
            </div>
            <el-button size="small" type="primary">Share</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ========================================== -->
    <!-- IMAGE FULL PREVIEW DIALOG                  -->
    <!-- ========================================== -->
    <el-dialog
      v-model="showPreviewModal"
      title="Photo Preview"
      width="90%"
      class="max-w-2xl"
      destroy-on-close
    >
      <div
        class="flex items-center justify-center bg-black rounded-lg p-2 max-h-[70vh] overflow-hidden"
      >
        <img
          :src="previewImageUrl"
          alt="Preview"
          class="max-w-full max-h-[65vh] object-contain rounded"
        />
      </div>
    </el-dialog>

    <!-- ========================================== -->
    <!-- NEW: CROP DIALOG                           -->
    <!-- ========================================== -->
    <el-dialog
      v-model="showCropModal"
      title="Crop Image"
      width="95%"
      class="max-w-3xl"
      destroy-on-close
      @opened="initCropCanvas"
    >
      <div class="flex flex-col gap-4">
        <!-- Crop canvas container -->
        <div
          class="relative bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2"
        >
          <canvas
            ref="cropCanvas"
            class="max-w-full max-h-[60vh] object-contain cursor-crosshair touch-none"
            @mousedown="startCropDrag"
            @mousemove="onCropDrag"
            @mouseup="endCropDrag"
            @mouseleave="endCropDrag"
            @touchstart.prevent="startCropDrag"
            @touchmove.prevent="onCropDrag"
            @touchend.prevent="endCropDrag"
          ></canvas>
        </div>

        <p class="text-xs text-slate-500 text-center">
          Drag on the image to select the crop area. The area outside the
          selection will be removed.
        </p>

        <!-- Action buttons -->
        <div class="flex items-center justify-end gap-2">
          <el-button @click="showCropModal = false">Cancel</el-button>
          <el-button type="warning" plain @click="resetCropSelection">
            <el-icon class="mr-1"><RefreshLeft /></el-icon>
            Reset
          </el-button>
          <el-button
            type="primary"
            :disabled="!hasCropSelection"
            @click="applyCrop"
          >
            <el-icon class="mr-1"><Check /></el-icon>
            Apply Crop
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * ==============================================================================
 * CamScanner Lite - Beginner-Friendly Vue 3 Script
 * ==============================================================================
 * This code is written step-by-step with simple, clear comments to help
 * beginner developers understand how:
 *  1. Camera access works (MediaDevices API)
 *  2. Photos are captured using an HTML5 Canvas
 *  3. Multiple photos are gathered into a simple list
 *  4. Photos can be cropped interactively on a canvas
 *  5. A multi-page PDF is generated in the browser using jsPDF
 *  6. The PDF is shared to Telegram (Web Share API, Telegram link, or Bot API)
 * ==============================================================================
 */

import { ref, onBeforeUnmount, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { jsPDF } from "jspdf";
import { Crop, Check, RefreshLeft } from "@element-plus/icons-vue";

// ------------------------------------------------------------------------------
// 1. STATE VARIABLES
// ------------------------------------------------------------------------------

const photos = ref([]);
const cropOverlay = ref(null); // The red framing box overlay
const videoElement = ref(null);
const canvasElement = ref(null);
const cameraStream = ref(null);
const isCameraActive = ref(false);
const currentFacingMode = ref("environment");
const cameraErrorMessage = ref("");
const showFlashEffect = ref(false);

const isGeneratingPdf = ref(false);
const showTelegramModal = ref(false);
const generatedPdfBlob = ref(null);
const pdfFileName = ref("");

const showBotConfig = ref(false);
const telegramBotToken = ref("");
const telegramChatId = ref("");
const isSendingViaBot = ref(false);

const showPreviewModal = ref(false);
const previewImageUrl = ref("");

const canUseWebShare = ref(
  typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare,
);

// ------------------------------------------------------------------------------
// CROP STATE
// ------------------------------------------------------------------------------
const showCropModal = ref(false);
const cropCanvas = ref(null);
const cropImage = ref(null); // HTMLImageElement of the photo being edited
const cropPhotoIndex = ref(-1); // Index in photos array being edited
const cropSelection = ref(null); // { x, y, w, h } in canvas coordinates
const isDraggingCrop = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const hasCropSelection = ref(false);
const displayedImageRect = ref(null); // Where the image is drawn on the canvas (for hit-testing)

// ------------------------------------------------------------------------------
// 2. CAMERA FUNCTIONS
// ------------------------------------------------------------------------------

async function startCamera() {
  cameraErrorMessage.value = "";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraErrorMessage.value = "Your browser does not support camera access.";
    return;
  }

  stopCamera();

  try {
    const constraints = {
      video: {
        facingMode: { ideal: currentFacingMode.value },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraStream.value = stream;

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      await videoElement.value.play();
    }

    isCameraActive.value = true;
  } catch (error) {
    console.error("Failed to open camera:", error);
    if (error.name === "NotAllowedError") {
      cameraErrorMessage.value =
        "Camera permission was denied. Please allow camera access in your browser settings.";
    } else if (error.name === "NotFoundError") {
      cameraErrorMessage.value = "No camera found on this device.";
    } else {
      cameraErrorMessage.value = "Could not start camera: " + error.message;
    }
  }
}

function stopCamera() {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((track) => track.stop());
    cameraStream.value = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
  isCameraActive.value = false;
}

async function switchCameraFacingMode() {
  currentFacingMode.value =
    currentFacingMode.value === "environment" ? "user" : "environment";
  await startCamera();
}

function takePhoto() {
  const video = videoElement.value;
  const canvas = canvasElement.value;
  const overlay = cropOverlay.value;

  if (!video || !canvas) return;

  const videoW = video.videoWidth || 1280;
  const videoH = video.videoHeight || 720;

  // --- Figure out where the video is actually painted inside the element ---
  const elementRect = video.getBoundingClientRect();
  const elementAspect = elementRect.width / elementRect.height;
  const videoAspect = videoW / videoH;

  let paintedW, paintedH, paintedX, paintedY;

  if (videoAspect > elementAspect) {
    paintedW = elementRect.width;
    paintedH = elementRect.width / videoAspect;
    paintedX = 0;
    paintedY = (elementRect.height - paintedH) / 2;
  } else {
    paintedH = elementRect.height;
    paintedW = elementRect.height * videoAspect;
    paintedX = (elementRect.width - paintedW) / 2;
    paintedY = 0;
  }

  // --- Get the overlay rect relative to the video element ---
  let srcX, srcY, srcW, srcH;

  if (overlay) {
    const overlayRect = overlay.getBoundingClientRect();
    const relX = overlayRect.left - elementRect.left;
    const relY = overlayRect.top - elementRect.top;

    const scaleX = videoW / paintedW;
    const scaleY = videoH / paintedH;

    srcX = (relX - paintedX) * scaleX;
    srcY = (relY - paintedY) * scaleY;
    srcW = overlayRect.width * scaleX;
    srcH = overlayRect.height * scaleY;

    srcX = Math.max(0, Math.min(srcX, videoW));
    srcY = Math.max(0, Math.min(srcY, videoH));
    srcW = Math.min(srcW, videoW - srcX);
    srcH = Math.min(srcH, videoH - srcY);
  } else {
    srcX = 0;
    srcY = 0;
    srcW = videoW;
    srcH = videoH;
  }

  // --- Draw the cropped region to an intermediate canvas at native resolution ---
  const intermediate = document.createElement("canvas");
  intermediate.width = Math.round(srcW);
  intermediate.height = Math.round(srcH);

  const ctx = intermediate.getContext("2d", { willReadFrequently: true });

  // Maximize image quality when drawing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    video,
    srcX, srcY, srcW, srcH,
    0, 0, intermediate.width, intermediate.height,
  );

  // --- Apply enhancement: desaturation (saturation = 0) + sharpening ---
  const enhancedCanvas = enhanceImage(intermediate);

  // --- Export at maximum quality (PNG = lossless, or JPEG at 1.0) ---
  // Use PNG for maximum clarity (no compression artifacts)
  const dataUrl = enhancedCanvas.toDataURL("image/png");

  photos.value.push({
    id: "photo_" + Date.now(),
    dataUrl: dataUrl,
  });

  showFlashEffect.value = true;
  setTimeout(() => {
    showFlashEffect.value = false;
  }, 100);

  ElMessage.success({
    message: `ជោគជ័យ ${photos.value.length}!`,
    duration: 1500,
  });
}

function enhanceImage(sourceCanvas) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;

  const outCtx = outCanvas.getContext("2d", { willReadFrequently: true });
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";

  // Draw original onto output canvas first
  outCtx.drawImage(sourceCanvas, 0, 0);

  // Get pixel data
  const imageData = outCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // --------------------------------------------------------------------
  // STEP 1: Desaturate (saturation = 0) — convert to grayscale
  // Using luminance formula: 0.299*R + 0.587*G + 0.114*B
  // --------------------------------------------------------------------
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
    // alpha (data[i + 3]) stays unchanged
  }

  // --------------------------------------------------------------------
  // STEP 2: Slight contrast boost to make text pop (optional but helps clarity)
  // contrast factor: 1.0 = no change, >1 = more contrast
  // --------------------------------------------------------------------
  const contrast = 1.15;
  const intercept = 128 * (1 - contrast);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * contrast + intercept));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * contrast + intercept));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * contrast + intercept));
  }

  // --------------------------------------------------------------------
  // STEP 3: Unsharp-mask sharpening (convolution kernel)
  // This makes edges (text) crisper for a "clear" look.
  // --------------------------------------------------------------------
  const sharpenedData = new Uint8ClampedArray(data); // copy
  const kernel = [
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0,
  ];
  const kSize = 3;
  const half = Math.floor(kSize / 2);
  const strength = 0.6; // 0 = no sharpen, 1 = full sharpen

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      let sumR = 0, sumG = 0, sumB = 0;

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = x + kx - half;
          const py = y + ky - half;
          const pIdx = (py * width + px) * 4;
          const weight = kernel[ky * kSize + kx];

          sumR += data[pIdx] * weight;
          sumG += data[pIdx + 1] * weight;
          sumB += data[pIdx + 2] * weight;
        }
      }

      // Blend between original and sharpened for controlled effect
      sharpenedData[idx]     = data[idx]     + (sumR - data[idx])     * strength;
      sharpenedData[idx + 1] = data[idx + 1] + (sumG - data[idx + 1]) * strength;
      sharpenedData[idx + 2] = data[idx + 2] + (sumB - data[idx + 2]) * strength;
      sharpenedData[idx + 3] = data[idx + 3];
    }
  }

  // Write sharpened pixels back
  const finalImageData = new ImageData(sharpenedData, width, height);
  outCtx.putImageData(finalImageData, 0, 0);

  return outCanvas;
}

function removePhoto(index) {
  photos.value.splice(index, 1);
  ElMessage.info("Photo removed.");
}

function clearAllPhotos() {
  photos.value = [];
  generatedPdfBlob.value = null;
  ElMessage.info("All photos cleared.");
}

function openFullPreview(dataUrl) {
  previewImageUrl.value = dataUrl;
  showPreviewModal.value = true;
}

// ------------------------------------------------------------------------------
// 3. IMAGE CROP FUNCTIONS
// ------------------------------------------------------------------------------

/**
 * Opens the crop dialog for a given photo index and loads its image.
 */
function openCropDialog(index) {
  cropPhotoIndex.value = index;
  cropSelection.value = null;
  hasCropSelection.value = false;
  showCropModal.value = true;
  // Canvas initialization happens in @opened event after the dialog is rendered.
}

/**
 * Called when the crop dialog finishes opening. Loads the image into the canvas
 * and fits it within the available area.
 */
async function initCropCanvas() {
  if (cropPhotoIndex.value < 0 || !cropCanvas.value) return;

  const dataUrl = photos.value[cropPhotoIndex.value]?.dataUrl;
  if (!dataUrl) return;

  // Load the image
  const img = await loadImage(dataUrl);
  cropImage.value = img;

  // Compute a display size that fits the canvas container (max width ~900px)
  const maxDisplayWidth = Math.min(900, window.innerWidth * 0.85);
  const maxDisplayHeight = window.innerHeight * 0.55;

  let displayWidth = img.width;
  let displayHeight = img.height;
  const ratio = Math.min(
    maxDisplayWidth / img.width,
    maxDisplayHeight / img.height,
    1,
  );
  displayWidth = Math.floor(img.width * ratio);
  displayHeight = Math.floor(img.height * ratio);

  // Set canvas internal size to displayed size (simpler hit-testing),
  // but we will still use the original image at export time.
  const canvas = cropCanvas.value;
  canvas.width = displayWidth;
  canvas.height = displayHeight;

  // Draw the image scaled down
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, displayWidth, displayHeight);
  ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

  displayedImageRect.value = {
    x: 0,
    y: 0,
    w: displayWidth,
    h: displayHeight,
    scaleX: img.width / displayWidth,
    scaleY: img.height / displayHeight,
  };
}

/**
 * Returns the pointer position relative to the canvas (works for mouse + touch).
 */
function getPointerPos(e) {
  const canvas = cropCanvas.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  let clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function startCropDrag(e) {
  const pos = getPointerPos(e);
  isDraggingCrop.value = true;
  dragStart.value = pos;
  cropSelection.value = { x: pos.x, y: pos.y, w: 0, h: 0 };
  redrawCropCanvas();
}

function onCropDrag(e) {
  if (!isDraggingCrop.value) return;
  const pos = getPointerPos(e);

  const x1 = Math.min(dragStart.value.x, pos.x);
  const y1 = Math.min(dragStart.value.y, pos.y);
  const x2 = Math.max(dragStart.value.x, pos.x);
  const y2 = Math.max(dragStart.value.y, pos.y);

  // Clamp within image bounds
  const rect = displayedImageRect.value;
  const clampedX1 = Math.max(rect.x, Math.min(x1, rect.x + rect.w));
  const clampedY1 = Math.max(rect.y, Math.min(y1, rect.y + rect.h));
  const clampedX2 = Math.max(rect.x, Math.min(x2, rect.x + rect.w));
  const clampedY2 = Math.max(rect.y, Math.min(y2, rect.y + rect.h));

  cropSelection.value = {
    x: clampedX1,
    y: clampedY1,
    w: Math.max(1, clampedX2 - clampedX1),
    h: Math.max(1, clampedY2 - clampedY1),
  };

  hasCropSelection.value =
    cropSelection.value.w > 5 && cropSelection.value.h > 5;
  redrawCropCanvas();
}

function endCropDrag() {
  isDraggingCrop.value = false;
}

function resetCropSelection() {
  cropSelection.value = null;
  hasCropSelection.value = false;
  redrawCropCanvas();
}

/**
 * Redraws the image and overlays the crop selection rectangle with a dimmed
 * area outside of it for better visual feedback.
 */
function redrawCropCanvas() {
  const canvas = cropCanvas.value;
  const img = cropImage.value;
  const rect = displayedImageRect.value;
  if (!canvas || !img || !rect) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, rect.w, rect.h);

  const sel = cropSelection.value;
  if (!sel || sel.w <= 1 || sel.h <= 1) return;

  // Dim everything outside the selection
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  // Top
  ctx.fillRect(0, 0, canvas.width, sel.y);
  // Bottom
  ctx.fillRect(0, sel.y + sel.h, canvas.width, canvas.height - (sel.y + sel.h));
  // Left
  ctx.fillRect(0, sel.y, sel.x, sel.h);
  // Right
  ctx.fillRect(sel.x + sel.w, sel.y, canvas.width - (sel.x + sel.w), sel.h);

  // Draw selection border
  ctx.strokeStyle = "#f59e0b"; // amber-500
  ctx.lineWidth = 2;
  ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);

  // Corner handles
  const handleSize = 8;
  ctx.fillStyle = "#f59e0b";
  const corners = [
    [sel.x, sel.y],
    [sel.x + sel.w, sel.y],
    [sel.x, sel.y + sel.h],
    [sel.x + sel.w, sel.y + sel.h],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillRect(
      cx - handleSize / 2,
      cy - handleSize / 2,
      handleSize,
      handleSize,
    );
  });

  ctx.restore();
}

/**
 * Applies the current crop selection: crops the original image into a new
 * Data URL and replaces the corresponding photo in the photos array.
 */
async function applyCrop() {
  if (!hasCropSelection.value || !cropSelection.value || !cropImage.value) {
    ElMessage.warning("Please drag to select a crop area first.");
    return;
  }

  const img = cropImage.value;
  const sel = cropSelection.value;
  const rect = displayedImageRect.value;

  // Convert canvas coordinates back to original image coordinates
  const sx = (sel.x - rect.x) * rect.scaleX;
  const sy = (sel.y - rect.y) * rect.scaleY;
  const sw = sel.w * rect.scaleX;
  const sh = sel.h * rect.scaleY;

  // Create an offscreen canvas to perform the crop at native resolution
  const offscreen = document.createElement("canvas");
  offscreen.width = Math.max(1, Math.round(sw));
  offscreen.height = Math.max(1, Math.round(sh));
  const ctx = offscreen.getContext("2d");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, offscreen.width, offscreen.height);

 const croppedDataUrl = offscreen.toDataURL("image/png");

  // Replace the photo entry in-place
  const index = cropPhotoIndex.value;
  if (index >= 0 && index < photos.value.length) {
    photos.value[index] = {
      ...photos.value[index],
      dataUrl: croppedDataUrl,
    };
  }

  // Invalidate any previously generated PDF so it must be regenerated
  generatedPdfBlob.value = null;

  showCropModal.value = false;
  ElMessage.success("Image cropped!");
}

/**
 * Load an image from a URL into an HTMLImageElement.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

// ------------------------------------------------------------------------------
// 4. PDF GENERATION (Using jsPDF)
// ------------------------------------------------------------------------------

async function convertPhotosToPdf() {
  if (photos.value.length === 0) {
    ElMessage.warning("Please capture at least one photo first.");
    return null;
  }

  isGeneratingPdf.value = true;

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    for (let i = 0; i < photos.value.length; i++) {
      if (i > 0) {
        doc.addPage("a4", "portrait");
      }

      const photoItem = photos.value[i];
      const img = await loadImage(photoItem.dataUrl);

      const imgRatio = img.width / img.height;
      const pageRatio = usableWidth / usableHeight;

      let renderWidth = usableWidth;
      let renderHeight = usableHeight;
      let posX = margin;
      let posY = margin;

      if (imgRatio > pageRatio) {
        renderHeight = usableWidth / imgRatio;
        posY = margin + (usableHeight - renderHeight) / 2;
      } else {
        renderWidth = usableHeight * imgRatio;
        posX = margin + (usableWidth - renderWidth) / 2;
      }

      doc.addImage(
        photoItem.dataUrl,
        "PNG",
        posX,
        posY,
        renderWidth,
        renderHeight,
      );
    }

    const blob = doc.output("blob");
    generatedPdfBlob.value = blob;

    return blob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    ElMessage.error("Failed to create PDF: " + error.message);
    return null;
  } finally {
    isGeneratingPdf.value = false;
  }
}

async function convertPhotosToPdfAndOpenShare() {
  const blob = await convertPhotosToPdf();
  if (blob) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    pdfFileName.value = ``;
    showTelegramModal.value = true;
  }
}

// ------------------------------------------------------------------------------
// 5. TELEGRAM SHARING METHODS
// ------------------------------------------------------------------------------

async function shareViaWebShareApi() {
  if (!generatedPdfBlob.value) {
    ElMessage.warning("Please generate PDF first.");
    return;
  }

  try {
    const filename = `${pdfFileName.value.trim() || "Scanned_Doc"}.pdf`;
    const file = new File([generatedPdfBlob.value], filename, {
      type: "application/pdf",
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: filename,
        text: "Here is my scanned document PDF.",
        files: [file],
      });
      ElMessage.success("Shared successfully!");
    } else {
      ElMessage.warning(
        "Sharing files is not supported on this browser. Try the Telegram link or Bot method below.",
      );
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      ElMessage.error("Could not share file: " + err.message);
    }
  }
}

function shareViaTelegramLink() {
  const text = encodeURIComponent(
    `📄 Scanned Document: ${pdfFileName.value}.pdf (${photos.value.length} pages)`,
  );
  const currentUrl = encodeURIComponent(window.location.href);

  const telegramUrl = `https://t.me/share/url?url=${currentUrl}&text=${text}`;

  window.open(telegramUrl, "_blank");
}

async function sendPdfViaTelegramBot() {
  if (!telegramBotToken.value.trim()) {
    ElMessage.warning("Please enter your Telegram Bot Token.");
    return;
  }
  if (!telegramChatId.value.trim()) {
    ElMessage.warning("Please enter a Chat ID or Channel username.");
    return;
  }
  if (!generatedPdfBlob.value) {
    ElMessage.warning("No PDF generated.");
    return;
  }

  isSendingViaBot.value = true;

  try {
    const filename = `${pdfFileName.value.trim() || "Scanned_Doc"}.pdf`;

    const formData = new FormData();
    formData.append("chat_id", telegramChatId.value.trim());
    formData.append("document", generatedPdfBlob.value, filename);
    formData.append(
      "caption",
      `📄 Scanned with CamScanner Lite (${photos.value.length} pages)`,
    );

    const apiUrl = `https://api.telegram.org/bot${telegramBotToken.value.trim()}/sendDocument`;

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.ok) {
      ElMessage.success("PDF sent to Telegram successfully!");
    } else {
      ElMessage.error(
        "Telegram API Error: " + (result.description || "Failed to send"),
      );
    }
  } catch (error) {
    console.error("Telegram bot send error:", error);
    ElMessage.error("Failed to connect to Telegram API: " + error.message);
  } finally {
    isSendingViaBot.value = false;
  }
}

function downloadPdfDirectly() {
  if (!generatedPdfBlob.value) return;

  const filename = `${pdfFileName.value.trim() || "Scanned_Doc"}.pdf`;
  const url = URL.createObjectURL(generatedPdfBlob.value);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
  ElMessage.success(`Downloaded ${filename}!`);
}

// Clean up camera when user leaves or component unmounts
onBeforeUnmount(() => {
  stopCamera();
});
</script>
