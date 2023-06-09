<script setup lang="ts">
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Link, usePage } from '@inertiajs/vue3';
import { ProfileUpdateRequest } from '@/schema';
import TextField from '@/Components/TextField.vue';
import InputError from '@/Components/InputError.vue';
import { useZodForm } from '@inertia-vue-form/zod';

defineProps<{
    mustVerifyEmail?: Boolean;
    status?: String;
}>();

const user = usePage().props.auth.user;


const form = useZodForm({
    name: user.name,
    email: user.email,
    age: user.age,
    height: user.height,
    bio: user.bio,
    address: user.address ?? [{ city: '', country: '' }, { city: '', country: '', }],
}, ProfileUpdateRequest);

function submit() {
    form.patch(route('profile.update'))
}
</script>

<template>
    <section>
        <header>
            <h2 class="text-lg font-medium text-gray-900">Profile Information</h2>

            <p class="mt-1 text-sm text-gray-600">
                Update your account's profile information and email address.
            </p>
        </header>

        <form @submit.prevent="submit">
            <div>
                <InputLabel for="name" value="Name" />
                <TextField name="name" id="name" type="text" class="mt-1 block w-full" v-model="form.name" required />
                <InputError class="mt-2" :message="form.errors.name" />
            </div>

            <div>
                <InputLabel for="email" value="Email" />

                <TextField name="email" id="email" type="text" class="mt-1 block w-full" v-model="form.email" required />
                <InputError class="mt-2" :message="form.errors.email" />
            </div>

            <div>
                <InputLabel for="age" value="Age" />

                <TextField name="age" id="age" type="text" class="mt-1 block w-full" v-model="form.age" />
                <InputError class="mt-2" :message="form.errors.age" />
            </div>

            <div>
                <InputLabel for="height" value="Height" />

                <TextField name="height" id="height" type="text" class="mt-1 block w-full" v-model="form.height" />
                <InputError class="mt-2" :message="form.errors.height" />
            </div>


            <div>
                <InputLabel for="address.0.country" value="Country 1" />

                <TextField name="address.0.country" id="address.0.country" type="text" class="mt-1 block w-full"
                    :model-value="form.address[0].country"
                    @update:model-value="(value) => form.address[0].country = value" />
                <InputError class="mt-2" :message="form.errors['address.0.country']" />
            </div>
            <div>
                <InputLabel for="address.0.city" value="City 1" />

                <TextField name="address.0.city" id="address.0.city" type="text" class="mt-1 block w-full"
                    :model-value="form.address[0].city" @update:model-value="(value) => form.address[0].city = value" />
                <InputError class="mt-2" :message="form.errors['address.0.city']" />
            </div>

            <div>
                <InputLabel for="address.1..country" value="Country 2" />

                <TextField name="address.1.country" id="address.1.country" type="text" class="mt-1 block w-full"
                    :model-value="form.address[1].country"
                    @update:model-value="(value) => form.address[1].country = value" />
                <InputError class="mt-2" :message="form.errors['address.1.country']" />
            </div>
            <div>
                <InputLabel for="address.1.city" value="City 2" />

                <TextField name="address.1.city" id="address.1.city" type="text" class="mt-1 block w-full"
                    :model-value="form.address[1].city" @update:model-value="(value) => form.address[1].city = value" />
                <InputError class="mt-2" :message="form.errors['address.1.city']" />
            </div>

            <div>
                <InputLabel for="bio" value="Bio" />

                <TextField name="bio" id="bio" textarea class="mt-1 block w-full" v-model="form.bio" required />
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
        </form>
    </section>
</template>
