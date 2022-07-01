<template>
  <div class="login-container">
    <div class="login-form-container">
      <div
        v-loading="isLoading"
        element-loading-background="rgba(238, 238, 238, 0.7)"
      >
        <div class="title-container mb-5">
          <h3 class="title text-center">
            {{ isEmailCode ? "Email Auth" : "Login" }}
          </h3>
        </div>
        <div class="form-div">
          <LoginVue
            id="login"
            @setLoading="setLoading"
            @setEmailAuth="setEmailAuth"
            :isLoading="isLoading"
          />
          <EmailAuthVue
            id="email"
            :userMail="userMail"
            :isEmailCode="isEmailCode"
            @setLoading="setLoading"
          />
        </div>
        <p v-if="!isEmailCode" class="text-center text-muted mb-0">
          계정이 없으신가요?
          <span
            @click="goPage('Resister')"
            class="text-primary fw-semibold btn-text"
            >회원가입</span
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import LoginVue from "./Login.vue";
import EmailAuthVue from "../components/EmailAuth/EmailAuth.vue";
import gsap from "gsap";

export default defineComponent({
  components: {
    LoginVue,
    EmailAuthVue,
  },
  setup() {
    const router = useRouter();
    const isLoading = ref<boolean>(false);

    // 페이지 이동
    function goPage(data: string) {
      router.push({
        name: data,
      });
    }

    // 로딩 스피너
    function setLoading(data: boolean) {
      isLoading.value = data;
    }

    // 이메일 인증 열기
    const isEmailCode = ref(false);
    const userMail = ref<string>("");
    function setEmailAuth(data: boolean, email: string) {
      gsap.to("#login", { duration: 0, opacity: 0, display: "none" });
      gsap.from("#email", {
        duration: 1.5,
        x: 40,
        opacity: 100,
      });
      userMail.value = email;
      isEmailCode.value = data;
    }

    return {
      goPage,
      isLoading,
      setLoading,
      setEmailAuth,
      isEmailCode,
      userMail,
    };
  },
});
</script>

<style lang="scss">
@import "./index.scss";
</style>

<style lang="scss">
.login-container {
  .el-input__wrapper {
    background-color: transparent;
    box-shadow: none;
    padding: 0px;
  }

  .el-input input {
    background: transparent;
    border: 0px;
    -webkit-appearance: none;
    border-radius: 0px;
    padding: 10px 5px 10px 15px;
    height: 42px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
  //hiden the input border
  .el-input__inner {
    box-shadow: none !important;
  }

  .el-button {
    height: 42px;
  }
}
</style>
