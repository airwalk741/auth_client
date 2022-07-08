<template>
  <div class="password-container">
    <div class="password-form-container">
      <div
        v-loading="isLoading"
        element-loading-background="rgba(238, 238, 238, 0.7)"
      >
        <div class="title-container mb-5">
          <h3 class="title text-center">비밀번호 찾기</h3>
        </div>
        <div class="form_div">
          <PasswordFormVue
            id="password"
            @setLoading="setLoading"
            :isLoading="isLoading"
          />
        </div>
        <p class="text-center text-muted mb-0">
          로그인 하러 가기
          <span class="text-primary fw-semibold btn-text">로그인</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import PasswordFormVue from "./PasswordEmailAuthForm/PasswordForm.vue";
import gsap from "gsap";

export default defineComponent({
  components: {
    PasswordFormVue,
  },
  setup() {
    onMounted(() => {
      gsap.from([".title ", ".text-center", "#password"], {
        duration: 1.5,
        x: 40,
        opacity: 0,
      });
    });

    const isLoading = ref<boolean>(false);
    function setLoading(loading: boolean) {
      isLoading.value = loading;
    }

    return {
      setLoading,
      isLoading,
    };
  },
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>

<style lang="scss">
.password-container {
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
