<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { AuthService } from "../../../service/AuthService.js";
import { formValidation, showToast } from "../../../utils/Helper.js";
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false); // 🔄 loader flag

const forgetpassword = () => {
  router.push({ name: 'forgetPassword' });
};

const loginHandler = async () => {
  const fromValues = {
    email: email.value,
    password: password.value,
  };

  const validation = formValidation(fromValues);
  if (validation !== true) {
    showToast(toast, "error", "Error", validation);
    email.value = "";
    password.value = "";
    return;
  }

  isLoading.value = true;
  try {
    const loginUserDetails = await AuthService.login(fromValues);
    if (loginUserDetails.error) {
      showToast(toast, "error", "Error", loginUserDetails.error);
      email.value = "";
      password.value = "";
    } else {
      authStore.setUserLoginDetail(loginUserDetails);
      router.push({ name: 'homeDash' });
    }
  } catch (err) {
    showToast(toast, "error", "Error", "An unexpected error occurred.");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen w-full overflow-hidden px-4">
    <div class="w-full max-w-3xl">
      <div
        class="rounded-[56px] p-[0.3rem] w-full"
        style="background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)"
      >
        <div class="bg-surface-0 dark:bg-surface-900 rounded-[53px] py-12 px-6 sm:px-12 md:px-20">
          <div class="text-center mb-8">
            <h1 class="text-muted-color font-medium text-2xl sm:text-3xl">Sign In</h1>
          </div>

          <Toast />

          <div>
            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-base sm:text-lg font-medium mb-2">Email</label>
            <InputText id="email1" v-model="email" type="text" placeholder="Email address" class="w-full mb-6" />

            <label for="password1" class="block text-surface-900 dark:text-surface-0 text-base sm:text-lg font-medium mb-2">Password</label>
            <Password
              id="password1"
              v-model="password"
              placeholder="Password"
              :toggleMask="true"
              class="w-full mb-4"
              fluid
              :feedback="false"
            />

            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 mb-6 gap-2">
              <!-- <div class="flex items-center">
                <Checkbox v-model="rememberMe" id="rememberme1" binary class="mr-2"></Checkbox>
                <label for="rememberme1">Remember me</label>
              </div> -->
              <!-- <span class="font-medium text-sm sm:text-base text-primary cursor-pointer ml-auto" @click="forgetpassword">
                Forgot password?
              </span> -->
            </div>

            <Button
              type="button"
              :label="isLoading ? 'Signing In...' : 'Sign In'"
              @click="loginHandler"
              :disabled="isLoading"
              class="w-full flex justify-center items-center gap-2"
            >
              <i v-if="isLoading" class="pi pi-spinner pi-spin"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi-eye,
.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}
</style>
