<template>
  <div class="login-container">
    <el-form
      ref="refloginForm"
      class="login-form"
      :model="loginForm"
      :rules="rules"
      @keyup.enter="onSubmit"
    >
      <div class="title-container">
        <h3 class="title text-center">Login</h3>
      </div>
      <el-form-item prop="email">
        <el-input
          placeholder="Input E-mail"
          v-model="loginForm.email"
          @input="activeBtn"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          name="password"
          type="password"
          placeholder="Input Password"
          v-model="loginForm.password"
          @input="activeBtn"
        />
      </el-form-item>
      <p class="text-end text-muted btn-text btn-text">
        비밀번호를 잊으셨나요?
      </p>
      <el-button
        @click="onSubmit"
        type="primary"
        class="login-btn"
        size="default"
        :disabled="isBtn"
      >
        Submit
      </el-button>
      <p class="text-center text-muted">
        계정이 없으신가요?
        <span
          @click="goPage('Resister')"
          class="text-primary fw-semibold btn-text"
          >회원가입</span
        >
      </p>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import axios from "axios";
import { useRouter } from "vue-router";

interface LoginForm {
  email: string;
  password: string;
}

export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();

    // 로그인 폼
    const loginForm = reactive<LoginForm>({
      email: "",
      password: "",
    });

    // 유효성 검사
    const rules = reactive({
      email: [
        { required: true, message: "이메일을 입력해 주세요.", trigger: "blur" },
        {
          pattern:
            /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/,
          message: "이메일 형식이 아닙니다.",
          trigger: ["blur"],
        },
      ],
      password: [
        {
          required: true,
          message: "비밀번호를 입력해 주세요",
          trigger: "blur",
        },
        {
          max: 16,
          message: "비밀번호는 최대 16자리입니다.",
          trigger: ["blur", "change"],
        },
      ],
    });

    // 버튼 활성화
    const isBtn = ref<boolean>(true);
    function activeBtn(): void {
      const { email, password } = loginForm;
      const emailRef =
        /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/;
      if (emailRef.test(email)) {
        if (password) {
          isBtn.value = false;
          return;
        }
      }
      isBtn.value = true;
    }

    // 로그인 요청
    function onSubmit(): void {
      // if (isBtn.value) return;
      store
        .dispatch("requestLogin", { ...loginForm })
        .then(res => {
          console.log(res);
          store.commit("setIsLogin", true);
        })
        .catch(async (err: any) => {
          const errData = err.response.data;
          const { status } = err.response;

          let errMessage;

          try {
            errMessage =
              errData.message !== undefined ? JSON.parse(errData.message) : "";
          } catch {
            //
          }

          if (status === 429) {
            // 오래전에 로그인 했던것 삭제
            const { login_infos } = errMessage;
            let targetRemove: string | undefined;
            let timeNumber = Number.MAX_SAFE_INTEGER;
            for (let [key, value] of Object.entries<any>(login_infos)) {
              if (timeNumber > Number(value.date)) {
                targetRemove = key;
              }
            }
            const data = {
              ...loginForm,
              login_key: targetRemove,
            };

            // 중복 로그인 제거 후 바로 로그인
            try {
              await store.dispatch("requestRemoveToken", data);
              onSubmit();
            } catch (error: any) {
              const errStatus = error.response.status;
              if (errStatus === 404) {
                ElMessage({
                  showClose: true,
                  message: `이미 로그아웃된 정보입니다. 새로고침을 시도해 주세요.`,
                  type: "warning",
                });
              } else {
                console.log(error.response);
                ElMessage({
                  showClose: true,
                  message: `관리자에게 문의해 주세요.`,
                  type: "error",
                });
              }
            }
          } else if (status === 401) {
            // 인증 대기 유저
          } else if (status === 404 || status === 400) {
            // 이메일, 비밀번호 틀렸을 때
            ElMessage({
              showClose: true,
              message: `이메일 또는 비밀번호가 올바르지 않습니다.`,
              type: "warning",
              grouping: true,
            });
          } else if (status === 409) {
            // 로그인 시간 제한
            const { allowed_after } = errMessage;
            ElMessage({
              showClose: true,
              message: `${allowed_after}초 후 다시 이용해 주세요.`,
              type: "warning",
              grouping: true,
            });
            console.log(errMessage);
            // 로그인 허용 시간
          } else if (status > 499) {
            // 서버에러
            ElMessage({
              showClose: true,
              message: `서버에러 입니다. 관리자에게 문의하세요.`,
              type: "error",
              grouping: true,
            });
          } else if (status < 400 && status > 299) {
            // 네트워크 에러
            ElMessage({
              showClose: true,
              message: `네트워크 에러입니다. 관리자에게 문의하세요.`,
              type: "error",
              grouping: true,
            });
          }
        });
    }

    // 페이지 이동
    function goPage(data: string) {
      router.push({
        name: data,
      });
    }

    return {
      loginForm,
      rules,
      onSubmit,
      activeBtn,
      isBtn,
      goPage,
    };
  },
});
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;
.login-container {
  height: 100vh;
  width: 100%;
  background-color: #2d3a4b;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-form {
    width: 500px;
    background-color: $light_gray;
    padding: 40px;
    border-radius: 10px;
  }
  .title-container {
    .title {
      font-size: 25px;
      color: $bg;
      margin: 0px auto 25px auto;
      text-align: center;
      font-weight: bold;
    }
  }
}

.svg-container {
  padding-left: 6px;
  color: $dark_gray;
  text-align: center;
  width: 30px;
}

.login-btn {
  width: 100%;
  margin-bottom: 30px;
}

.btn-text {
  font-size: 14px;
  cursor: pointer;
  &:hover {
    color: crimson !important;
  }
}
</style>

<style lang="scss">
//css 样式重置 增加个前缀避免全局污染
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
