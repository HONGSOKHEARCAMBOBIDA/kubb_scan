<template>
  <div class="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
    <!-- ========================================== -->
    <!-- HEADER                                     -->
    <!-- ========================================== -->
    <header class="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">


      <!-- Photos Counter Badge -->
      <div class="flex items-center gap-2">
        <el-tag v-if="photos.length > 0" type="primary" effect="dark" round>
          {{ photos.length }} {{ photos.length === 1 ? 'Photo' : 'Photos' }}
        </el-tag>
        <el-button
          v-if="photos.length > 0"
          type="danger"
          plain
          size="small"
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
    <main class="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-28 flex flex-col gap-6">

      <!-- SECTION 1: LIVE CAMERA VIEWFINDER -->
      <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="isCameraActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'"></span>
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Step 1: Camera Capture
            </h2>
          </div>

          <!-- Switch Camera Button (Front vs Rear Camera) -->
          <el-button
            v-if="isCameraActive"
            size="small"
            plain
            @click="switchCameraFacingMode"
          >
            <el-icon class="mr-1"><Refresh /></el-icon>
            Switch Camera ({{ currentFacingMode === 'environment' ? 'Rear' : 'Front' }})
          </el-button>
        </div>

        <!-- Camera Video Screen Box -->
        <div class="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
          
          <!-- HTML5 Video element showing live camera stream -->
          <video
            ref="videoElement"
            autoplay
            playsinline
            muted
            class="w-full h-full object-contain"
            :class="{ 'hidden': !isCameraActive }"
          ></video>

          <!-- Hidden canvas used to grab image frame from video -->
          <canvas ref="canvasElement" class="hidden"></canvas>

          <!-- Flash effect when capturing a photo -->
          <div
            v-if="showFlashEffect"
            class="absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 opacity-90"
          ></div>

          <!-- Document Alignment Frame Overlay -->
          <div v-if="isCameraActive" class="absolute inset-4 sm:inset-10 pointer-events-none border-2 border-cyan-400/40 rounded-xl flex items-center justify-center">
            <!-- Corner brackets -->
            <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl"></div>
            <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr"></div>
            <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl"></div>
            <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br"></div>
            
            <span class="text-xs text-cyan-200/90 bg-slate-900/70 px-3 py-1 rounded-full backdrop-blur-xs">
              Place document inside this frame
            </span>
          </div>

          <!-- State: Camera Turned OFF -->
          <div v-if="!isCameraActive && !cameraErrorMessage" class="text-center p-6 flex flex-col items-center">
            <div class="w-16 h-16 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-3xl mb-3">
              <el-icon><Camera /></el-icon>
            </div>
            <h3 class="text-white font-semibold text-base mb-1">Camera is Turned Off</h3>
            <p class="text-slate-400 text-xs max-w-sm mb-4">
              Click the button below to allow camera access and begin capturing your document pages.
            </p>
            <el-button type="primary" size="large" @click="startCamera">
              <el-icon class="mr-1.5"><Camera /></el-icon>
              Start Camera
            </el-button>
          </div>

          <!-- State: Camera Error (Permission denied or not found) -->
          <div v-if="cameraErrorMessage" class="text-center p-6 flex flex-col items-center max-w-md">
            <div class="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-2xl mb-2">
              <el-icon><Warning /></el-icon>
            </div>
            <h3 class="text-white font-semibold text-sm mb-1">Cannot Access Camera</h3>
            <p class="text-red-300 text-xs mb-4">{{ cameraErrorMessage }}</p>
            <el-button type="primary" size="small" @click="startCamera">
              Try Again
            </el-button>
          </div>
        </div>

        <!-- Camera Action Buttons Below Viewfinder -->
        <div v-if="isCameraActive" class="mt-4 flex items-center justify-center gap-4">
          <!-- Big Shutter Button -->
          <el-button
            type="primary"
            size="large"
            class="!px-8 !py-6 !text-base !font-bold !rounded-full shadow-lg shadow-blue-500/30"
            @click="takePhoto"
          >
            <el-icon class="mr-2 text-xl"><Camera /></el-icon>
            Snap Photo (#{{ photos.length + 1 }})
          </el-button>

          <!-- Stop Camera -->
          <el-button size="large" round @click="stopCamera">
            Stop Camera
          </el-button>
        </div>
      </section>

      <!-- SECTION 2: CAPTURED PHOTOS GALLERY -->
      <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Step 2: Review Captured Pages ({{ photos.length }})
            </h2>
            <p class="text-xs text-slate-500">Each photo will be placed on a separate page in the final PDF.</p>
          </div>
        </div>

        <!-- Empty State: No photos snapped yet -->
        <div v-if="photos.length === 0" class="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <el-icon class="text-4xl text-slate-300 mb-2"><Picture /></el-icon>
          <p class="text-sm font-medium text-slate-600">No photos taken yet</p>
          <p class="text-xs text-slate-400 mt-1">Use the camera above to take one or multiple photos.</p>
        </div>

        <!-- Photos Grid -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div
            v-for="(item, index) in photos"
            :key="item.id"
            class="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs flex flex-col"
          >
            <!-- Page Number Tag -->
            <div class="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[11px] font-semibold">
              Page {{ index + 1 }}
            </div>

            <!-- Thumbnail Image -->
            <div class="aspect-[3/4] overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                :src="item.dataUrl"
                :alt="`Document Page ${index + 1}`"
                class="w-full h-full object-contain cursor-pointer"
                @click="openFullPreview(item.dataUrl)"
              />
            </div>

            <!-- Card Bottom Bar: Delete Button -->
            <div class="p-2 bg-white flex items-center justify-between border-t border-slate-100">
              <span class="text-[11px] text-slate-500">Page {{ index + 1 }}</span>
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
      </section>

      <!-- SECTION 3: CONVERT TO PDF & SHARE TO TELEGRAM -->
      <section v-if="photos.length > 0" class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <el-icon class="text-blue-600"><DocumentChecked /></el-icon>
              Step 3: Convert & Share to Telegram
            </h2>
            <p class="text-xs text-slate-600 mt-1">
              Combine all {{ photos.length }} pages into a single PDF document ready to send.
            </p>
          </div>

          <!-- Conversion Trigger Button -->
          <div class="flex items-center gap-2">
            <el-button
              type="primary"
              size="large"
              :loading="isGeneratingPdf"
              class="!font-bold !px-6 shadow-md shadow-blue-500/20"
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
      title="Share PDF to Telegram"
      width="90%"
      class="max-w-lg"
      destroy-on-close
    >
      <div class="flex flex-col gap-4">
        <!-- Document Ready Card -->
        <div class="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xl">
            <el-icon><Document /></el-icon>
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-bold text-slate-800">{{ pdfFileName }}.pdf</h4>
            <p class="text-xs text-slate-500">{{ photos.length }} pages • Ready to share</p>
          </div>
          <el-button size="small" type="primary" plain @click="downloadPdfDirectly">
            <el-icon class="mr-1"><Download /></el-icon>
            Download
          </el-button>
        </div>

        <!-- Custom PDF Filename Input -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-slate-600">PDF File Name:</label>
          <el-input v-model="pdfFileName" placeholder="My_Scanned_Document">
            <template #append>.pdf</template>
          </el-input>
        </div>

        <el-divider class="!my-1" />

        <!-- Sharing Options -->
        <div class="flex flex-col gap-3">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Choose How to Share:
          </span>

          <!-- Option 1: Native Share Sheet (Send PDF File directly to Telegram App) -->
          <div
            v-if="canUseWebShare"
            class="p-3.5 border border-slate-200 hover:border-blue-400 rounded-xl bg-white transition-colors cursor-pointer flex items-center justify-between group"
            @click="shareViaWebShareApi"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                <el-icon><Share /></el-icon>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">Send PDF to Telegram App</p>
                <p class="text-xs text-slate-500">Opens your phone's share menu to pick Telegram</p>
              </div>
            </div>
            <el-button size="small" type="primary">Share</el-button>
          </div>

          <!-- Option 2: Telegram Web Share Link (t.me/share/url) -->
          <div
            class="p-3.5 border border-slate-200 hover:border-blue-400 rounded-xl bg-white transition-colors cursor-pointer flex items-center justify-between group"
            @click="shareViaTelegramLink"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-lg">
                <el-icon><Promotion /></el-icon>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">Open Telegram Web / Chat</p>
                <p class="text-xs text-slate-500">Opens Telegram share link with document details</p>
              </div>
            </div>
            <el-button size="small" type="primary" plain>Open</el-button>
          </div>

          <!-- Option 3: Send Directly via Telegram Bot API -->
          <div class="p-3.5 border border-slate-200 rounded-xl bg-slate-50 flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <el-icon class="text-blue-600"><Position /></el-icon>
                <span class="text-xs font-bold text-slate-700">Send via Telegram Bot (Direct Upload)</span>
              </div>
              <el-button
                size="small"
                link
                type="primary"
                @click="showBotConfig = !showBotConfig"
              >
                {{ showBotConfig ? 'Hide Bot Settings' : 'Configure Bot' }}
              </el-button>
            </div>

            <!-- Bot Settings Input Fields -->
            <div v-if="showBotConfig" class="flex flex-col gap-2 pt-2 border-t border-slate-200">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-medium text-slate-600">Telegram Bot Token:</label>
                <el-input
                  v-model="telegramBotToken"
                  size="small"
                  placeholder="e.g., 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  show-password
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-medium text-slate-600">Chat ID or Channel (@username):</label>
                <el-input
                  v-model="telegramChatId"
                  size="small"
                  placeholder="e.g., 987654321 or @my_channel"
                />
              </div>

              <el-button
                type="primary"
                size="small"
                :loading="isSendingViaBot"
                @click="sendPdfViaTelegramBot"
              >
                Send PDF via Bot to Chat
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-400">PDF created in your browser</span>
          <el-button @click="showTelegramModal = false">Close</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ========================================== -->
    <!-- IMAGE FULL PREVIEW DIALOG                  -->
    <!-- ========================================== -->
    <el-dialog v-model="showPreviewModal" title="Photo Preview" width="90%" class="max-w-2xl" destroy-on-close>
      <div class="flex items-center justify-center bg-black rounded-lg p-2 max-h-[70vh] overflow-hidden">
        <img :src="previewImageUrl" alt="Preview" class="max-w-full max-h-[65vh] object-contain rounded" />
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
 *  4. A multi-page PDF is generated in the browser using jsPDF
 *  5. The PDF is shared to Telegram (Web Share API, Telegram link, or Bot API)
 * ==============================================================================
 */

import { ref, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { jsPDF } from 'jspdf';

// ------------------------------------------------------------------------------
// 1. STATE VARIABLES
// ------------------------------------------------------------------------------

// Array holding all captured photos: [{ id: string, dataUrl: string }, ...]
const photos = ref([]);

// Camera references and status
const videoElement = ref(null);      // Points to <video> tag in HTML
const canvasElement = ref(null);     // Points to <canvas> tag in HTML
const cameraStream = ref(null);      // Holds active MediaStream from webcam
const isCameraActive = ref(false);   // Is camera currently on or off?
const currentFacingMode = ref('environment'); // 'environment' = rear camera, 'user' = selfie
const cameraErrorMessage = ref('');  // Holds error if camera permission was denied
const showFlashEffect = ref(false);  // Triggers camera shutter flash animation

// PDF & Telegram state
const isGeneratingPdf = ref(false);
const showTelegramModal = ref(false);
const generatedPdfBlob = ref(null);
const pdfFileName = ref('My_Scanned_Document');

// Telegram Bot direct send options (optional)
const showBotConfig = ref(false);
const telegramBotToken = ref('');
const telegramChatId = ref('');
const isSendingViaBot = ref(false);

// Full image preview dialog
const showPreviewModal = ref(false);
const previewImageUrl = ref('');

// Check if browser supports Web Share API for files (mobile Chrome/Safari)
const canUseWebShare = ref(
  typeof navigator !== 'undefined' &&
  !!navigator.share &&
  !!navigator.canShare
);

// ------------------------------------------------------------------------------
// 2. CAMERA FUNCTIONS (Open, Switch, Capture, Stop)
// ------------------------------------------------------------------------------

/**
 * Starts the user's camera stream using the browser MediaDevices API
 */
async function startCamera() {
  cameraErrorMessage.value = '';

  // Check if browser supports camera
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraErrorMessage.value = 'Your browser does not support camera access.';
    return;
  }

  // Stop any running camera before opening a new one
  stopCamera();

  try {
    // Request camera video with preferred resolution and facing mode
    const constraints = {
      video: {
        facingMode: { ideal: currentFacingMode.value },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false, // We do not need microphone audio
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraStream.value = stream;

    // Attach stream to the <video> element so user sees the live preview
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      await videoElement.value.play();
    }

    isCameraActive.value = true;
  } catch (error) {
    console.error('Failed to open camera:', error);
    if (error.name === 'NotAllowedError') {
      cameraErrorMessage.value = 'Camera permission was denied. Please allow camera access in your browser settings.';
    } else if (error.name === 'NotFoundError') {
      cameraErrorMessage.value = 'No camera found on this device.';
    } else {
      cameraErrorMessage.value = 'Could not start camera: ' + error.message;
    }
  }
}

/**
 * Stops the camera and releases the hardware
 */
function stopCamera() {
  if (cameraStream.value) {
    // Stop every video track
    cameraStream.value.getTracks().forEach((track) => track.stop());
    cameraStream.value = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
  isCameraActive.value = false;
}

/**
 * Switches between front camera (selfie) and rear camera
 */
async function switchCameraFacingMode() {
  currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment';
  await startCamera();
}

/**
 * Captures a single photo frame from the video stream onto a canvas
 */
function takePhoto() {
  const video = videoElement.value;
  const canvas = canvasElement.value;

  if (!video || !canvas) return;

  // Set canvas size to match the real video resolution
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  canvas.width = width;
  canvas.height = height;

  // Draw current video frame onto canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, width, height);

  // Convert canvas drawing to JPEG image Data URL (base64 string)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  // Add the captured photo to our list
  photos.value.push({
    id: 'photo_' + Date.now(),
    dataUrl: dataUrl,
  });

  // Trigger quick white screen flash animation for camera feedback
  showFlashEffect.value = true;
  setTimeout(() => {
    showFlashEffect.value = false;
  }, 100);

  ElMessage.success({
    message: `Captured Page #${photos.value.length}!`,
    duration: 1500,
  });
}

/**
 * Removes a photo by its index
 */
function removePhoto(index) {
  photos.value.splice(index, 1);
  ElMessage.info('Photo removed.');
}

/**
 * Clears all photos
 */
function clearAllPhotos() {
  photos.value = [];
  generatedPdfBlob.value = null;
  ElMessage.info('All photos cleared.');
}

/**
 * Opens full image in a preview modal
 */
function openFullPreview(dataUrl) {
  previewImageUrl.value = dataUrl;
  showPreviewModal.value = true;
}

// ------------------------------------------------------------------------------
// 3. PDF GENERATION (Using jsPDF)
// ------------------------------------------------------------------------------

/**
 * Helper: Loads an image URL into an Image object to read its natural width & height
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Converts all captured photos into a single PDF document
 */
async function convertPhotosToPdf() {
  if (photos.value.length === 0) {
    ElMessage.warning('Please capture at least one photo first.');
    return null;
  }

  isGeneratingPdf.value = true;

  try {
    // Create new PDF instance with A4 dimensions (210 x 297 mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10; // 10mm padding around page

    const usableWidth = pageWidth - margin * 2;   // 190 mm
    const usableHeight = pageHeight - margin * 2; // 277 mm

    // Loop through each photo and add it to its own page
    for (let i = 0; i < photos.value.length; i++) {
      // If it's not the first page, add a new blank page
      if (i > 0) {
        doc.addPage('a4', 'portrait');
      }

      const photoItem = photos.value[i];
      const img = await loadImage(photoItem.dataUrl);

      // Calculate aspect ratio so the image never stretches or distorts
      const imgRatio = img.width / img.height;
      const pageRatio = usableWidth / usableHeight;

      let renderWidth = usableWidth;
      let renderHeight = usableHeight;
      let posX = margin;
      let posY = margin;

      if (imgRatio > pageRatio) {
        // Image is wider than page printable area
        renderHeight = usableWidth / imgRatio;
        posY = margin + (usableHeight - renderHeight) / 2; // Center vertically
      } else {
        // Image is taller than page printable area
        renderWidth = usableHeight * imgRatio;
        posX = margin + (usableWidth - renderWidth) / 2;   // Center horizontally
      }

      // Add image to PDF
      doc.addImage(photoItem.dataUrl, 'JPEG', posX, posY, renderWidth, renderHeight);
    }

    // Export PDF as Blob file
    const blob = doc.output('blob');
    generatedPdfBlob.value = blob;

    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    ElMessage.error('Failed to create PDF: ' + error.message);
    return null;
  } finally {
    isGeneratingPdf.value = false;
  }
}

/**
 * Button handler: Converts photos to PDF and opens the Telegram share dialog
 */
async function convertPhotosToPdfAndOpenShare() {
  const blob = await convertPhotosToPdf();
  if (blob) {
    // Generate clean filename
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    pdfFileName.value = `Scanned_Doc_${dateStr}_${photos.value.length}p`;
    showTelegramModal.value = true;
  }
}

// ------------------------------------------------------------------------------
// 4. TELEGRAM SHARING METHODS
// ------------------------------------------------------------------------------

/**
 * Method 1: Web Share API (Sends actual PDF file directly to Telegram app on mobile/desktop)
 */
async function shareViaWebShareApi() {
  if (!generatedPdfBlob.value) {
    ElMessage.warning('Please generate PDF first.');
    return;
  }

  try {
    const filename = `${pdfFileName.value.trim() || 'Scanned_Doc'}.pdf`;
    const file = new File([generatedPdfBlob.value], filename, {
      type: 'application/pdf',
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: filename,
        text: 'Here is my scanned document PDF.',
        files: [file],
      });
      ElMessage.success('Shared successfully!');
    } else {
      ElMessage.warning('Sharing files is not supported on this browser. Try the Telegram link or Bot method below.');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      ElMessage.error('Could not share file: ' + err.message);
    }
  }
}

/**
 * Method 2: Opens Telegram Web / Telegram Desktop share link (t.me/share/url)
 */
function shareViaTelegramLink() {
  const text = encodeURIComponent(
    `📄 Scanned Document: ${pdfFileName.value}.pdf (${photos.value.length} pages)`
  );
  const currentUrl = encodeURIComponent(window.location.href);

  // Telegram official share URL: https://t.me/share/url?url=...&text=...
  const telegramUrl = `https://t.me/share/url?url=${currentUrl}&text=${text}`;

  window.open(telegramUrl, '_blank');
}

/**
 * Method 3: Sends the actual PDF file directly to a Telegram Chat via Bot API
 * Endpoint: https://api.telegram.org/bot<TOKEN>/sendDocument
 */
async function sendPdfViaTelegramBot() {
  if (!telegramBotToken.value.trim()) {
    ElMessage.warning('Please enter your Telegram Bot Token.');
    return;
  }
  if (!telegramChatId.value.trim()) {
    ElMessage.warning('Please enter a Chat ID or Channel username.');
    return;
  }
  if (!generatedPdfBlob.value) {
    ElMessage.warning('No PDF generated.');
    return;
  }

  isSendingViaBot.value = true;

  try {
    const filename = `${pdfFileName.value.trim() || 'Scanned_Doc'}.pdf`;

    // Construct FormData to upload the file to Telegram Bot API
    const formData = new FormData();
    formData.append('chat_id', telegramChatId.value.trim());
    formData.append('document', generatedPdfBlob.value, filename);
    formData.append('caption', `📄 Scanned with CamScanner Lite (${photos.value.length} pages)`);

    const apiUrl = `https://api.telegram.org/bot${telegramBotToken.value.trim()}/sendDocument`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.ok) {
      ElMessage.success('PDF sent to Telegram successfully!');
    } else {
      ElMessage.error('Telegram API Error: ' + (result.description || 'Failed to send'));
    }
  } catch (error) {
    console.error('Telegram bot send error:', error);
    ElMessage.error('Failed to connect to Telegram API: ' + error.message);
  } finally {
    isSendingViaBot.value = false;
  }
}

/**
 * Download PDF directly to local machine
 */
function downloadPdfDirectly() {
  if (!generatedPdfBlob.value) return;

  const filename = `${pdfFileName.value.trim() || 'Scanned_Doc'}.pdf`;
  const url = URL.createObjectURL(generatedPdfBlob.value);

  const a = document.createElement('a');
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



