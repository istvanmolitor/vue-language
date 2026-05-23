export type TranslationFieldValue = string | null | undefined

export type TranslationFieldMap<TField extends string> = Partial<Record<TField, TranslationFieldValue>>

export type TranslationRecordSource<TField extends string> = Record<string, TranslationFieldMap<TField> | null | undefined>

export type TranslationArrayItem<TField extends string> = {
  language_id?: number | string | null
} & TranslationFieldMap<TField>

export type TranslationSource<TField extends string> = TranslationRecordSource<TField> | Array<TranslationArrayItem<TField> | null | undefined> | null | undefined

const createEmptyTranslation = <TField extends string>(fields: readonly TField[]): Record<TField, string> => {
  return fields.reduce<Record<TField, string>>((translation, field) => {
    translation[field] = ''
    return translation
  }, {} as Record<TField, string>)
}

const normalizeLanguageId = (languageId: number | string | null | undefined): number | null => {
  const normalizedLanguageId = typeof languageId === 'number' ? languageId : Number(languageId)

  if (!Number.isFinite(normalizedLanguageId) || normalizedLanguageId <= 0) {
    return null
  }

  return normalizedLanguageId
}

const buildTranslation = <TField extends string>(
  translation: TranslationFieldMap<TField> | null | undefined,
  fields: readonly TField[],
): Record<TField, string> => {
  const emptyTranslation = createEmptyTranslation(fields)

  return fields.reduce<Record<TField, string>>((normalizedTranslation, field) => {
    normalizedTranslation[field] = translation?.[field] ?? emptyTranslation[field]
    return normalizedTranslation
  }, emptyTranslation)
}

export function normalizeTranslations<TField extends string>(
  source: TranslationSource<TField>,
  fields: readonly TField[],
): Record<number, Record<TField, string>> {
  const normalizedTranslations: Record<number, Record<TField, string>> = {}

  if (Array.isArray(source)) {
    source.forEach((translation) => {
      const languageId = normalizeLanguageId(translation?.language_id)

      if (languageId === null) {
        return
      }

      normalizedTranslations[languageId] = buildTranslation(translation, fields)
    })

    return normalizedTranslations
  }

  Object.entries(source ?? {}).forEach(([languageIdKey, translation]) => {
    const languageId = normalizeLanguageId(languageIdKey)

    if (languageId === null) {
      return
    }

    normalizedTranslations[languageId] = buildTranslation(translation, fields)
  })

  return normalizedTranslations
}


