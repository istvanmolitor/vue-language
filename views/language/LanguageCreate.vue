<script setup lang="ts">
import { AdminLayout, Button, Input, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, FormButtons, InputField, Label, toastService } from '@admin'
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import TranslationRepeater from '@language/components/TranslationRepeater.vue'
import { languageService, type LanguageFormData } from '@language/services/languageService'

const router = useRouter()
const isSaving = ref(false)

const form = reactive<LanguageFormData>({
  code: '',
  enabled: true,
  native_name: '',
  translations: {}
})

const handleSubmit = async () => {
  try {
    isSaving.value = true
    const response: any = await languageService.create(form)
    toastService.success('Nyelv sikeresen létrehozva')

    const createdLanguageId = response?.data?.data?.id ?? response?.data?.id ?? response?.id

    if (createdLanguageId !== undefined && createdLanguageId !== null) {
      await router.push({
        name: 'language-edit',
        params: {
          id: String(createdLanguageId),
        },
      })

      return
    }

    router.push('/admin/language')
  } catch (error) {
    console.error('Hiba a nyelv létrehozásakor:', error)
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push('/admin/language')
}
</script>

<template>
  <AdminLayout pageTitle="Új nyelv">
    <div class="flex items-center justify-end space-y-2 mb-4">
      <Button variant="outline" @click="goBack">Vissza</Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Nyelv adatai</CardTitle>
        <CardDescription>Add meg az új nyelv adatait a létrehozáshoz.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="code">Kód (pl. hu, en)</Label>
            <Input id="code" v-model="form.code" placeholder="hu" />
          </div>
          <div class="space-y-2">
            <Label for="native_name">Név (saját nyelven)</Label>
            <Input id="native_name" v-model="form.native_name" placeholder="Magyar" />
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="enabled" v-model="form.enabled" />
          <Label for="enabled">Engedélyezve</Label>
        </div>

        <TranslationRepeater v-model="form.translations" :fields="['name']">
          <template #default="{ language, translation }">
            <InputField
              :id="`lang-${language.id}-name`"
              :label="`Név (${language.code})`"
              v-model="translation.name"
            />
          </template>
        </TranslationRepeater>
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
