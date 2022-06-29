<template>
  <div class="resister-container">
    <div class="resister-form-container">
      <div
        v-loading="isLoading"
        element-loading-background="rgba(238, 238, 238, 0.7)"
      >
        <div class="title-container">
          <h3 class="title text-center">
            {{ isEmailCode ? "Email Auth" : "Resister" }}
          </h3>
        </div>
        <div class="form-div">
          <ResisterVue
            id="resister"
            @setLoading="setLoading"
            @setEmailAuth="setEmailAuth"
          />
          <EmailAuthVue
            id="email"
            :userMail="userMail"
            :isEmailCode="isEmailCode"
            @setLoading="setLoading"
          />
        </div>
        <p class="text-center text-muted" style="margin: 0px">
          기존 가입한 이메일이 존재합니까?
          <span
            @click="goPage('Login')"
            class="text-primary fw-semibold btn-text"
            >로그인</span
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ResisterVue from "./Resister.vue";
import EmailAuthVue from "../components/EmailAuth/EmailAuth.vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import gsap from "gsap";

export default defineComponent({
  components: {
    ResisterVue,
    EmailAuthVue,
  },
  setup() {
    const store = useStore();
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

    // 이메일 인증
    const isEmailCode = ref(false);
    const userMail = ref<string>("airwalk741@naver.com");
    function setEmailAuth(data: boolean, email: string) {
      gsap.to("#resister", { duration: 0, opacity: 0, display: "none" });
      gsap.from("#email", {
        duration: 1.5,
        x: 40,
        opacity: 100,
      });
      userMail.value = email;
      isEmailCode.value = true;
    }

    return {
      goPage,
      isEmailCode,
      isLoading,
      setLoading,
      setEmailAuth,
      userMail,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>

<style lang="scss">
.resister-container {
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
