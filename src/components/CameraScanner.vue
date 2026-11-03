<template>
  <el-dialog
    v-model="visible"
    :title="null"
    :show-close="false"
    :fullscreen="true"
    destroy-on-close
    class="camera-fullscreen-dialog !p-0 !m-0 !bg-slate-950"
    @opened="initCamera"
    @closed="stopCamera"
  >
    <div class="relative w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      <!-- Camera Top Bar -->
      <div class="z-20 flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span class="font-semibold text-sm tracking-wide text-slate-200">
            Scanner Camera
          </span>
          <el-tag size="small" type="info" effect="dark" class="ml-2 !bg-slate-800 !border-slate-700">
            {{ capturedCount }} captured
          </el-tag>
        </div>

        <div class="flex items-center gap-2">
          <!-- Torch button if supported -->
          <el-button
            v-if="hasTorch"
            circle
            size="small"
            :type="torchEnabled ? 'warning' : 'info'"
            @click="toggleTorch"
            :title="torchEnabled ? 'Turn off flash' : 'Turn on flash'"
          >
            <el-icon><Sunny /></el-icon>
          </el-button>

          <!-- Camera Switch (facing mode) -->
          <el-button
            v-if="availableVideoDevices.length > 1 || isMobile"
            circle
            size="small"
            type="info"
            @click="switchCamera"
            title="Switch Camera (Front/Rear)"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>

          <!-- Close / Done button -->
          <el-button
            type="primary"
            round
            size="small"
            @click="closeScanner"
            class="!px-4 font-medium"
          >
            Done ({{ capturedCount }})
          </el-button>
        </div>
      </div>

      <!-- Video Viewfinder Area -->
      <div class="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        <!-- Live Video Element -->
        <video
          ref="videoEl"
          autoplay
          playsinline
          muted
          class="w-full h-full object-contain pointer-events-none"
        ></video>

        <!-- Hidden canvas for capturing frame at native camera resolution -->
        <canvas ref="canvasEl" class="hidden"></canvas>

        <!-- Shutter flash animation -->
        <div
          v-if="showFlash"
          class="absolute inset-0 bg-white pointer-events-none transition-opacity duration-150"
          :class="showFlash ? 'opacity-90' : 'opacity-0'"
        ></div>

        <!-- CamScanner Document Framing Guides -->
        <div class="absolute inset-0 pointer-events-none flex items-center justify-center p-6 sm:p-12">
          <div class="relative w-full max-w-lg aspect-[3/4] border border-white/20 rounded-2xl shadow-2xl overflow-hidden backdrop-brightness-105">
            <!-- Viewfinder corner brackets -->
            <div class="absolute top-0 left-0 w-8 h-8 corner-bracket-tl"></div>
            <div class="absolute top-0 right-0 w-8 h-8 corner-bracket-tr"></div>
            <div class="absolute bottom-0 left-0 w-8 h-8 corner-bracket-bl"></div>
            <div class="absolute bottom-0 right-0 w-8 h-8 corner-bracket-br"></div>

            <!-- CamScanner animated laser scan line -->
            <div class="scanner-beam absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8]"></div>

            <!-- Framing hint label -->
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-cyan-200 border border-cyan-500/30">
              Align document edges within the frame
            </div>
          </div>
        </div>

        <!-- Camera Loading / Permission Error Overlay -->
        <div
          v-if="cameraLoading || errorMessage"
          class="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-30"
        >
          <div v-if="cameraLoading" class="flex flex-col items-center gap-3">
            <el-icon class="is-loading !text-4xl text-blue-400"><Loading /></el-icon>
            <p class="text-slate-300 text-sm">Opening camera feed...</p>
          </div>

          <div v-else-if="errorMessage" class="max-w-md flex flex-col items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-2xl">
              <el-icon><Warning /></el-icon>
            </div>
            <h3 class="text-lg font-semibold text-white">Camera Access Notice</h3>
            <p class="text-slate-400 text-sm leading-relaxed">{{ errorMessage }}</p>

            <div class="flex gap-3 mt-3">
              <el-button type="primary" @click="initCamera">
                <el-icon class="mr-1"><Refresh /></el-icon> Retry Camera
              </el-button>
              <el-button @click="closeScanner">
                Close
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Camera Bottom Controls Bar -->
      <div class="z-20 flex items-center justify-between px-6 py-5 bg-slate-900/90 backdrop-blur-md border-t border-slate-800">
        <!-- Left: Last captured thumbnail or retake -->
        <div class="w-20 flex items-center justify-start">
          <div
            v-if="lastCapturedThumb"
            class="relative group cursor-pointer"
            @click="retakeLastPhoto"
            title="Click to remove and retake last shot"
          >
            <img
              :src="lastCapturedThumb"
              alt="Last captured"
              class="w-12 h-14 object-cover rounded-lg border-2 border-cyan-400 shadow-md"
            />
            <div class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
              ✕
            </div>
          </div>
          <span v-else class="text-xs text-slate-500 italic">No shots yet</span>
        </div>

        <!-- Center: Shutter Button -->
        <div class="flex flex-col items-center gap-1">
          <button
            type="button"
            class="relative w-18 h-18 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95 hover:border-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
            :disabled="cameraLoading || !!errorMessage"
            @click="capturePhoto"
            title="Capture Document Photo"
          >
            <div class="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 transition-colors flex items-center justify-center shadow-inner">
              <el-icon class="text-2xl text-white"><Camera /></el-icon>
            </div>
          </button>
          <span class="text-[11px] text-slate-400 font-medium">Capture Page</span>
        </div>

        <!-- Right: Camera Resolution & Mode Info -->
        <div class="w-20 flex flex-col items-end text-xs text-slate-400">
          <span class="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">HD 1080P</span>
          <span class="text-slate-500 text-[10px]">{{ facingMode === 'environment' ? 'Rear' : 'Front' }}</span>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  capturedCount: {
    type: Number,
    default: 0,
  },
  lastCapturedThumb: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'capture', 'retake-last']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const videoEl = ref(null);
