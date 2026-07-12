<script setup lang="ts">
import { AdminLayout, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CheckboxField, FormButtons, InputField, toastService } from '@admin'
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
        <InputField id="code" label="Kód (pl. hu, en)" v-model="form.code" placeholder="hu" />
        <InputField id="native_name" label="Név (saját nyelven)" v-model="form.native_name" placeholder="Magyar" />
        <CheckboxField id="enabled" label="Engedélyezve" v-model="form.enabled" />

        <TranslationRepeater v-model="form.translations" #default="{ language, translation }" :fields="['name']">
          <InputField
            :id="`lang-${language.id}-name`"
            :label="`Név (${language.code})`"
            v-model="translation.name"
          />
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
