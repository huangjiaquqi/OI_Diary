<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal" style="max-width: 380px">
      <div class="modal-body confirm-dialog">
        <p>{{ message }}</p>
        <div class="confirm-actions">
          <button class="btn-secondary" @click="$emit('cancel')">取消</button>
          <button class="btn-danger" @click="$emit('confirm')">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  message: string;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>