const canvasEl = ref(null);
const stream = ref(null);
const cameraLoading = ref(false);
const errorMessage = ref('');
const facingMode = ref('environment'); // 'environment' for rear, 'user' for selfie
const hasTorch = ref(false);
const torchEnabled = ref(false);
const availableVideoDevices = ref([]);
const showFlash = ref(false);

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Camera initialization
async function initCamera() {
  errorMessage.value = '';
  cameraLoading.value = true;
  stopCamera();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    errorMessage.value = 'Camera API is not supported in this browser environment. You can upload document images directly from your device storage.';
    cameraLoading.value = false;
    return;
  }

  try {
    // Query devices to know if multiple cameras exist
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      availableVideoDevices.value = devices.filter((d) => d.kind === 'videoinput');
    } catch {
      // Ignore enumeration failure
    }

    const constraints = {
      video: {
        facingMode: { ideal: facingMode.value },
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
      },
      audio: false,
    };

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.value = mediaStream;

    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream;
      await videoEl.value.play();
    }

    // Check torch / flashlight support
    const track = mediaStream.getVideoTracks()[0];
    if (track) {
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      hasTorch.value = !!capabilities.torch;
    }

    cameraLoading.value = false;
  } catch (err) {
    console.error('Camera access error:', err);
    cameraLoading.value = false;

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMessage.value = 'Camera permission was denied. Please allow camera permissions in your browser address bar settings or upload photos using the "Add Images" button.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      errorMessage.value = 'No camera device was detected on your system. You can easily upload images from your local folders.';
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      errorMessage.value = 'Camera is already in use by another program or tab. Please close other camera apps and retry.';
    } else {
      // Fallback try with basic constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.value = fallbackStream;
        if (videoEl.value) {
          videoEl.value.srcObject = fallbackStream;
          await videoEl.value.play();
        }
        cameraLoading.value = false;
        errorMessage.value = '';
      } catch (fallbackErr) {
        errorMessage.value = 'Unable to start camera preview: ' + (err.message || 'Unknown error');
      }
    }
  }
}

// Stop camera tracks cleanly
function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }
  if (videoEl.value) {
    videoEl.value.srcObject = null;
  }
  torchEnabled.value = false;
  hasTorch.value = false;
}

// Toggle torch
async function toggleTorch() {
  if (!stream.value) return;
  const track = stream.value.getVideoTracks()[0];
  if (!track) return;

  try {
    const nextState = !torchEnabled.value;
    await track.applyConstraints({
      advanced: [{ torch: nextState }],
    });
    torchEnabled.value = nextState;
  } catch (err) {
    ElMessage.warning('Flashlight could not be activated on this device.');
  }
}

// Switch front/rear camera
async function switchCamera() {
  facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment';
  await initCamera();
}

// Take photo
function capturePhoto() {
  if (!videoEl.value || !stream.value) return;

  const video = videoEl.value;
  const canvas = canvasEl.value || document.createElement('canvas');

  const width = video.videoWidth || 1920;
  const height = video.videoHeight || 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.94);

  // Trigger visual flash
  showFlash.value = true;
  setTimeout(() => {
    showFlash.value = false;
  }, 120);

  // Optional shutter sound effect via Web Audio API synthesize beep
  playShutterSound();

  emit('capture', {
    dataUrl,
    width,
    height,
  });

  ElMessage.success({
    message: `Captured page #${props.capturedCount + 1}`,
    duration: 1500,
  });
}

function retakeLastPhoto() {
  emit('retake-last');
  ElMessage.info('Last captured photo was removed. You can now retake it.');
}

function closeScanner() {
  stopCamera();
  visible.value = false;
}

// Lightweight synthesized shutter click sound using Web Audio API
function playShutterSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    // Ignore audio context autoplay limitations
  }
}

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<style scoped>
:deep(.camera-fullscreen-dialog) {
  margin: 0 !important;
  border-radius: 0 !important;
}
:deep(.camera-fullscreen-dialog .el-dialog__header) {
  display: none !important;
}
:deep(.camera-fullscreen-dialog .el-dialog__body) {
  padding: 0 !important;
  height: 100vh !important;
  max-height: 100vh !important;
}
</style>
