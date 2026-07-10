<template>
  <div class="password-gate">
    <div class="gate-card">
      <div class="gate-icon">🔒</div>
      <h2 class="gate-title">需要密码访问</h2>
      <p class="gate-hint">请输入访问密码</p>
      <input
        v-model="input"
        type="password"
        class="gate-input"
        placeholder="请输入密码"
        @keydown.enter="check"
        ref="inputEl"
      />
      <p v-if="error" class="gate-error">密码错误，请重试</p>
      <button class="gate-btn" @click="check">进入</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const input = ref('');
const error = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{ (e: 'authed'): void }>();

// 密码哈希值（修改密码请替换此处）
// 明文：Uki_jiaqi2012
const PASSWORD_HASH = hashPwd('Uki_jiaqi2012');

function hashPwd(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

function check() {
  if (hashPwd(input.value) === PASSWORD_HASH) {
    sessionStorage.setItem('oj-notes-authed', '1');
    emit('authed');
  } else {
    error.value = true;
    input.value = '';
  }
}

onMounted(() => {
  inputEl.value?.focus();
});
</script>

<style scoped>
.password-gate {
  position: fixed;
  inset: 0;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.gate-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 40px 36px;
  width: 320px;
  text-align: center;
}

.gate-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.gate-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.gate-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.gate-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  outline: none;
  transition: border-color var(--transition);
  margin-bottom: 12px;
}

.gate-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.gate-error {
  color: var(--color-danger);
  font-size: 13px;
  margin-bottom: 12px;
}

.gate-btn {
  width: 100%;
  padding: 10px;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 500;
  transition: background var(--transition);
}

.gate-btn:hover {
  background: var(--color-primary-hover);
}
</style>
