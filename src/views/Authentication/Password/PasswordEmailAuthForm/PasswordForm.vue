<template>
  <el-form
    ref="refpasswordForm"
    class="password-form"
    :model="passwordForm"
    :rules="rules"
    @keyup.enter="onSubmit"
    v-if="step !== 2"
  >
    <p class="text-end text-muted mb-2" v-if="step > 0" @click="reSendEmail">
      <span class="text-primary fw-semibold btn-text">재전송</span>
    </p>

    <input type="text" style="display: none" />

    <el-form-item prop="email">
      <el-input
        placeholder="Input E-mail"
        v-model="passwordForm.email"
        @input="activeBtn"
        :disabled="isLoading || step !== 0 ? true : false"
      />
    </el-form-item>

    <el-form-item prop="code" v-if="step > 0" id="code">
      <el-input
        id="code"
        placeholder="Input Code"
        v-model="passwordForm.code"
        @input="(v) => convertNumber(v)"
        maxlength="6"
      />
    </el-form-item>

    <el-button
      @click="onSubmit"
      type="primary"
      class="password-btn"
      size="default"
      :disabled="isBtn"
    >
      Submit
    </el-button>
  </el-form>
  <PasswordChangeForm v-else @changePassword="changePassword" />
</template>

<script lang="ts">
import { defineComponent, onUpdated, reactive, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { sendEmailText } from "../../components/EmailAuth/emailText";
import { ElMessage } from "element-plus";
import gsap from "gsap";
import PasswordChangeForm from "@/views/Authentication/Password/PasswordChangeForm/PasswordChangeForm.vue";

interface PasswordForm {
  email: string;
  code: string;
}

interface PasswordChangeData {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export default defineComponent({
  components: {
    PasswordChangeForm,
  },
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

    const step = ref(0);

    // 로그인 폼
    const passwordForm = reactive<PasswordForm>({
      email: "",
      code: "",
    });

    // 유효성 검사
    const rules = reactive<any>({
      email: [
        { required: true, message: "이메일을 입력해 주세요.", trigger: "blur" },
        {
          pattern:
            /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/,
          message: "이메일 형식이 아닙니다.",
          trigger: ["change", "blur"],
        },
      ],
    });

    // 버튼 활성화
    const isBtn = ref<boolean>(true);
    function activeBtn(): void {
      const { email, code } = passwordForm;
      const emailRef =
        /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/;
      if (emailRef.test(email)) {
        if (step.value) {
          if (code) {
            isBtn.value = false;
            return;
          }
        } else {
          isBtn.value = false;
          return;
        }
      }
      isBtn.value = true;
    }

    // 요청
    async function onSubmit() {
      if (isBtn.value) return;
      emit("setLoading", true);

      // 이메일 요청
      if (!step.value) {
        const emailData = {
          from: "iJoon.noreply",
          subject: `${projectName}에 오신것을 환영합니다.`,
          contentType: "text/html",
          // charset: "EUC-KR",
          charset: "UTF-8",
          body: sendEmailText("join", projectName),
        };

        try {
          await store.dispatch("requestSendResetCode", {
            ...emailData,
            ...passwordForm,
          });
          console.log("성공");
          step.value = 1;
          emit("setLoading", false);
        } catch (err) {
          emit("setLoading", false);
          const { status } = err.response;
          if (status === 404) {
            ElMessage({
              showClose: true,
              message: `가입한 정보가 없습니다.`,
              type: "warning",
              grouping: true,
            });
          } else {
            ElMessage({
              showClose: true,
              message: `${err}`,
              type: "error",
              grouping: true,
            });
          }
        }
      } else {
        // 코드 인증
        try {
          await store.dispatch("requestVerifyResetCode", { ...passwordForm });
          emit("setLoading", false);
          step.value = 2;
        } catch (err) {
          emit("setLoading", false);
          const { status } = err.response;
          if (status === 409) {
            ElMessage({
              showClose: true,
              message: `인증횟수를 초과했습니다. 재송전을 통해 인증을 다시 진행해 주세요.`,
              type: "warning",
              grouping: true,
            });
          } else if (status === 400) {
            ElMessage({
              showClose: true,
              message: `인증코드가 맞지 않습니다.`,
              type: "warning",
              grouping: true,
            });
          }
        }
      }
    }

    // 페이지 이동
    function goPage(page: string) {
      router.push({
        name: page,
      });
    }

    // 숫자만 입력 가능하도록
    function convertNumber(v: string) {
      let replaceNumber = v.replace(/\:/g, "");
      replaceNumber = replaceNumber.replace(/[^0-9]/g, "");
      passwordForm.code = replaceNumber;
      activeBtn();
    }

    // 변경하기
    async function changePassword(data: PasswordChangeData) {
      if (step.value !== 2) return;
      const { email, code } = passwordForm;
      const { password } = data;
      emit("setLoading", true);
      try {
        await store.dispatch("requestResetPassword", {
          email,
          code,
          password,
        });
        emit("setLoading", false);
        router.push({
          name: "Home",
        });
      } catch (err) {
        emit("setLoading", false);
        ElMessage({
          showClose: true,
          message: `관리자에게 문의하세요.`,
          type: "error",
          grouping: true,
        });
      }
    }

    // 재전송
    async function reSendEmail() {
      emit("setLoading", true);
      const emailData = {
        from: "iJoon.noreply",
        subject: `${projectName}에 오신것을 환영합니다.`,
        contentType: "text/html",
        // charset: "EUC-KR",
        charset: "UTF-8",
        body: sendEmailText("join", projectName),
      };

      try {
        await store.dispatch("requestSendResetCode", {
          ...emailData,
          ...passwordForm,
        });
        console.log("성공");
        emit("setLoading", false);
      } catch (err) {
        emit("setLoading", false);
        const { status } = err.response;
        ElMessage({
          showClose: true,
          message: `관리자에게 문의하세요.`,
          type: "error",
          grouping: true,
        });
      }
    }

    return {
      passwordForm,
      rules,
      onSubmit,
      activeBtn,
      isBtn,
      goPage,
      step,
      convertNumber,
      changePassword,
      reSendEmail,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./password_form.scss";
</style>

<style lang="scss">
.re_btn {
  .el-button {
    padding: 0px;
  }
}
</style>
