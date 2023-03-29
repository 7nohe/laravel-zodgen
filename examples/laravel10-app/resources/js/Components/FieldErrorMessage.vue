<script setup lang="ts">
import { ErrorMessage } from 'vee-validate';

defineProps<{
    name: string;
}>();
</script>

<template>
    <ErrorMessage :name="name" class="text-sm text-red-600" />
</template>
