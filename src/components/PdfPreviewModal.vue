<template>
  <el-dialog
    v-model="visible"
    title="PDF Document Preview"
    width="90%"
    class="max-w-5xl pdf-preview-dialog"
    destroy-on-close
    @closed="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Top Action & Info Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <!-- Filename Input -->
        <div class="flex items-center gap-2 flex-1 max-w-md">
          <span class="text-xs font-semibold text-slate-500 whitespace-nowrap">File Name:</span>
          <el-input
            v-model="filename"
            placeholder="document"
            size="default"
            class="flex-1"
          >
            <template #append>.pdf</template>
          </el-input>
        </div>

        <!-- Document stats badge -->
        <div class="flex items-center gap-2">
          <el-tag type="info" effect="plain" class="!font-medium">
            <el-icon class="mr-1"><Document /></el-icon>
            {{ pageCount }} {{ pageCount === 1 ? 'Page' : 'Pages' }}
          </el-tag>
          <el-tag type="success" effect="plain" class="!font-medium">
            {{ formatFileSize(pdfBlob?.size || 0) }}
          </el-tag>
        </div>

        <!-- Action buttons: Print & Download -->
        <div class="flex items-center gap-2">
          <el-button type="info" plain @click="handlePrint">
            <el-icon class="mr-1.5"><Printer /></el-icon>
            Print
          </el-button>

          <el-button type="primary" @click="handleDownload">
            <el-icon class="mr-1.5"><Download /></el-icon>
            Download PDF
          </el-button>
        </div>
      </div>

      <!-- PDF Preview Container -->
      <div class="relative w-full h-[65vh] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center">
        <!-- PDF Iframe preview -->
        <iframe
          v-if="pdfUrl"
          :src="pdfUrl"
          class="w-full h-full border-0 bg-white"
          title="Generated PDF Preview"
        ></iframe>

        <div v-else class="text-white flex flex-col items-center gap-2">
          <el-icon class="is-loading text-3xl"><Loading /></el-icon>
          <span class="text-sm">Rendering PDF preview...</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-400">
          Generated entirely client-side using jsPDF in your browser.
        </span>
        <div class="flex items-center gap-2">
          <el-button @click="visible = false">Close</el-button>
          <el-button type="primary" @click="handleDownload">
            <el-icon class="mr-1"><Download /></el-icon>
            Download PDF
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { downloadPdfBlob, printPdf } from '../utils/pdfGenerator.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  pdfBlob: {
    type: [Blob, Object],
    default: null,
  },
  pdfUrl: {
    type: String,
    default: '',
  },
  pageCount: {
    type: Number,
    default: 0,
  },
  defaultFilename: {
    type: String,
    default: 'DocScanner_Document',
  },
});

const emit = defineEmits(['update:modelValue']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const filename = ref(props.defaultFilename);

watch(
  () => props.defaultFilename,
  (val) => {
    if (val) filename.value = val;
  }
);

function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function handleDownload() {
  if (!props.pdfBlob) return;
  const name = filename.value.trim() || 'DocScanner_Document';
  downloadPdfBlob(props.pdfBlob, name);
  ElMessage.success(`Downloaded "${name}.pdf" successfully!`);
}

function handlePrint() {
  if (!props.pdfBlob && !props.pdfUrl) return;
  printPdf(props.pdfBlob || props.pdfUrl);
}

function handleClose() {
  // Let parent handle any cleanup if needed
}
</script>

<style scoped>
:deep(.pdf-preview-dialog .el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
