<template>
  <el-card
    class="relative group !p-0 overflow-hidden transition-all duration-300 hover:shadow-lg border border-slate-200"
    :body-style="{ padding: '0px' }"
    draggable="true"
    @dragstart="$emit('drag-start', index)"
    @dragover.prevent
    @dragenter.prevent
    @drop="$emit('drop-item', index)"
  >
    <!-- Page Index Badge -->
    <div class="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-white text-xs font-semibold shadow-sm">
      <el-icon class="text-cyan-400"><Document /></el-icon>
      <span>Page {{ index + 1 }}</span>
    </div>

    <!-- Filter or status tag -->
    <div v-if="image.filter && image.filter !== 'original'" class="absolute top-2.5 right-2.5 z-10">
      <el-tag size="small" effect="dark" type="warning" class="!text-[10px] !h-5 !px-1.5 capitalize">
        {{ image.filter }}
      </el-tag>
    </div>

    <!-- Thumbnail Image Container -->
    <div
      class="relative aspect-[3/4] bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
      @click="$emit('preview', index)"
    >
      <img
        :src="image.dataUrl"
        :alt="`Scanned document page ${index + 1}`"
        class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      />

      <!-- Hover Quick Overlay -->
      <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        <el-button circle size="small" type="primary" @click.stop="$emit('preview', index)" title="Full preview">
          <el-icon><ZoomIn /></el-icon>
        </el-button>
        <el-button circle size="small" type="success" @click.stop="$emit('crop', index)" title="Crop & Enhance">
          <el-icon><Scissor /></el-icon>
        </el-button>
        <el-button circle size="small" type="info" @click.stop="$emit('rotate', index)" title="Rotate 90°">
          <el-icon><RefreshRight /></el-icon>
        </el-button>
      </div>

      <!-- Drag Handle Icon in background -->
      <div class="absolute bottom-2 left-2 text-slate-400 opacity-60 text-xs pointer-events-none flex items-center gap-1 bg-white/70 backdrop-blur-xs px-1.5 py-0.5 rounded">
        <el-icon><Rank /></el-icon>
        <span class="text-[10px]">Drag to order</span>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-1">
      <!-- Order controls (Move Left / Right) -->
      <div class="flex items-center gap-0.5">
        <el-tooltip content="Move Page Left" placement="bottom">
          <el-button
            size="small"
            circle
            :disabled="index === 0"
            @click="$emit('move-left', index)"
          >
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="Move Page Right" placement="bottom">
          <el-button
            size="small"
            circle
            :disabled="index === total - 1"
            @click="$emit('move-right', index)"
          >
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </el-tooltip>
      </div>

      <!-- Action Tools: Rotate, Crop, Delete -->
      <div class="flex items-center gap-1">
        <el-tooltip content="Rotate 90°" placement="bottom">
          <el-button size="small" circle @click="$emit('rotate', index)">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="Crop & Filter" placement="bottom">
          <el-button size="small" circle type="primary" plain @click="$emit('crop', index)">
            <el-icon><Scissor /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="Delete Page" placement="bottom">
          <el-popconfirm
            title="Delete this scanned page?"
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            confirm-button-type="danger"
            @confirm="$emit('delete', index)"
          >
            <template #reference>
              <el-button size="small" circle type="danger" plain>
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-popconfirm>
        </el-tooltip>
      </div>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  image: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

defineEmits([
  'preview',
  'crop',
  'rotate',
  'delete',
  'move-left',
  'move-right',
  'drag-start',
  'drop-item',
]);
</script>
