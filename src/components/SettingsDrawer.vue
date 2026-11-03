<template>
  <el-drawer
    v-model="visible"
    title="PDF & Scanner Settings"
    direction="rtl"
    size="360px"
  >
    <div class="flex flex-col gap-6 py-2">
      <!-- Section: Page Setup -->
      <div class="flex flex-col gap-3">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Page Format</h4>
        
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Page Size</label>
          <el-select v-model="settings.pageSize" class="w-full">
            <el-option label="A4 (210 × 297 mm)" value="a4" />
            <el-option label="US Letter (8.5 × 11 in)" value="letter" />
            <el-option label="US Legal (8.5 × 14 in)" value="legal" />
          </el-select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700">Page Orientation</label>
          <el-radio-group v-model="settings.orientation" class="w-full" size="default">
            <el-radio-button label="portrait">Portrait</el-radio-button>
            <el-radio-button label="landscape">Landscape</el-radio-button>
            <el-radio-button label="auto">Auto</el-radio-button>
          </el-radio-group>
          <span class="text-[11px] text-slate-500">
            "Auto" matches each page to the document image's aspect ratio.
          </span>
        </div>
      </div>

      <el-divider class="!my-0" />

      <!-- Section: Margin -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Page Margins</h4>
          <span class="text-xs font-medium text-blue-600">{{ settings.margin }} mm</span>
        </div>

        <el-slider
          v-model="settings.margin"
          :min="0"
          :max="25"
          :step="1"
          :marks="{ 0: '0', 5: '5mm', 10: '10mm', 15: '15mm', 20: '20mm' }"
        />
        <div class="flex items-center gap-1.5 mt-2">
          <el-button size="small" :type="settings.margin === 0 ? 'primary' : 'info'" plain @click="settings.margin = 0">None</el-button>
          <el-button size="small" :type="settings.margin === 5 ? 'primary' : 'info'" plain @click="settings.margin = 5">5 mm</el-button>
          <el-button size="small" :type="settings.margin === 10 ? 'primary' : 'info'" plain @click="settings.margin = 10">10 mm</el-button>
          <el-button size="small" :type="settings.margin === 15 ? 'primary' : 'info'" plain @click="settings.margin = 15">15 mm</el-button>
        </div>
      </div>

      <el-divider class="!my-0" />

      <!-- Section: Output Quality -->
      <div class="flex flex-col gap-3">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">PDF Quality & Compression</h4>

        <el-radio-group v-model="settings.quality" class="w-full" size="default">
          <el-radio-button label="low">Low (Fast)</el-radio-button>
          <el-radio-button label="medium">Medium</el-radio-button>
          <el-radio-button label="high">High (Crisp)</el-radio-button>
        </el-radio-group>

        <p class="text-[11px] text-slate-500">
          High quality maintains maximum readability for scanned fine print and receipts.
        </p>
      </div>

      <el-divider class="!my-0" />

      <!-- Reset button -->
      <div class="pt-2">
        <el-button class="w-full" @click="resetToDefaults">
          Reset to Defaults
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  settings: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'reset']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

function resetToDefaults() {
  emit('reset');
}
</script>
