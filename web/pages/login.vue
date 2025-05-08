<script lang="ts" setup>
import { pb } from "~/utils/pb";
import { onMounted, reactive } from "vue";
import { navigateTo } from "#app";
import { useToast } from "#imports";

const state = reactive({
  email: "",
  password: "",
});

const isAuthorized = defineModel("isAuthorized", {
  type: Boolean,
  default: false,
});

function setAuthorized(value: boolean) {
  if (!value) {
    pb.authStore.clear();
  }
  isAuthorized.value = value;
}

const toast = useToast();

const onSubmit = async (e: Event) => {
  if (!state.email || !state.password) {
    toast.add({
      title: "Error",
      description: "Invalid email or password",
      color: "error",
    });
    return;
  }

  try {
    await pb
      .collection("_superusers")
      .authWithPassword(state.email, state.password);
    setAuthorized(true);
    if (pb.authStore.isValid) {
      await navigateTo({ name: "index" });
    }
  } catch (error) {
    console.error(error);
  }
};

const onLogout = async () => {
  setAuthorized(false);
  await navigateTo({ name: "login" });
};

onMounted(() => {
  if (pb.authStore.isValid) {
    setAuthorized(true);
  }
});
</script>

<template>
  <UForm :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormField>

    <UButton type="submit"> Submit </UButton>
  </UForm>
</template>
