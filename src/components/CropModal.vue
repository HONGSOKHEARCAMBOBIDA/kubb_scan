<template>
  <el-dialog
    v-model="visible"
    title="Crop & Enhance Document"
    width="90%"
    class="max-w-4xl"
    destroy-on-close
    @opened="initCropper"
    @closed="destroyCropper"
  >
    <div class="flex flex-col gap-4">
      <!-- Cropper Image Viewport -->
      <div class="relative w-full h-[55vh] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700 shadow-inner">
        <img
          ref="imageRef"
          :src="imageSrc"
          alt="To crop"
          class="max-w-full max-h-full block object-contain"
        />

        <div v-if="processing" class="absolute inset-0 bg-slate-900/75 flex flex-col items-center justify-center z-10 text-white gap-2">
          <el-icon class="is-loading text-3xl text-cyan-400"><Loading /></el-icon>
          <span class="text-sm font-medium">Processing image...</span>
        </div>
      </div>

      <!-- Toolbar: Aspect Ratio & Transform Controls -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <!-- Aspect Ratio presets -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ratio:</span>
          <el-radio-group v-model="selectedRatio" size="small" @change="changeRatio">
            <el-radio-button label="free">Free</el-radio-button>
            <el-radio-button label="a4">A4 Doc</el-radio-button>
            <el-radio-button label="4:3">4:3</el-radio-button>
            <el-radio-button label="1:1">1:1</el-radio-button>
          </el-radio-group>
        </div>

        <!-- Rotate & Zoom tools -->
        <div class="flex items-center gap-1.5">
          <el-tooltip content="Rotate 90° Counter-Clockwise" placement="top">
            <el-button size="small" circle @click="rotate(-90)">
              <el-icon><RefreshLeft /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="Rotate 90° Clockwise" placement="top">
            <el-button size="small" circle @click="rotate(90)">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="Zoom In" placement="top">
            <el-button size="small" circle @click="zoom(0.1)">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="Zoom Out" placement="top">
            <el-button size="small" circle @click="zoom(-0.1)">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="Reset Crop" placement="top">
            <el-button size="small" @click="resetCrop">
              Reset
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- Document Enhancement Filters (CamScanner features) -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 py-2.5 bg-blue-50/60 border border-blue-100 rounded-xl">
        <div class="flex items-center gap-2">
          <el-icon class="text-blue-600"><MagicStick /></el-icon>
          <span class="text-xs font-semibold text-blue-900 uppercase tracking-wider">Document Filter:</span>
        </div>

        <el-radio-group v-model="selectedFilter" size="small">
          <el-radio-button label="original">Original</el-radio-button>
          <el-radio-button label="magic">✨ Magic Color</el-radio-button>
          <el-radio-button label="bw">B&W Scanned</el-radio-button>
          <el-radio-button label="grayscale">Grayscale</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-500">
          Tip: Drag the corner points to crop document margins precisely.
        </span>
        <div class="flex items-center gap-2">
          <el-button @click="visible = false">Cancel</el-button>
          <el-button type="primary" :loading="processing" @click="applyCrop">
            Save Crop & Enhancements
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import Cropper from 'cropperjs';
import { applyImageFilter } from '../utils/imageUtils.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  imageSrc: {
    type: String,
    default: '',
  },
  initialFilter: {
    type: String,
    default: 'original',
  },
});

const emit = defineEmits(['update:modelValue', 'save']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const imageRef = ref(null);
let cropperInstance = null;
const selectedRatio = ref('free');
const selectedFilter = ref('original');
const processing = ref(false);

function initCropper() {
  selectedFilter.value = props.initialFilter || 'original';
  selectedRatio.value = 'free';

  nextTick(() => {
    if (!imageRef.value) return;
    destroyCropper();

    cropperInstance = new Cropper(imageRef.value, {
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.95,
      restore: false,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      responsive: true,
      ready() {
        // Ready
      },
    });
  });
}

function destroyCropper() {
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
}

function changeRatio(val) {
  if (!cropperInstance) return;
  if (val === 'free') {
    cropperInstance.setAspectRatio(NaN);
  } else if (val === 'a4') {
    cropperInstance.setAspectRatio(210 / 297);
  } else if (val === '4:3') {
    cropperInstance.setAspectRatio(4 / 3);
  } else if (val === '1:1') {
    cropperInstance.setAspectRatio(1);
  }
}

function rotate(deg) {
  if (cropperInstance) {
    cropperInstance.rotate(deg);
  }
}

function zoom(ratio) {
  if (cropperInstance) {
    cropperInstance.zoom(ratio);
  }
}

function resetCrop() {
  if (cropperInstance) {
    cropperInstance.reset();
  }
}

async function applyCrop() {
  if (!cropperInstance) return;
  processing.value = true;

  try {
    // Get cropped canvas with high quality
    const croppedCanvas = cropperInstance.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    if (!croppedCanvas) {
      throw new Error('Could not crop canvas');
    }

    let croppedDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.94);

    // Apply filter if selected
    if (selectedFilter.value !== 'original') {
      croppedDataUrl = await applyImageFilter(croppedDataUrl, selectedFilter.value, 0.94);
    }

    emit('save', {
      dataUrl: croppedDataUrl,
      filter: selectedFilter.value,
    });

    visible.value = false;
  } catch (err) {
    console.error('Failed to crop image:', err);
  } finally {
    processing.value = false;
  }
}
</script>
