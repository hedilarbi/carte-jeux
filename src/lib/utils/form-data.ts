export function getFormDataString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

export function getFormDataStrings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getFormDataNumber(formData: FormData, key: string) {
  const value = getFormDataString(formData, key);

  if (value === undefined) {
    return undefined;
  }

  return Number(value);
}

export function getFormDataBoolean(
  formData: FormData,
  key: string,
  defaultValue = false,
) {
  const value = getFormDataString(formData, key);

  if (value === undefined) {
    return defaultValue;
  }

  return ["1", "true", "on", "yes"].includes(value.toLowerCase());
}

export function getOptionalFormDataBoolean(formData: FormData, key: string) {
  const value = getFormDataString(formData, key);

  if (value === undefined) {
    return undefined;
  }

  return ["1", "true", "on", "yes"].includes(value.toLowerCase());
}

export function getFormDataFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value === "string" || !value || value.size === 0) {
    return undefined;
  }

  return value;
}

export function getFormDataFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => typeof value !== "string" && value.size > 0);
}
