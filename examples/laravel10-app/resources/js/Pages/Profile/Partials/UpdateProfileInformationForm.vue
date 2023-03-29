<script setup lang="ts">
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Link, useForm, usePage } from '@inertiajs/vue3';
import { Form } from 'vee-validate';
import { toFormValidator } from '@vee-validate/zod';
import { ProfileUpdateRequest } from '@/schema';
import TextField from '@/Components/TextField.vue';
import FieldErrorMessage from '@/Components/FieldErrorMessage.vue';
import InputError from '@/Components/InputError.vue';

const validationSchema = toFormValidator(ProfileUpdateRequest)

defineProps<{
    mustVerifyEmail?: Boolean;
    status?: String;
}>();

const user = usePage().props.auth.user;

const form = useForm({
    name: user.name,
    email: user.email,
    age: user.age,
    height: user.height,
    bio: user.bio,
});
</script>

<template>
    <section>
        <header>
            <h2 class="text-lg font-medium text-gray-900">Profile Information</h2>

            <p class="mt-1 text-sm text-gray-600">
                Update your account's profile information and email address.
            </p>
        </header>

        <Form :validation-schema="validationSchema" @submit="form.patch(route('profile.update'))" class="mt-6 space-y-6"
            v-slot="{ values }">
            <div>
                <InputLabel for="name" value="Name" />
                <TextField name="name" id="name" type="text" class="mt-1 block w-full" v-model="form.name" required />
                <FieldErrorMessage class="mt-2" name="name" />
                <InputError class="mt-2" :message="form.errors.name" />
            </div>

            <div>
                <InputLabel for="email" value="Email" />

                <TextField name="email" id="email" type="text" class="mt-1 block w-full" v-model="form.email" required />
                <FieldErrorMessage class="mt-2" name="email" />
                <InputError class="mt-2" :message="form.errors.email" />
            </div>

            <div>
                <InputLabel for="age" value="Age" />

                <TextField name="age" id="age" type="text" class="mt-1 block w-full" v-model="form.age" />
                <FieldErrorMessage class="mt-2" name="age" />
                <InputError class="mt-2" :message="form.errors.age" />
            </div>

            <div>
                <InputLabel for="height" value="Height" />

                <TextField name="height" id="height" type="text" class="mt-1 block w-full" v-model="form.height" />
                <FieldErrorMessage class="mt-2" name="height" />
                <InputError class="mt-2" :message="form.errors.height" />
            </div>

            <div>
                <InputLabel for="bio" value="Bio" />

                <TextField name="bio" id="bio" textarea class="mt-1 block w-full" v-model="form.bio" required />
                <FieldErrorMessage class="mt-2" name="bio" />
                <InputError class="mt-2" :message="form.errors.bio" />
            </div>

            <div v-if="mustVerifyEmail && user.email_verified_at === null">
                <p class="text-sm mt-2 text-gray-800">
                    Your email address is unverified.
                    <Link :href="route('verification.send')" method="post" as="button"
                        class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Click here to re-send the verification email.
                    </Link>
                </p>

                <div v-show="status === 'verification-link-sent'" class="mt-2 font-medium text-sm text-green-600">
                    A new verification link has been sent to your email address.
                </div>
            </div>

            <div class="flex items-center gap-4">
                <PrimaryButton :disabled="form.processing">Save</PrimaryButton>

                <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" class="transition ease-in-out">
                    <p v-if="form.recentlySuccessful" class="text-sm text-gray-600">Saved.</p>
                </Transition>
            </div>
        </Form>
    </section>
</template>
