<template>
  <div>
    <el-form
      ref="refemailForm"
      class="email-form"
      :model="emailForm"
      @keyup.enter="onSubmit"
      label-position="top"
      :style="`${!isEmailCode ? 'display: none' : ''}`"
      :rules="rules"
    >
      <div class="title-container">
        <p class="title text-center">
          가입하신 이메일로 인증코드를 보냈습니다.
        </p>
        <p class="title text-center">인증을 통해 회원가입을 완료해 주세요.</p>
      </div>

      <!-- 이메일 -->
      <el-form-item prop="email" label="E-mail">
        <el-input placeholder="Input E-mail" :value="userMail" disabled />
      </el-form-item>

      <!-- 인증 코드 -->
      <el-form-item prop="code" label="Code">
        <el-input
          placeholder="Input Code"
          v-model="emailForm.code"
          @input="v => convertNumber(v)"
          maxlength="6"
        />
      </el-form-item>

      <el-button
        :disabled="isBtn"
        type="primary"
        class="email-btn"
        size="default"
        @click="onSubmit"
      >
        Submit
      </el-button>
      <p class="text-center text-muted mb-0">
        인증번호를 재발송 하시겠습니까?
        <span @click="reSendMail" class="text-primary fw-semibold btn-text"
          >재전송</span
        >
      </p>
    </el-form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { sendEmailText } from "./emailText";

interface EmailForm {
  email: any;
  code: string;
}

export default defineComponent({
  props: {
    isEmailCode: {
      type: Boolean,
    },
    userMail: {
      type: String,
    },
  },
  emits: ["setLoading"],
  setup(props, { emit }) {
    const store = useStore();
    const projectName = process.env.VUE_APP_PROJECTNAME;
    const refemailForm = ref(null);
    const emailForm = reactive<EmailForm>({
      email: computed(() => props.userMail),
      code: "",
    });

    // 숫자만 입력 가능하도록
    function convertNumber(v: string) {
      let replaceNumber = v.replace(/\:/g, "");
      replaceNumber = replaceNumber.replace(/[^0-9]/g, "");
      emailForm.code = replaceNumber;
      activeBtn();
    }

    // 유효성 검사
    const rules = reactive<any>({
      code: [
        {
          required: true,
          message: "인증코드를 입력해 주세요.",
          trigger: "blur",
        },
      ],
    });

    // 버튼 활성화
    const isBtn = ref<boolean>(true);
    function activeBtn(): void {
      const { email, code } = emailForm;
      if (code) {
        isBtn.value = false;
        return;
      }
      isBtn.value = true;
    }

    // 이메일 인증
    async function onSubmit() {
      emit("setLoading", true);
      try {
        const { email, code } = emailForm;
        const response = await store.dispatch("requestVerifyJoin", {
          email,
          code,
        });
        emit("setLoading", false);
        ElMessage({
          showClose: true,
          message: "인증완료",
          type: "success",
        });
      } catch (error) {
        emit("setLoading", false);
        const errStatus = error.response.status;

        if (errStatus === 404) {
          ElMessage({
            showClose: true,
            message: "이메일을 다시 확인해 주세요.",
            type: "error",
          });
        } else if (errStatus === 409) {
          ElMessage({
            showClose: true,
            message:
              "인증 횟수 초과입니다. 재전송을 통해 인증을 다시 진행해 주세요.",
            type: "warning",
          });
        } else if (errStatus === 400) {
          ElMessage({
            showClose: true,
            message: "인증번호를 다시 확인해 주세요.",
            type: "warning",
          });
        } else {
          ElMessage({
            showClose: true,
            message: "관리자에게 문의하세요.",
            type: "error",
          });
        }
      }
    }

    // 이메일 재전송
    async function reSendMail() {
      emit("setLoading", true);
      try {
        const emailResponse: Promise<any> = await store.dispatch(
          "requestSendJoinCode",
          {
            ...emailForm,
            from: "iJoon.noreply",
            subject: `${projectName}에 오신것을 환영합니다.`,
            contentType: "text/html",
            // charset: "EUC-KR",
            charset: "UTF-8",
            body: sendEmailText("join", projectName),
          }
        );
        emit("setLoading", false);
      } catch (error: any) {
        emit("setLoading", false);
        const status = error.response.status;
        if (status === 400) {
          ElMessage({
            showClose: true,
            message: `이메일 형식을 확인해 주세요.`,
            type: "warning",
            grouping: true,
          });
        } else {
          console.log("서버에러");
        }
      }
    }

    return {
      refemailForm,
      onSubmit,
      emailForm,
      convertNumber,
      rules,
      activeBtn,
      isBtn,
      reSendMail,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./emailAuth.scss";
</style>

<style lang="scss">
.remail_container {
  padding-right: 0px;
}
</style>
