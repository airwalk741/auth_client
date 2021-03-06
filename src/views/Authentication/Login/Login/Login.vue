<template>
  <el-form
    ref="refloginForm"
    class="login-form"
    :model="loginForm"
    :rules="rules"
    @keyup.enter="onSubmit"
  >
    <el-form-item prop="email">
      <el-input
        placeholder="Input E-mail"
        v-model="loginForm.email"
        @input="activeBtn"
        :disabled="isLoading"
      />
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        name="password"
        type="password"
        placeholder="Input Password"
        v-model="loginForm.password"
        @input="activeBtn"
        :disabled="isLoading"
      />
    </el-form-item>
    <p
      @click="goPage('PasswordChange')"
      class="text-end text-muted btn-text btn-text mb-0"
    >
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
  </el-form>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import axios from "axios";
import { useRouter } from "vue-router";
import { sendEmailText } from "../../components/EmailAuth/emailText";

interface LoginForm {
  email: string;
  password: string;
}

export default defineComponent({
  emits: ["setLoading", "setEmailAuth"],
  props: {
    isLoading: {
      type: Boolean,
    },
  },

  setup(props, { emit }) {
    const store = useStore();
    const router = useRouter();
    const projectName = process.env.VUE_APP_PROJECTNAME;

    // 로그인 폼
    const loginForm = reactive<LoginForm>({
      email: "",
      password: "",
    });

    // 유효성 검사
    const rules = reactive<any>({
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
      if (isBtn.value) return;

      emit("setLoading", true);

      store
        .dispatch("requestLogin", { ...loginForm })
        .then((res) => {
          console.log(res);
          store.commit("SET_ISLOGIN", true);
          emit("setLoading", false);
        })
        .catch(async (err: any) => {
          const errData = err.response.data;
          const { status } = err.response;
          let errMessage: any;
          if (status !== 401) emit("setLoading", false);
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
              await store.dispatch("requestLogoutWithAccountRequest", data);
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
            const emailResponse: Promise<any> = await store.dispatch(
              "requestSendJoinCode",
              {
                ...loginForm,
                from: "iJoon.noreply",
                subject: `${projectName}에 오신것을 환영합니다.`,
                contentType: "text/html",
                // charset: "EUC-KR",
                charset: "UTF-8",
                body: sendEmailText("join", projectName),
              }
            );

            emit("setLoading", false); // 로딩스피너
            emit("setEmailAuth", true, loginForm.email); // 이메일 인증 열기
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

    function goPage(page: string) {
      router.push({
        name: page,
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
@import "./login.scss";
</style>
