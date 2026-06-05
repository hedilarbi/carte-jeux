"use client";

import { useId, useState } from "react";
import PhoneInput, { type Value } from "react-phone-number-input";
import frLabels from "react-phone-number-input/locale/fr.json";

type PhoneNumberFieldProps = {
  defaultValue?: string;
  label?: string;
  name?: string;
  required?: boolean;
};

export function PhoneNumberField({
  defaultValue,
  label = "Numéro de téléphone",
  name = "phone",
  required = true,
}: PhoneNumberFieldProps) {
  const inputId = useId();
  const [value, setValue] = useState<Value | undefined>(
    defaultValue ? (defaultValue as Value) : undefined,
  );

  return (
    <label className="grid gap-2 text-sm font-bold text-[#012D69]" htmlFor={inputId}>
      {label}
      <PhoneInput
        className="auth-phone-input"
        countryCallingCodeEditable={false}
        defaultCountry="TN"
        id={inputId}
        international
        labels={frLabels}
        onChange={setValue}
        placeholder="XX XXX XXX"
        required={required}
        value={value}
      />
      <input name={name} type="hidden" value={value ?? ""} />
    </label>
  );
}
