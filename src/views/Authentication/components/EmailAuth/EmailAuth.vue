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
        <div class="d-flex justify-content-center">
          <el-button type="primary" text @click="reSendMail">재전송</el-button>
        </div>
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
      >
        Submit
      </el-button>
    </el-form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";

interface EmailForm {
  email: string | unknown;
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

    const refemailForm = ref(null);
    const emailForm = reactive<EmailForm>({
      email: computed(() => props.userMail).value,
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
        const response = await store.dispatch("requestVerifyJoin", {
          ...emailForm,
        });
      } catch (error) {
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
