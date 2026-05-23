<script setup lang="ts">
import { computed } from 'vue'
import Select from '@admin/components/ui/Select.vue'
import type { SelectOption } from '@admin'

interface LanguageLike {
  id?: number | string
  code: string
  name?: string
}

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  languages?: LanguageLike[]
  options?: SelectOption[]
  placeholder?: string
}>(), {
  languages: () => [],
  options: () => [],
  placeholder: 'Válassz nyelvet...'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const normalizedOptions = computed<SelectOption[]>(() => {
  if (props.options.length > 0) {
    return props.options
  }

  return props.languages
    .filter((language) => language.id !== undefined && language.id !== null)
    .map((language) => ({
      value: language.id as number | string,
      label: language.name ? `${language.name} (${language.code})` : language.code,
    }))
})

const handleUpdate = (value: string | number) => {
  const selectedOption = normalizedOptions.value.find((option) => String(option.value) === String(value))

  emit('update:modelValue', selectedOption?.value ?? null)
}
</script>

<template>
  <Select
    :model-value="modelValue ?? ''"
    :options="normalizedOptions"
    :placeholder="placeholder"
    @update:model-value="handleUpdate"
  />
</template>


