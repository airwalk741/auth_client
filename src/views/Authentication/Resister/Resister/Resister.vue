<template>
  <el-form
    ref="refresisterForm"
    class="resister-form"
    :model="resisterForm"
    :rules="rules"
    @keyup.enter="onSubmit('Resister')"
    label-position="top"
  >
    <!-- 이메일 -->
    <el-form-item prop="email" label="E-mail">
      <el-input
        placeholder="Input E-mail"
        v-model="resisterForm.email"
        @input="activeBtn"
      />
    </el-form-item>

    <!-- 패스워드 -->
    <el-form-item prop="password" label="password">
      <el-input
        name="password"
        type="password"
        placeholder="Input Password"
        v-model="resisterForm.password"
        @input="activeBtn"
      />
    </el-form-item>

    <!-- 패스워드 확인 -->
    <el-form-item prop="passwordConfirm" label="password confirmation">
      <el-input
        name="passwordConfirm"
        type="password"
        placeholder="Input Password Confirmation"
        v-model="resisterForm.passwordConfirm"
        @input="activeBtn"
      />
    </el-form-item>

    <!-- 닉네임 -->
    <el-form-item prop="name" label="nick-name">
      <el-input
        name="name"
        type="text"
        placeholder="Input Nick-Name"
        v-model="resisterForm.name"
        @input="activeBtn"
      />
    </el-form-item>
    <el-button
      @click="onSubmit('Resister')"
      type="primary"
      class="resister-btn"
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
import { sendEmailText } from "@/views/Authentication/components/EmailAuth/emailText";

interface ResisterForm {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

export default defineComponent({
  components: {},
  emits: ["setLoading", "setEmailAuth"],
  setup(props, { emit }) {
    const store = useStore();
    const projectName = process.env.VUE_APP_PROJECTNAME;

    // 회원가입 폼
    const refresisterForm = ref<any>(null);
    const resisterForm = reactive<ResisterForm>({
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
    });

    // 유효성 검사
    const validatePassword = (rule: any, value: string, callback: any) => {
      if (value === "") {
        callback(new Error("비밀번호는 필수 입력값입니다."));
      } else {
        if (resisterForm.password !== "") {
          if (!refresisterForm.value) return;
          refresisterForm.value.validateField("passwordConfirm", () => null);
        }
        callback();
      }
    };

    const validatePasswordConfirm = (
      rule: any,
      value: string,
      callback: any
    ) => {
      if (value === "") {
        callback(new Error("비밀번호 확인은 필수 입력값입니다."));
      } else if (value !== resisterForm.password) {
        callback(new Error("비밀번호와 맞지 않습니다."));
      } else {
        callback();
      }
    };

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
          message: "비밀번호를 입력해 주세요.",
          trigger: "blur",
        },
        {
          pattern: /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,16}$/,
          message:
            "영어, 숫자, 특수문자를 최소 하나씩 포함한 9~16자리 ( ! @ # $ % ^ * + = - )",
          trigger: ["change", "blur"],
        },
        { validator: validatePassword, trigger: ["change", "blur"] },
      ],
      passwordConfirm: [
        {
          required: true,
          message: "비밀번호 확인을 입력해 주세요.",
          trigger: "blur",
        },
        {
          pattern: /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,16}$/,
          message:
            "영어, 숫자, 특수문자를 최소 하나씩 포함한 9~16자리 ( ! @ # $ % ^ * + = - )",
          trigger: ["change", "blur"],
        },
        { validator: validatePasswordConfirm, trigger: ["change", "blur"] },
      ],
      name: [
        {
          required: true,
          message: "닉네임을 입력해 주세요.",
          trigger: ["change", "blur"],
        },
        {
          min: 5,
          message: "닉네임의 길이는 최소 5글자입니다.",
          trigger: ["change", "blur"],
        },
        {
          max: 15,
          message: "닉네임의 길이는 최대 15글자입니다.",
          trigger: ["change", "blur"],
        },
      ],
    });

    // 버튼 활성화
    const isBtn = ref<boolean>(true);
    function activeBtn(): void {
      const { email, password, passwordConfirm, name } = resisterForm;
      const emailRef =
        /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/;

      const passwordRef =
        /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,16}$/;

      if (emailRef.test(email)) {
        if (passwordRef.test(password)) {
          if (password === passwordConfirm) {
            if (name.length > 4 && name.length < 16) {
              isBtn.value = false;
              return;
            }
          }
        }
      }
      isBtn.value = true;
    }

    // 회원가입 요청
    async function onSubmit(requestType: string) {
      if (isBtn.value) return;
      emit("setLoading", true);
      try {
        const resisterResponse: Promise<any> = await store.dispatch(
          "requestJoin",
          {
            ...resisterForm,
          }
        );
        const emailResponse: Promise<any> = await store.dispatch(
          "requestSendJoinCode",
          {
            ...resisterForm,
            from: "iJoon.noreply",
            subject: `${projectName}에 오신것을 환영합니다.`,
            contentType: "text/html",
            // charset: "EUC-KR",
            charset: "UTF-8",
            body: sendEmailText("join", projectName),
          }
        );
        emit("setLoading", false); // 로딩스피너
        emit("setEmailAuth", true, resisterForm.email); // 이메일 인증 열기
        // 이메일 인증으로 이동
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
        } else if (status === 409) {
          ElMessage({
            showClose: true,
            message: `이미 가입된 회원입니다.`,
            type: "warning",
            grouping: true,
          });
        } else {
          console.log("서버에러");
        }
      }
    }

    return {
      resisterForm,
      rules,
      onSubmit,
      activeBtn,
      isBtn,
      refresisterForm,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./resister.scss";
</style>
