<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <div class="empty-text">{{ message }}</div>
    <div class="empty-hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    message?: string;
    hint?: string;
  }>(),
  {
    icon: '📭',
    message: '暂无数据',
    hint: '点击左侧 "+" 按钮导入数据',
  }
);
</script>