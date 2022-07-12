<template>
  <div class="password_form">
    <p class="text-start text-muted mb-2">
      변경하고자 하는 비밀번호를 입력해 주세요.
    </p>

    <el-form
      ref="refpasswordForm"
      :model="passwordForm"
      :rules="rules"
      @keyup.enter="onSubmit"
    >
      <el-form-item prop="password">
        <el-input
          name="password"
          type="password"
          placeholder="Input Password"
          v-model="passwordForm.password"
          @input="activeBtn"
          :disabled="isLoading"
        />
      </el-form-item>

      <el-form-item prop="passwordConfirmation">
        <el-input
          name="passwordConfirmation"
          type="password"
          placeholder="Input password confirmation"
          v-model="passwordForm.passwordConfirmation"
          @input="activeBtn"
          :disabled="isLoading"
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
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { sendEmailText } from "../../components/EmailAuth/emailText";
import gsap from "gsap";

interface passwordForm {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export default defineComponent({
  emits: ["setLoading", "setEmailAuth", "changePassword"],
  props: {
    isLoading: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const router = useRouter();
    const projectName = process.env.VUE_APP_PROJECTNAME;

    onMounted(() => {
      gsap.from([".password_form"], {
        duration: 2,
        opacity: 0,
      });
    });

    // 패스워드 변경 폼
    const refpasswordForm = ref<HTMLFormElement>(null);
    const passwordForm = reactive<passwordForm>({
      email: "",
      password: "",
      passwordConfirmation: "",
    });

    // 유효성 검사
    const validatePassword = (rule: any, value: string, callback: any) => {
      if (value === "") {
        callback(new Error("비밀번호는 필수 입력값입니다."));
      } else {
        if (passwordForm.password !== "") {
          if (!refpasswordForm.value) return;
          refpasswordForm.value.validateField(
            "passwordConfirmation",
            () => null
          );
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
      } else if (value !== passwordForm.password) {
        callback(new Error("비밀번호와 맞지 않습니다."));
      } else {
        callback();
      }
    };
    const rules = reactive<any>({
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
      passwordConfirmation: [
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
    });

    // 버튼 활성화
    const isBtn = ref<boolean>(true);
    function activeBtn(): void {
      const { passwordConfirmation, password } = passwordForm;
      const passwordRef =
        /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,16}$/;
      if (passwordRef.test(password)) {
        if (password === passwordConfirmation) {
          isBtn.value = false;
          return;
        }
      }
      isBtn.value = true;
    }

    // 변경 요청
    function onSubmit(): void {
      if (isBtn.value) return;
      emit("changePassword", { ...passwordForm });
    }

    function goPage(page: string) {
      router.push({
        name: page,
      });
    }

    return {
      passwordForm,
      rules,
      onSubmit,
      activeBtn,
      isBtn,
      goPage,
      refpasswordForm,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./password_change_form.scss";
</style>
