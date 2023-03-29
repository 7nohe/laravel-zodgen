<script setup lang="ts">
import { Field } from 'vee-validate';

defineProps<{
    modelValue?: string | number;
    name: string;
    textarea?: boolean;
}>();

defineEmits(['update:modelValue']);
</script>

<template>
    <Field v-if="textarea" :name="name" v-slot="{ field }" :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)">
        <textarea v-bind="field"
            :class="`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${$attrs?.class ?? ''}`" />
    </Field>
    <Field v-else v-bind="$attrs" :name="name"
        class="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
</template>
