<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Select from '@admin/components/ui/Select.vue'
import { languageService, type Language } from '../services/languageService'

const props = withDefaults(defineProps<{
  modelValue?: number | null
  errors?: string | string[] | null
  label?: string
  clearable?: boolean
}>(), {
  label: 'Nyelv',
  clearable: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

const languages = ref<Language[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const { data } = await languageService.getForSelect()
    languages.value = data.data
    if (props.modelValue == null && languages.value.length > 0) {
      emit('update:modelValue', languages.value[0].id ?? null)
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
    <Select
      v-if="!isLoading"
      :model-value="modelValue"
      :options="languages"
      label-field="name"
      value-field="id"
      placeholder="Válassz nyelvet..."
      :clearable="clearable"
      @update:model-value="emit('update:modelValue', $event as number | null)"
    />
    <div v-else class="text-sm text-[--color-muted-foreground]">
      Nyelvek betöltése...
    </div>
</template>
