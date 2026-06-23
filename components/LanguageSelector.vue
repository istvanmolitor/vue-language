<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import Modal from '@admin/components/ui/Modal.vue'
import LoadingSpinner from '@admin/components/ui/LoadingSpinner.vue'
import Icon from '@admin/components/ui/Icon.vue'
import { languageService, type Language } from '../services/languageService'

interface Props {
  id?: string
  modelValue?: number | null
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  emptyValue?: number | null
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  modelValue: null,
  placeholder: 'Válassz nyelvet...',
  searchPlaceholder: 'Keresés kód alapján...',
  emptyMessage: 'Nincs találat.',
  emptyValue: null,
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

interface LanguageDisplayItem {
  id: number
  code: string
  name: string
  isEnabled: boolean
  searchText: string
}

const isModalOpen = ref(false)
const isLoading = ref(false)
const search = ref('')
const includeDisabled = ref(false)
const languages = ref<Language[]>([])
const selectedLanguageData = ref<Language | null>(null)
const modalPerPage = 500
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let languagesRequestId = 0
let selectedLanguageRequestId = 0

const clearSearchTimeout = (): void => {
  if (searchTimeout !== null) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
}

const normalizeLanguage = (language: Language | null): LanguageDisplayItem | null => {
  if (language === null || language.id === undefined) {
    return null
  }

  const code = String(language.code ?? '').trim()
  const name = String(language.name ?? '').trim()

  return {
    id: language.id,
    code: code.length > 0 ? code : '-',
    name: name.length > 0 ? name : `#${language.id}`,
    isEnabled: language.enabled ?? false,
    searchText: `${code} ${name}`.toLowerCase(),
  }
}

const isEmptySelection = (value: number | null | undefined): boolean => {
  return value === null || value === props.emptyValue
}

const normalizedLanguages = computed(() => {
  return languages.value
    .map((language) => normalizeLanguage(language))
    .filter((language): language is LanguageDisplayItem => language !== null)
})

const selectedLanguage = computed(() => {
  if (props.modelValue === null || props.modelValue === props.emptyValue) {
    return null
  }

  return normalizeLanguage(
    selectedLanguageData.value ??
      languages.value.find((language) => language.id === props.modelValue) ??
      null,
  )
})

const setLanguages = (items: Language[]): void => {
  languages.value = items.map((language) => ({ ...language }))
}

const fetchLanguages = async (query: string): Promise<void> => {
  const requestId = ++languagesRequestId
  isLoading.value = true

  try {
    const params: Record<string, string | number | boolean | undefined> = {
      search: query.trim().length > 0 ? query.trim() : undefined,
      per_page: modalPerPage,
      include_disabled: includeDisabled.value,
    }

    const response = await languageService.searchForSelect(params)

    if (requestId !== languagesRequestId) {
      return
    }

    setLanguages(response.data.data ?? [])
  } finally {
    if (requestId === languagesRequestId) {
      isLoading.value = false
    }
  }
}

const fetchSelectedLanguage = async (languageId: number): Promise<void> => {
  const requestId = ++selectedLanguageRequestId
  const existingLanguage = languages.value.find((language) => language.id === languageId)

  if (existingLanguage) {
    selectedLanguageData.value = existingLanguage
    return
  }

  try {
    const response = await languageService.getById(languageId)

    if (requestId !== selectedLanguageRequestId) {
      return
    }

    selectedLanguageData.value = response.data.data
  } catch {
    if (requestId === selectedLanguageRequestId) {
      selectedLanguageData.value = null
    }
  }
}


watch(
  () => props.modelValue,
  (value) => {
    if (value === null || value === props.emptyValue) {
      selectedLanguageData.value = null
      return
    }

    void fetchSelectedLanguage(value)
  },
  { immediate: true },
)

watch(search, () => {
  if (!isModalOpen.value) {
    return
  }

  clearSearchTimeout()

  searchTimeout = setTimeout(() => {
    void fetchLanguages(search.value)
  }, 300)
})

watch(includeDisabled, () => {
  if (!isModalOpen.value) {
    return
  }

  clearSearchTimeout()
  void fetchLanguages(search.value)
})

onBeforeUnmount(() => {
  clearSearchTimeout()
})

const selectLanguage = (languageId: number): void => {
  emit('update:modelValue', languageId)
  selectedLanguageData.value = languages.value.find((language) => language.id === languageId) ?? selectedLanguageData.value
  isModalOpen.value = false
  search.value = ''
}

const openModal = (): void => {
  if (props.disabled) {
    return
  }

  isModalOpen.value = true
  clearSearchTimeout()
  void fetchLanguages(search.value)
}

const closeModal = (): void => {
  isModalOpen.value = false
  search.value = ''
  includeDisabled.value = false
  clearSearchTimeout()
}

const clearSelection = (): void => {
  emit('update:modelValue', props.emptyValue)
  selectedLanguageData.value = null
}
</script>

<template>
  <div>
    <button
      type="button"
      :id="id"
      :disabled="disabled"
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      @click="openModal"
    >
      <span v-if="selectedLanguage" class="truncate">
        {{ selectedLanguage.name }} ({{ selectedLanguage.code }})
      </span>
      <span v-else class="truncate text-muted-foreground">{{ placeholder }}</span>
      <span class="ml-2 shrink-0 text-xs text-muted-foreground">Választás</span>
    </button>

    <input
      v-if="required"
      type="text"
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none absolute h-0 w-0 opacity-0"
      :value="modelValue ?? ''"
      required
    />

    <Modal :show="isModalOpen" title="Nyelv kiválasztása" @close="closeModal">
      <div class="space-y-3">
        <input
          v-model="search"
          type="text"
          autofocus
          class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          :placeholder="searchPlaceholder"
        />

        <div class="flex items-center gap-2">
          <Checkbox id="language_selector_include_disabled" v-model="includeDisabled" />
          <label for="language_selector_include_disabled" class="cursor-pointer text-sm text-foreground">
            Összes nyelv mutatása
          </label>
        </div>

        <div class="max-h-96 overflow-y-auto rounded-md border p-1">
          <div v-if="isLoading" class="px-3 py-2 text-sm text-muted-foreground"><LoadingSpinner label="Betöltés..." /></div>

          <div v-else-if="normalizedLanguages.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
            {{ emptyMessage }}
          </div>

          <button
            v-for="language in normalizedLanguages"
            :key="language.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            :class="{ 'bg-accent text-accent-foreground': modelValue === language.id }"
            @click="selectLanguage(language.id)"
          >
             <span class="min-w-0 flex-1">
               <span class="block truncate font-medium">{{ language.name }}</span>
               <span class="block truncate text-xs text-muted-foreground">
                 {{ language.code }}
                 <span v-if="!language.isEnabled">- Letiltva</span>
               </span>
             </span>

             <Icon v-if="modelValue === language.id" name="check" class="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          @click="closeModal"
        >
          Mégse
        </button>
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          @click="clearSelection"
        >
          Kiválasztás törlése
        </button>
      </template>
    </Modal>
  </div>
</template>

