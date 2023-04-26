<script setup lang="ts">

defineProps<{
    modelValue?: string | number;
    name: string;
    textarea?: boolean;
}>();

defineEmits(['update:modelValue']);
</script>

<template>
    <textarea v-if="textarea" :name="name" :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :class="`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${$attrs?.class ?? ''}`" />
    <input v-else v-bind="$attrs" :name="name"
        class="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
</template>
