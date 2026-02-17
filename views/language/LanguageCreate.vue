<script setup lang="ts">
import AdminLayout from '@admin/components/layout/DashboardLayout.vue'
import Button from '@admin/components/ui/button/Button.vue'
import Input from '@admin/components/ui/Input.vue'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import FormButtons from '@admin/components/ui/button/FormButtons.vue'
import TranslationRepeater from '../../components/TranslationRepeater.vue'
import { useRouter } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'
import { languageService, type Language, type LanguageFormData } from '../../services/languageService'

const router = useRouter()
const isSaving = ref(false)
const isLoading = ref(true)
const availableLanguages = ref<Language[]>([])
const selectedLanguages = ref<Language[]>([])

const form = reactive<LanguageFormData>({
  code: '',
  enabled: true,
  native_name: '',
  translations: {}
})

const fetchAvailableLanguages = async () => {
  try {
    isLoading.value = true
    const { data } = await languageService.getCreateData()
    availableLanguages.value = data.availableLanguages

    // Kezdetben csak az alapértelmezett (vagy első) nyelvet adjuk hozzá, ha van
    if (availableLanguages.value.length > 0) {
      const firstLang = availableLanguages.value[0]
      if (firstLang && firstLang.id) {
        handleAddLanguage(firstLang.id)
      }
    }
  } catch (error) {
    console.error('Hiba a nyelvek betöltésekor:', error)
  } finally {
    isLoading.value = false
  }
}

const handleAddLanguage = (id: number) => {
  const lang = availableLanguages.value.find(l => l.id === id)
  if (lang && !selectedLanguages.value.find(l => l.id === id)) {
    selectedLanguages.value.push(lang)
    form.translations[id] = { name: '' }
  }
}

const handleRemoveLanguage = (id: number) => {
  selectedLanguages.value = selectedLanguages.value.filter(l => l.id !== id)
  delete form.translations[id]
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    await languageService.create(form)
    router.push('/languages')
  } catch (error) {
    console.error('Hiba a nyelv létrehozásakor:', error)
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push('/languages')
}

const getTranslation = (id: number) => {
  if (!form.translations[id]) {
    form.translations[id] = { name: '' }
  }
  return form.translations[id]
}

onMounted(() => {
  fetchAvailableLanguages()
})
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between space-y-2 mb-4">
      <h2 class="text-3xl font-bold tracking-tight">Új nyelv</h2>
      <Button variant="outline" @click="goBack">Vissza</Button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      Betöltés...
    </div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Nyelv adatai</CardTitle>
        <CardDescription>Add meg az új nyelv adatait a létrehozáshoz.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="code" class="text-sm font-medium">Kód (pl. hu, en)</label>
            <Input id="code" v-model="form.code" placeholder="hu" />
          </div>
          <div class="space-y-2">
            <label for="native_name" class="text-sm font-medium">Név (saját nyelven)</label>
            <Input id="native_name" v-model="form.native_name" placeholder="Magyar" />
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="enabled" :checked="form.enabled" @update:checked="(v) => form.enabled = v" />
          <label for="enabled" class="text-sm font-medium">Engedélyezve</label>
        </div>

        <div class="space-y-4 pt-4 border-t">
          <h3 class="text-lg font-medium mb-4">Fordítások</h3>
          <TranslationRepeater
            :languages="selectedLanguages"
            :available-languages="availableLanguages"
            @add="handleAddLanguage"
            @remove="handleRemoveLanguage"
          >
            <template #default="{ language }">
              <div class="space-y-2" v-if="language.id">
                <label :for="'lang-' + language.id" class="text-sm font-medium">Név</label>
                <Input :id="'lang-' + language.id" v-model="getTranslation(language.id).name" :placeholder="language.name" />
              </div>
            </template>
          </TranslationRepeater>
        </div>
      </CardContent>
      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="goBack"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>
